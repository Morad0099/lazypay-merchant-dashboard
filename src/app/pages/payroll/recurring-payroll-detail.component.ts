// recurring-payroll-detail.component.ts
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { forkJoin } from 'rxjs';
import { RecurringPayrollService } from '../../service/recurring-payroll.service';
import { RecipientService } from '../../service/recipient.service';
import { 
  RecurringPayroll, 
  RecurringFrequency, 
  RecurringStatus, 
  RecipientConfiguration 
} from '../../models/recurring-payroll.model';
import { Recipient } from '../../models/recipient.model';

@Component({
  selector: 'app-recurring-payroll-detail',
  templateUrl: './recurring-payroll-detail.component.html',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    RouterModule
  ],
  styleUrls: ['./recurring-payroll-detail.component.scss']
})
export class RecurringPayrollDetailComponent implements OnInit {
  recurringId: string = '';
  recurringPayroll?: RecurringPayroll;
  configurations: RecipientConfiguration[] = [];
  recipients: Recipient[] = [];
  
  loading = true;
  loadingRecipients = false;
  submitting = false;
  error = '';
  successMessage = '';
  
  // Edit mode
  isEditMode = false;
  editForm: FormGroup;
  
  // Add recipient mode
  isAddRecipientMode = false;
  addRecipientForm: FormGroup;
  
  // Edit recipient mode
  isEditRecipientMode = false;
  editRecipientId: string = '';
  editRecipientForm: FormGroup;
  
  // Pagination
  currentPage = 1;
  pageSize = 10;
  totalItems = 0;
  totalPages = 0;
  
  // Enums for template
  recurringFrequencyOptions = Object.values(RecurringFrequency);
  recurringStatusOptions = Object.values(RecurringStatus);
  daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  daysOfMonth = Array.from({ length: 31 }, (_, i) => i + 1);
  
  // Getting merchantId from localStorage
  merchantId: string = '';
  
  constructor(
    private recurringPayrollService: RecurringPayrollService,
    private recipientService: RecipientService,
    private route: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder
  ) {
    this.getMerchantIdFromLocalStorage();
    
    // Initialize forms
    this.editForm = this.createEditForm();
    this.addRecipientForm = this.createAddRecipientForm();
    this.editRecipientForm = this.createEditRecipientForm();
  }

