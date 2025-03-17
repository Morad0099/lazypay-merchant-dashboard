// recurring-payroll-list.component.ts
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { RecurringPayrollService } from '../../service/recurring-payroll.service';
import { RecurringPayroll, RecurringFrequency, RecurringStatus } from '../../models/recurring-payroll.model';

@Component({
  selector: 'app-recurring-payroll-list',
  templateUrl: './recurring-payroll-list.component.html',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    RouterModule
  ],
  styleUrls: ['./recurring-payroll-list.component.scss']
})
export class RecurringPayrollListComponent implements OnInit {
  recurringPayrolls: RecurringPayroll[] = [];
  loading = false;
  error = '';
  successMessage = '';
  
  // Pagination
  currentPage = 1;
  pageSize = 10;
  totalItems = 0;
  totalPages = 0;
  
  // Filters
  filterForm: FormGroup;
  
  // Enums for template
  recurringFrequencyOptions = Object.values(RecurringFrequency);
  recurringStatusOptions = Object.values(RecurringStatus);
  
  // Getting merchantId from localStorage
  merchantId: string = '';
  
  constructor(
    private recurringPayrollService: RecurringPayrollService,
    private fb: FormBuilder,
    private router: Router
  ) {
    this.filterForm = this.fb.group({
      status: [''],
      frequency: ['']
    });
    
    // Get merchantId from localStorage
    this.getMerchantIdFromLocalStorage();
  }

  ngOnInit(): void {
    if (this.merchantId) {
      this.loadRecurringPayrolls();
    }
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

  loadRecurringPayrolls(): void {
    if (!this.merchantId) {
      this.error = 'Merchant ID is required';
      return;
    }
    
    this.loading = true;
    const filters = this.filterForm.value;
    
    this.recurringPayrollService.getRecurringPayrolls(
      this.merchantId,
      this.currentPage,
      this.pageSize,
      filters.status,
      filters.frequency
    ).subscribe({
      next: (response) => {
        this.recurringPayrolls = response.data;
        this.totalItems = response.meta.total;
        this.totalPages = response.meta.pages;
        this.loading = false;
      },
      error: (error) => {
        this.error = error.error?.message || 'Failed to load recurring payrolls';
        this.loading = false;
      }
    });
  }

  applyFilters(): void {
    this.currentPage = 1;
    this.loadRecurringPayrolls();
  }

  resetFilters(): void {
    this.filterForm.reset({
      status: '',
      frequency: ''
    });
    this.currentPage = 1;
    this.loadRecurringPayrolls();
  }

  changePage(page: number): void {
    this.currentPage = page;
    this.loadRecurringPayrolls();
  }

  createRecurringPayroll(): void {
    this.router.navigate(['/recurring/create']);
  }

  viewRecurringPayroll(id: string): void {
    this.router.navigate(['/recurring', id]);
  }

  executePayroll(id: string, event: Event): void {
    event.stopPropagation(); // Prevent navigation
    
    if (confirm('Are you sure you want to manually execute this recurring payroll now?')) {
      this.recurringPayrollService.executeRecurringPayroll(id)
        .subscribe({
          next: (response) => {
            this.successMessage = 'Recurring payroll executed successfully. Payroll ID: ' + response.data.payrollId;
            setTimeout(() => this.successMessage = '', 5000); // Clear message after 5 seconds
          },
          error: (error) => {
            this.error = error.error?.message || 'Failed to execute recurring payroll';
          }
        });
    }
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
}