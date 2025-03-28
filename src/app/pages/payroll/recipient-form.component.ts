// recipient-form.component.ts
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { RecipientService } from '../../service/recipient.service';
import { Recipient } from '../../models/recipient.model';

export enum EMomoNetworks {
  MTN = "mtn",
  VODAFONE = "vodafone",
  AIRTELTIGO = "airteltigo",
}

const PaymentAccountType = {
  BANK: "bank",
  MOMO: "momo",
  BTC: "btc",
  TRC20: "trc20",
  ERC20: "erc20",
  SOLANA: "solana"
};

@Component({
  selector: 'app-recipient-form',
  templateUrl: './recipient-form.component.html',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    RouterModule
  ],
  styleUrls: ['./recipient-form.component.scss']
})
export class RecipientFormComponent implements OnInit {
  recipientForm: FormGroup;
  loading = false;
  submitting = false;
  error = '';
  success = '';
  PaymentAccountType = PaymentAccountType;

  
  isEditMode = false;
  recipientId: string | null = null;
  
  // Enum for the template
  accountTypes = Object.values(PaymentAccountType);
    momoNetworks = Object.values(EMomoNetworks);
    
    // Bank options from API
    bankOptions: any[] = [];
    showBankDropdown = false;
    showMomoDropdown = false;
    showIssuerInput = false;
  
  
  // Getting merchantId from localStorage
  merchantId: string = '';
  
  constructor(
    private fb: FormBuilder,
    private recipientService: RecipientService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.getMerchantIdFromLocalStorage();
    
    this.recipientForm = this.createForm();

    // Watch for account type changes
    this.recipientForm.get('accountType')?.valueChanges.subscribe(type => {
      this.handleAccountTypeChange(type);
    });
  }

  ngOnInit(): void {
    // Check if we're in edit mode (URL has an ID)
    this.recipientId = this.route.snapshot.paramMap.get('id');
    this.isEditMode = !!this.recipientId;
    
    if (this.isEditMode && this.recipientId && this.merchantId) {
      this.loading = true;
      // Load recipient data in edit mode
      this.recipientService.getRecipientById(this.recipientId)
        .subscribe({
          next: (response) => {
            const recipient = response.data;
            this.recipientForm.patchValue({
              recipientName: recipient.recipientName,
              accountName: recipient.accountName,
              accountNumber: recipient.accountNumber,
              accountIssuer: recipient.accountIssuer,
              accountType: recipient.accountType,
              phoneNumber: recipient.phoneNumber,
              email: recipient.email,
              department: recipient.department,
              position: recipient.position,
              merchantId: this.merchantId
            });
            
            // Handle the account type UI based on loaded data
            this.handleAccountTypeChange(recipient.accountType);
            
            this.loading = false;
          },
          error: (error) => {
            this.error = error.error?.message || 'Failed to load recipient details';
            this.loading = false;
          }
        });
    } else {
      // For new recipients, load banks if default is BANK
      if (this.recipientForm.get('accountType')?.value === PaymentAccountType.BANK) {
        this.loadBanks();
      }
    }
  }
  
  handleAccountTypeChange(type: keyof typeof PaymentAccountType): void {
    // Reset all visibility flags
    this.showBankDropdown = false;
    this.showMomoDropdown = false;
    this.showIssuerInput = false;
    
    // Clear validators for accountIssuer initially
    this.recipientForm.get('accountIssuer')?.clearValidators();
    
    // Set validators and UI based on account type
    switch (type) {
      case PaymentAccountType.BANK:
        this.showBankDropdown = true;
        this.recipientForm.get('accountIssuer')?.setValidators([Validators.required]);
        this.loadBanks();
        break;
        
      case PaymentAccountType.MOMO:
        this.showMomoDropdown = true;
        this.recipientForm.get('accountIssuer')?.setValidators([Validators.required]);
        break;
        
      case PaymentAccountType.BTC:
      case PaymentAccountType.TRC20:
      case PaymentAccountType.ERC20:
      case PaymentAccountType.SOLANA:
        // For crypto, we don't need issuer
        this.showIssuerInput = false;
        break;
        
      default:
        // For other types, show regular input
        this.showIssuerInput = true;
        this.recipientForm.get('accountIssuer')?.setValidators([Validators.required]);
        break;
    }
    
    // Update validation
    this.recipientForm.get('accountIssuer')?.updateValueAndValidity();
  }
  
  loadBanks(): void {
    this.recipientService.getBanks().subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.bankOptions = response.data;
        }
      },
      error: (error) => {
        console.error('Failed to load banks:', error);
        this.error = 'Failed to load bank list. Please try again.';
      }
    });
  }
  
  getMerchantIdFromLocalStorage(): void {
    const loginStr = localStorage.getItem('PLOGIN');
    if (loginStr) {
      try {
        const login = JSON.parse(loginStr);
        if (login && login.user && login.user.merchantId && login.user.merchantId._id) {
          this.merchantId = login.user.merchantId._id;
          console.log("Merchant ID retrieved from localStorage:", this.merchantId);
        } else {
          this.error = 'Merchant ID not found in user data';
          console.error("Failed to find merchantId in login object:", login);
        }
      } catch (e) {
        this.error = 'Failed to parse login data from localStorage';
        console.error("Error parsing localStorage login data:", e);
      }
    } else {
      this.error = 'Login data not found in localStorage';
      console.error("No PLOGIN data in localStorage");
    }
  }
  
  createForm(): FormGroup {
    return this.fb.group({
      recipientName: ['', [Validators.required]],
      accountName: ['', [Validators.required]],
      accountNumber: ['', [Validators.required]],
      accountIssuer: ['', [Validators.required]],
      accountType: [PaymentAccountType.BANK, [Validators.required]],
      phoneNumber: ['', [Validators.pattern(/^\+?[0-9\s-]{10,15}$/)]],
      email: ['', [Validators.email]],
      department: [''],
      position: [''],
      merchantId: [this.merchantId]
    });
  }
  
  onSubmit(): void {
    if (this.recipientForm.invalid) {
      this.markFormGroupTouched(this.recipientForm);
      return;
    }
    
    // Ensure merchantId is set
    this.recipientForm.get('merchantId')?.setValue(this.merchantId);
    
    this.submitting = true;
    this.error = '';
    this.success = '';
    
    if (this.isEditMode && this.recipientId) {
      // Update existing recipient
      this.recipientService.updateRecipient(this.recipientId, this.recipientForm.value)
        .subscribe({
          next: (response) => {
            this.success = response.message || 'Recipient updated successfully';
            setTimeout(() => {
              this.router.navigate(['/recipients']);
            }, 2000);
          },
          error: (error) => {
            this.error = error.error?.message || 'Failed to update recipient';
            this.submitting = false;
          },
          complete: () => {
            this.submitting = false;
          }
        });
    } else {
      // Create new recipient
      this.recipientService.createRecipient(this.recipientForm.value)
        .subscribe({
          next: (response) => {
            this.success = response.message || 'Recipient created successfully';
            setTimeout(() => {
              this.router.navigate(['/recipients']);
            }, 2000);
          },
          error: (error) => {
            this.error = error.error?.message || 'Failed to create recipient';
            this.submitting = false;
          },
          complete: () => {
            this.submitting = false;
          }
        });
    }
  }
  
  // Helper method to mark all controls as touched
  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched();
      
      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }
  
  cancel(): void {
    this.router.navigate(['/recipients']);
  }
}