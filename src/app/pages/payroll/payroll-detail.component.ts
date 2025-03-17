// payroll-detail.component.ts
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { PayrollService } from '../../service/payroll.service';
import { 
  Payroll, 
  PayrollStatus, 
  PayrollTransaction, 
  PayrollStats, 
  PaymentTransactionStatus 
} from '../../models/payroll.model';

@Component({
  selector: 'app-payroll-detail',
  templateUrl: './payroll-detail.component.html',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule
  ],
  styleUrls: ['./payroll-detail.component.scss']
})
export class PayrollDetailComponent implements OnInit {
  payrollId: string = '';
  payroll?: Payroll;
  transactions: PayrollTransaction[] = [];
  stats?: PayrollStats;
  
  loading = true;
  processingAction = false;
  error = '';
  successMessage = '';
  
  // For transactions pagination
  currentPage = 1;
  pageSize = 10;
  totalTransactions = 0;
  totalPages = 0;
  
  // Enums for template
  payrollStatusEnum = PayrollStatus;
  transactionStatusEnum = PaymentTransactionStatus;
  
  // For filtering transactions
  selectedStatus = '';
  
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private payrollService: PayrollService
  ) { }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.error = 'Payroll ID is required';
      this.router.navigate(['/payroll']);
      return;
    }
    
    this.payrollId = id;
    this.loadPayrollDetails();
  }

  loadPayrollDetails(): void {
    this.loading = true;
    
    // Load payroll details, transactions, and stats in parallel
    forkJoin({
      payroll: this.payrollService.getPayroll(this.payrollId),
      transactions: this.payrollService.getPayrollTransactions(
        this.payrollId, 
        this.currentPage, 
        this.pageSize, 
        this.selectedStatus
      ),
      stats: this.payrollService.getPayrollStats(this.payrollId)
    }).subscribe({
      next: (results) => {
        this.payroll = results.payroll.data;
        this.transactions = results.transactions.data;
        this.stats = results.stats.data;
        this.totalTransactions = results.transactions.meta.total;
        this.totalPages = results.transactions.meta.pages;
        this.loading = false;
      },
      error: (error) => {
        this.error = error.error?.message || 'Failed to load payroll details';
        this.loading = false;
      }
    });
  }

  filterTransactions(): void {
    this.currentPage = 1; // Reset to first page
    this.loadTransactions();
  }

  loadTransactions(): void {
    this.payrollService.getPayrollTransactions(
      this.payrollId, 
      this.currentPage, 
      this.pageSize, 
      this.selectedStatus
    ).subscribe({
      next: (response) => {
        this.transactions = response.data;
        this.totalTransactions = response.meta.total;
        this.totalPages = response.meta.pages;
      },
      error: (error) => {
        this.error = error.error?.message || 'Failed to load transactions';
      }
    });
  }

  changePage(page: number): void {
    this.currentPage = page;
    this.loadTransactions();
  }

  authorizePayroll(action: 'approve' | 'reject'): void {
    if (!this.payroll) return;
    
    const comments = action === 'reject' ? prompt('Please provide a reason for rejection:') : '';
    
    this.processingAction = true;
    this.error = '';
    this.successMessage = '';
    
    this.payrollService.authorizePayroll(this.payrollId, action, comments || undefined)
      .subscribe({
        next: (response) => {
          this.payroll = response.data;
          this.successMessage = response.message || `Payroll ${action === 'approve' ? 'approved' : 'rejected'} successfully`;
        },
        error: (error) => {
          this.error = error.error?.message || `Failed to ${action} payroll`;
          this.processingAction = false;
        },
        complete: () => {
          this.processingAction = false;
        }
      });
  }

  processPayroll(): void {
    if (!this.payroll) return;
    
    if (!confirm('Are you sure you want to process this payroll? This action will initiate the payments.')) {
      return;
    }
    
    this.processingAction = true;
    this.error = '';
    this.successMessage = '';
    
    this.payrollService.processPayroll(this.payrollId)
      .subscribe({
        next: (response) => {
          this.payroll = response.data;
          this.successMessage = response.message || 'Payroll processed successfully';
          // Reload stats and transactions
          this.loadPayrollDetails();
        },
        error: (error) => {
          this.error = error.error?.message || 'Failed to process payroll';
          this.processingAction = false;
        },
        complete: () => {
          this.processingAction = false;
        }
      });
  }

  getStatusClass(status: PayrollStatus | PaymentTransactionStatus): string {
    switch (status) {
      case PayrollStatus.APPROVED:
      case PaymentTransactionStatus.COMPLETED:
        return 'bg-green-100 text-green-800';
      case PayrollStatus.COMPLETED:
        return 'bg-blue-100 text-blue-800';
      case PayrollStatus.FAILED:
      case PaymentTransactionStatus.FAILED:
        return 'bg-red-100 text-red-800';
      case PayrollStatus.REJECTED:
        return 'bg-red-100 text-red-800';
      case PayrollStatus.PENDING_APPROVAL:
      case PaymentTransactionStatus.PENDING_APPROVAL:
        return 'bg-yellow-100 text-yellow-800';
      case PayrollStatus.PROCESSING:
      case PaymentTransactionStatus.PROCESSING:
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

  canApprove(): boolean {
    return this.payroll?.status === PayrollStatus.PENDING_APPROVAL;
  }

  canProcess(): boolean {
    return this.payroll?.status === PayrollStatus.APPROVED;
  }
  
  // Helper methods for template safety
  getCompletedWidth(): string {
    if (!this.stats || !this.stats.totalAmount || this.stats.totalAmount === 0) return '0%';
    return `${(this.stats.completedAmount / this.stats.totalAmount) * 100}%`;
  }
  
  getPendingWidth(): string {
    if (!this.stats || !this.stats.totalAmount || this.stats.totalAmount === 0) return '0%';
    return `${(this.stats.pendingAmount / this.stats.totalAmount) * 100}%`;
  }
  
  getFailedWidth(): string {
    if (!this.stats || !this.stats.totalAmount || this.stats.totalAmount === 0) return '0%';
    return `${(this.stats.failedAmount / this.stats.totalAmount) * 100}%`;
  }
}