  ngOnInit(): void {
    this.recurringId = this.route.snapshot.paramMap.get('id') || '';
    if (!this.recurringId) {
      this.error = 'Recurring payroll ID is required';
      this.router.navigate(['/payroll/recurring']);
      return;
    }
    
    this.loadRecurringPayroll();
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
  
  loadRecurringPayroll(): void {
    this.loading = true;
    
    // Load payroll and recipient configurations in parallel
    forkJoin({
      payroll: this.recurringPayrollService.getRecurringPayrolls(this.merchantId),
      configurations: this.recurringPayrollService.getRecipientConfigurations(this.recurringId, this.currentPage, this.pageSize, true),
      recipients: this.recipientService.getRecipients(this.merchantId)
    }).subscribe({
      next: (results) => {
        // Find the specific recurring payroll by recurringId
        this.recurringPayroll = results.payroll.data.find(p => p.recurringId === this.recurringId);
        
        if (!this.recurringPayroll) {
          this.error = 'Recurring payroll not found';
          this.loading = false;
          return;
        }
        
        // Store all recipients for later use
        this.recipients = results.recipients.data;
        
        // Merge recipient details with configurations
        this.configurations = results.configurations.data.map(config => {
          const recipient = this.recipients.find(r => r._id === config.recipientId);
          return {
            ...config,
            recipientName: recipient?.recipientName || 'Unknown Recipient',
            accountNumber: recipient?.accountNumber || 'N/A',
            accountIssuer: recipient?.accountIssuer || 'N/A',
            accountType: recipient?.accountType || 'N/A'
          };
        });
        
        this.totalItems = results.configurations.meta.total;
        this.totalPages = results.configurations.meta.pages;
        
        // Initialize edit form with current values
        this.updateEditForm();
        
        this.loading = false;
      },
      error: (error) => {
        this.error = error.error?.message || 'Failed to load recurring payroll details';
        this.loading = false;
      }
    });
  }
  
  loadAvailableRecipients(): void {
    if (!this.merchantId) {
      return;
    }
    
    this.loadingRecipients = true;
    this.recipientService.getRecipients(this.merchantId)
      .subscribe({
        next: (response) => {
          this.recipients = response.data;
          this.loadingRecipients = false;
        },
        error: (error) => {
          console.error("Error loading recipients:", error);
          this.loadingRecipients = false;
        }
      });
  }
  
  loadConfigurations(): void {
    this.recurringPayrollService.getRecipientConfigurations(this.recurringId, this.currentPage, this.pageSize, true)
      .subscribe({
        next: (response) => {
          this.configurations = response.data;
          this.totalItems = response.meta.total;
          this.totalPages = response.meta.pages;
        },
        error: (error) => {
          this.error = error.error?.message || 'Failed to load recipient configurations';
        }
      });
  }
  
  changePage(page: number): void {
    this.currentPage = page;
    this.loadConfigurations();
  }
  
  // Form creation methods
  createEditForm(): FormGroup {
    return this.fb.group({
      name: [''],
      description: [''],
      frequency: [''],
      dayOfMonth: [1],
      dayOfWeek: [1],
      timeOfDay: [''],
      requiresApproval: [true],
      status: ['']
    });
  }
  
  createAddRecipientForm(): FormGroup {
    return this.fb.group({
      recipientId: [''],
      amount: [0],
      narration: [''],
      sendSms: [false]
    });
  }
  
  createEditRecipientForm(): FormGroup {
    return this.fb.group({
      amount: [0],
      narration: [''],
      sendSms: [false],
      isActive: [true]
    });
  }
  
  updateEditForm(): void {
    if (!this.recurringPayroll) return;
    
    this.editForm.patchValue({
      name: this.recurringPayroll.name,
      description: this.recurringPayroll.description || '',
      frequency: this.recurringPayroll.frequency,
      dayOfMonth: this.recurringPayroll.dayOfMonth || 1,
      dayOfWeek: this.recurringPayroll.dayOfWeek || 1,
      timeOfDay: this.recurringPayroll.timeOfDay,
      requiresApproval: this.recurringPayroll.requiresApproval,
      status: this.recurringPayroll.status
    });
  }
  
  // Actions
  toggleEditMode(): void {
    this.isEditMode = !this.isEditMode;
    if (this.isEditMode) {
      this.updateEditForm();
    }
  }
  
  toggleAddRecipientMode(): void {
    this.isAddRecipientMode = !this.isAddRecipientMode;
    if (this.isAddRecipientMode) {
      this.addRecipientForm.reset({
        recipientId: '',
        amount: 0,
        narration: '',
        sendSms: false
      });
    }
  }
  
  openEditRecipient(configuration: RecipientConfiguration): void {
    this.isEditRecipientMode = true;
    this.editRecipientId = configuration._id || '';
    
    this.editRecipientForm.patchValue({
      amount: configuration.amount,
      narration: configuration.narration,
      sendSms: configuration.sendSms,
      isActive: configuration.isActive
    });
  }
  
  cancelEditRecipient(): void {
    this.isEditRecipientMode = false;
    this.editRecipientId = '';
  }
  
  saveChanges(): void {
    if (this.editForm.invalid) {
      return;
    }
    
    this.submitting = true;
    
    // Only include the fields required for the current frequency
    const frequency = this.editForm.get('frequency')?.value;
    const payload: any = { ...this.editForm.value };
    
    if (frequency !== RecurringFrequency.MONTHLY) {
      delete payload.dayOfMonth;
    }
    
    if (frequency !== RecurringFrequency.WEEKLY && frequency !== RecurringFrequency.BIWEEKLY) {
      delete payload.dayOfWeek;
    }
    
    this.recurringPayrollService.updateRecurringPayroll(this.recurringId, payload)
      .subscribe({
        next: (response) => {
          this.successMessage = response.message || 'Recurring payroll updated successfully';
          this.recurringPayroll = response.data;
          this.isEditMode = false;
          this.submitting = false;
        },
        error: (error) => {
          this.error = error.error?.message || 'Failed to update recurring payroll';
          this.submitting = false;
        }
      });
  }
  
  addRecipient(): void {
    if (this.addRecipientForm.invalid) {
      return;
    }
    
    this.submitting = true;
    
    this.recurringPayrollService.addRecipient(this.recurringId, this.addRecipientForm.value)
      .subscribe({
        next: (response) => {
          this.successMessage = response.message || 'Recipient added successfully';
          this.loadConfigurations();
          this.isAddRecipientMode = false;
          this.submitting = false;
        },
        error: (error) => {
          this.error = error.error?.message || 'Failed to add recipient';
          this.submitting = false;
        }
      });
  }
  
  updateRecipient(): void {
    if (this.editRecipientForm.invalid) {
      return;
    }
    
    this.submitting = true;
    
    this.recurringPayrollService.updateRecipientConfig(this.recurringId, this.editRecipientId, this.editRecipientForm.value)
      .subscribe({
        next: (response) => {
          this.successMessage = response.message || 'Recipient configuration updated successfully';
          this.loadConfigurations();
          this.isEditRecipientMode = false;
          this.editRecipientId = '';
          this.submitting = false;
        },
        error: (error) => {
          this.error = error.error?.message || 'Failed to update recipient configuration';
          this.submitting = false;
        }
      });
  }
  
  removeRecipient(recipientId: string): void {
    if (confirm('Are you sure you want to remove this recipient?')) {
      this.recurringPayrollService.removeRecipient(this.recurringId, recipientId)
        .subscribe({
          next: (response) => {
            this.successMessage = response.message || 'Recipient removed successfully';
            this.loadConfigurations();
          },
          error: (error) => {
            this.error = error.error?.message || 'Failed to remove recipient';
          }
        });
    }
  }
  
  executePayroll(): void {
    if (confirm('Are you sure you want to manually execute this recurring payroll now?')) {
      this.recurringPayrollService.executeRecurringPayroll(this.recurringId)
        .subscribe({
          next: (response) => {
            this.successMessage = 'Recurring payroll executed successfully. Payroll ID: ' + response.data.payrollId;
          },
          error: (error) => {
            this.error = error.error?.message || 'Failed to execute recurring payroll';
          }
        });
    }
  }
  
  // Helper methods
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
  
  getDayOfWeekLabel(day: number): string {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[day];
  }
  
  getStatusClass(status: RecurringStatus): string {
    switch (status) {
      case RecurringStatus.ACTIVE:
        return 'bg-green-100 text-green-800';
      case RecurringStatus.PAUSED:
        return 'bg-yellow-100 text-yellow-800';
      case RecurringStatus.CANCELLED:
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }
  
  calculateTotalAmount(): number {
    return this.configurations.reduce((total, config) => {
      return config.isActive ? total + config.amount : total;
    }, 0);
  }
  
  getRecipientName(recipientId: string): string {
    const recipient = this.recipients.find(r => r._id === recipientId);
    return recipient ? recipient.recipientName : 'Unknown Recipient';
  }
  
  onFrequencyChange(): void {
    // Handle validation for different frequency options
    const frequency = this.editForm.get('frequency')?.value;
    console.log('Frequency changed to:', frequency);
  }
}