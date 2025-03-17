// create-payroll.component.ts
import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { PayrollService } from '../../service/payroll.service';
import { RecipientService } from '../../service/recipient.service';
import { Recipient } from '../../models/recipient.model';

@Component({
  selector: 'app-create-payroll',
  templateUrl: './create-payroll.component.html',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    RouterModule
  ],
  styleUrls: ['./create-payroll.component.scss']
})
export class CreatePayrollComponent implements OnInit {
  payrollForm: FormGroup;
  recipients: Recipient[] = [];
  filteredRecipients: Recipient[] = [];
  loadingRecipients = false;
  submitting = false;
  error = '';
  success = '';
  
  // Getting merchantId from localStorage
  merchantId: string = '';
  
  constructor(
    private fb: FormBuilder,
    private payrollService: PayrollService,
    private recipientService: RecipientService,
    private router: Router
  ) {
    this.getMerchantIdFromLocalStorage();
    
    this.payrollForm = this.fb.group({
      name: ['', [Validators.required]],
      description: [''],
      merchantId: [this.merchantId, [Validators.required]],
      transactions: this.fb.array([])
    });
  }

  ngOnInit(): void {
    this.loadRecipients();
    this.addTransaction(); // Add at least one transaction row initially
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
  
  loadRecipients(): void {
    if (!this.merchantId) {
      this.error = 'Merchant ID is required to load recipients';
      return;
    }
    
    this.loadingRecipients = true;
    this.recipientService.getRecipients(this.merchantId)
      .subscribe({
        next: (response) => {
          this.recipients = response.data;
          this.filteredRecipients = [...this.recipients];
          this.loadingRecipients = false;
        },
        error: (error) => {
          this.error = error.error?.message || 'Failed to load recipients';
          this.loadingRecipients = false;
        }
      });
  }

  get transactions(): FormArray {
    return this.payrollForm.get('transactions') as FormArray;
  }

  addTransaction(): void {
    const transaction = this.fb.group({
      recipientId: ['', [Validators.required]],
      amount: [0, [Validators.required, Validators.min(1)]],
      narration: ['', [Validators.required]],
      sendSms: [false]
    });
    
    this.transactions.push(transaction);
  }

  removeTransaction(index: number): void {
    this.transactions.removeAt(index);
  }

  getRecipientById(id: string): Recipient | undefined {
    return this.recipients.find(r => r._id === id);
  }

  updateNarration(index: number): void {
    const transactionGroup = this.transactions.at(index) as FormGroup;
    const recipientId = transactionGroup.get('recipientId')?.value;
    
    if (recipientId) {
      const recipient = this.getRecipientById(recipientId);
      if (recipient) {
        // Set a default narration if empty
        if (!transactionGroup.get('narration')?.value) {
          const defaultNarration = `Payment to ${recipient.recipientName}`;
          transactionGroup.get('narration')?.setValue(defaultNarration);
        }
      }
    }
  }

  filterRecipients(event: Event): void {
    const target = event.target as HTMLInputElement;
    const searchTerm = target.value.toLowerCase();
    
    this.filteredRecipients = this.recipients.filter(recipient => 
      recipient.recipientName.toLowerCase().includes(searchTerm) || 
      recipient.accountNumber.includes(searchTerm)
    );
  }

  calculateTotal(): number {
    return this.transactions.controls.reduce((total, control) => {
      return total + (+control.get('amount')?.value || 0);
    }, 0);
  }

  onSubmit(): void {
    if (this.payrollForm.invalid) {
      this.markFormGroupTouched(this.payrollForm);
      return;
    }
    
    if (this.transactions.length === 0) {
      this.error = 'Please add at least one transaction';
      return;
    }
    
    this.submitting = true;
    this.error = '';
    this.success = '';
    
    // Update merchantId in case it wasn't set properly initially
    this.payrollForm.get('merchantId')?.setValue(this.merchantId);
    
    this.payrollService.createPayroll(this.payrollForm.value)
      .subscribe({
        next: (response) => {
          this.success = response.message || 'Payroll created successfully';
          // Navigate to payroll details after a short delay
          setTimeout(() => {
            this.router.navigate(['/payroll', response.data.payrollId]);
          }, 2000);
        },
        error: (error) => {
          this.error = error.error?.message || 'Failed to create payroll';
          this.submitting = false;
        },
        complete: () => {
          this.submitting = false;
        }
      });
  }

  // Helper method to mark all controls as touched
  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched();
      
      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      } else if (control instanceof FormArray) {
        control.controls.forEach(c => {
          if (c instanceof FormGroup) {
            this.markFormGroupTouched(c);
          } else {
            c.markAsTouched();
          }
        });
      }
    });
  }
}