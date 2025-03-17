// create-recurring-payroll.component.ts
import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { RecurringPayrollService } from '../../service/recurring-payroll.service';
import { RecipientService } from '../../service/recipient.service';
import { RecurringFrequency } from '../../models/recurring-payroll.model';
import { Recipient } from '../../models/recipient.model';

@Component({
  selector: 'app-create-recurring-payroll',
  templateUrl: './create-recurring-payroll.component.html',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    RouterModule
  ],
  styleUrls: ['./create-recurring-payroll.component.scss']
})
export class CreateRecurringPayrollComponent implements OnInit {
  recurringPayrollForm: FormGroup;
  allRecipients: Recipient[] = [];
  filteredRecipients: Recipient[] = [];
  loadingRecipients = false;
  submitting = false;
  error = '';
  success = '';
  
  // Enums for template
  frequencyOptions = Object.values(RecurringFrequency);
  daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  daysOfMonth = Array.from({ length: 31 }, (_, i) => i + 1);
  
  // Getting merchantId from localStorage
  merchantId: string = '';
  
  constructor(
    private fb: FormBuilder,
    private recurringPayrollService: RecurringPayrollService,
    private recipientService: RecipientService,
    private router: Router
  ) {
    this.getMerchantIdFromLocalStorage();
    
    this.recurringPayrollForm = this.createForm();
  }

  ngOnInit(): void {
    this.loadRecipients();
    this.onFrequencyChange(); // Set initial visibility of fields
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
      name: ['', [Validators.required]],
      description: [''],
      merchantId: [this.merchantId, [Validators.required]],
      frequency: [RecurringFrequency.MONTHLY, [Validators.required]],
      dayOfMonth: [1, [Validators.required, Validators.min(1), Validators.max(31)]],
      dayOfWeek: [1, [Validators.required, Validators.min(0), Validators.max(6)]],
      timeOfDay: ['09:00', [Validators.required, Validators.pattern(/^([01]\d|2[0-3]):([0-5]\d)$/)]],
      requiresApproval: [true],
      recipients: this.fb.array([])
    });
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
          this.allRecipients = response.data;
          this.filteredRecipients = [...this.allRecipients];
          this.loadingRecipients = false;
        },
        error: (error) => {
          this.error = error.error?.message || 'Failed to load recipients';
          this.loadingRecipients = false;
        }
      });
  }
  
  onFrequencyChange(): void {
    const frequency = this.recurringPayrollForm.get('frequency')?.value;
    
    // Reset validations
    const dayOfMonthControl = this.recurringPayrollForm.get('dayOfMonth');
    const dayOfWeekControl = this.recurringPayrollForm.get('dayOfWeek');
    
    // Clear validators
    dayOfMonthControl?.clearValidators();
    dayOfWeekControl?.clearValidators();
    
    // Apply appropriate validators based on frequency
    if (frequency === RecurringFrequency.MONTHLY) {
      dayOfMonthControl?.setValidators([Validators.required, Validators.min(1), Validators.max(31)]);
    } else if (frequency === RecurringFrequency.WEEKLY || frequency === RecurringFrequency.BIWEEKLY) {
      dayOfWeekControl?.setValidators([Validators.required, Validators.min(0), Validators.max(6)]);
    }
    
    // Update the form
    dayOfMonthControl?.updateValueAndValidity();
    dayOfWeekControl?.updateValueAndValidity();
  }
  
  get recipients(): FormArray {
    return this.recurringPayrollForm.get('recipients') as FormArray;
  }
  
  addRecipient(): void {
    const recipient = this.fb.group({
      recipientId: ['', [Validators.required]],
      amount: [0, [Validators.required, Validators.min(1)]],
      narration: ['', [Validators.required]],
      sendSms: [false]
    });
    
    this.recipients.push(recipient);
  }
  
  removeRecipient(index: number): void {
    this.recipients.removeAt(index);
  }
  
  getRecipientById(id: string): Recipient | undefined {
    return this.allRecipients.find(r => r._id === id);
  }
  
  updateNarration(index: number): void {
    const recipientGroup = this.recipients.at(index) as FormGroup;
    const recipientId = recipientGroup.get('recipientId')?.value;
    
    if (recipientId) {
      const recipient = this.getRecipientById(recipientId);
      if (recipient) {
        // Set a default narration if empty
        if (!recipientGroup.get('narration')?.value) {
          const defaultNarration = `Recurring payment to ${recipient.recipientName}`;
          recipientGroup.get('narration')?.setValue(defaultNarration);
        }
      }
    }
  }
  
  filterRecipients(event: Event): void {
    const target = event.target as HTMLInputElement;
    const searchTerm = target.value.toLowerCase();
    
    this.filteredRecipients = this.allRecipients.filter(recipient => 
      recipient.recipientName.toLowerCase().includes(searchTerm) || 
      recipient.accountNumber.includes(searchTerm)
    );
  }
  
  calculateTotal(): number {
    return this.recipients.controls.reduce((total, control) => {
      return total + (+control.get('amount')?.value || 0);
    }, 0);
  }
  
  onSubmit(): void {
    if (this.recurringPayrollForm.invalid) {
      this.markFormGroupTouched(this.recurringPayrollForm);
      return;
    }
    
    if (this.recipients.length === 0) {
      this.error = 'Please add at least one recipient';
      return;
    }
    
    this.submitting = true;
    this.error = '';
    this.success = '';
    
    // Update merchantId in case it wasn't set properly initially
    this.recurringPayrollForm.get('merchantId')?.setValue(this.merchantId);
    
    // Send only the required fields based on frequency
    const formData = { ...this.recurringPayrollForm.value };
    const frequency = formData.frequency;
    
    if (frequency !== RecurringFrequency.MONTHLY) {
      delete formData.dayOfMonth;
    }
    
    if (frequency !== RecurringFrequency.WEEKLY && frequency !== RecurringFrequency.BIWEEKLY) {
      delete formData.dayOfWeek;
    }
    
    this.recurringPayrollService.createRecurringPayroll(formData)
      .subscribe({
        next: (response) => {
          this.success = response.message || 'Recurring payroll created successfully';
          // Navigate to recurring payroll list after a short delay
          setTimeout(() => {
            this.router.navigate(['/recurring']);
          }, 2000);
        },
        error: (error) => {
          this.error = error.error?.message || 'Failed to create recurring payroll';
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
  
  getFrequencyLabel(frequency: RecurringFrequency): string {
    switch (frequency) {
      case RecurringFrequency.DAILY:
        return 'Daily';
      case RecurringFrequency.WEEKLY:
        return 'Weekly';
      case RecurringFrequency.BIWEEKLY:
        return 'Bi-weekly';
      case RecurringFrequency.MONTHLY:
        return 'Monthly';
      default:
        return frequency;
    }
  }
  
  cancel(): void {
    this.router.navigate(['/recurring']);
  }
}