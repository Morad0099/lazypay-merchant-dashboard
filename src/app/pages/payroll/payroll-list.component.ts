import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { PayrollService } from '../../service/payroll.service';
import { Payroll, PayrollStatus } from '../../models/payroll.model';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { Store } from '@ngxs/store';

@Component({
  selector: 'app-payroll-list',
  templateUrl: './payroll-list.component.html',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    RouterModule
  ],
  styleUrls: ['./payroll-list.component.scss']
})
export class PayrollListComponent implements OnInit {
  payrolls: Payroll[] = [];
  loading = false;
  error = '';
  
  // Pagination
  currentPage = 1;
  pageSize = 10;
  totalItems = 0;
  totalPages = 0;
  
  // Filters
  filterForm: FormGroup;
  payrollStatusOptions = Object.values(PayrollStatus);
  
  // Getting merchantId
  merchantId: string = '';
  
  constructor(
    private payrollService: PayrollService,
    private fb: FormBuilder,
    private router: Router,
    private store: Store
  ) {
    this.filterForm = this.fb.group({
      status: [''],
      fromDate: [null],
      toDate: [null]
    });
    
    // Get merchantId from localStorage directly
    this.getMerchantIdFromLocalStorage();
  }

  ngOnInit(): void {
    // If merchantId is set, load payrolls
    if (this.merchantId) {
      this.loadPayrolls();
    }
  }
  
  getMerchantIdFromLocalStorage(): void {
    // Try getting from PLOGIN instead of user
    const loginStr = localStorage.getItem('PLOGIN');
    if (loginStr) {
      try {
        const login = JSON.parse(loginStr);
        console.log("PLOGIN data:", login); // Debug log to see the structure
        
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

  loadPayrolls(): void {
    if (!this.merchantId) {
      this.error = 'Merchant ID is required';
      console.error("No merchant ID available when loading payrolls");
      return;
    }
    
    console.log("Loading payrolls with merchantId:", this.merchantId);
    
    this.loading = true;
    const filters = this.filterForm.value;
    
    this.payrollService.getPayrolls(
      this.merchantId,
      this.currentPage,
      this.pageSize,
      filters.status,
      filters.fromDate,
      filters.toDate
    ).subscribe({
      next: (response) => {
        console.log("Payroll response:", response);
        this.payrolls = response.data;
        this.totalItems = response.meta.total;
        this.totalPages = response.meta.pages;
        this.loading = false;
      },
      error: (error) => {
        console.error("Payroll API error:", error);
        this.error = error.error?.message || 'Failed to load payrolls';
        this.loading = false;
      }
    });
  }

  // Rest of the component methods remain the same
  applyFilters(): void {
    this.currentPage = 1; // Reset to first page when applying filters
    this.loadPayrolls();
  }

  resetFilters(): void {
    this.filterForm.reset({
      status: '',
      fromDate: null,
      toDate: null
    });
    this.currentPage = 1;
    this.loadPayrolls();
  }

  changePage(page: number): void {
    this.currentPage = page;
    this.loadPayrolls();
  }

  viewPayroll(payrollId: string): void {
    this.router.navigate(['/payroll', payrollId]);
  }

  getStatusClass(status: PayrollStatus): string {
    switch (status) {
      case PayrollStatus.APPROVED:
        return 'bg-green-100 text-green-800';
      case PayrollStatus.COMPLETED:
        return 'bg-blue-100 text-blue-800';
      case PayrollStatus.FAILED:
        return 'bg-red-100 text-red-800';
      case PayrollStatus.REJECTED:
        return 'bg-red-100 text-red-800';
      case PayrollStatus.PENDING_APPROVAL:
        return 'bg-yellow-100 text-yellow-800';
      case PayrollStatus.PROCESSING:
        return 'bg-purple-100 text-purple-800';
      case PayrollStatus.DRAFT:
        return 'bg-gray-100 text-gray-800';
      case PayrollStatus.PARTIALLY_COMPLETED:
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }
}