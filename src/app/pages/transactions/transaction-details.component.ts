import { Component } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { TransactionService } from './transaction.service';
import { Transaction } from './transaction.interface';

@Component({
  selector: 'app-transaction-details',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './transaction-details.component.html',
  styleUrls: ['./transaction-details.component.scss']
})
export class TransactionDetailsComponent {
  searchForm: FormGroup;
  transactions: (Transaction & { showDetails?: boolean })[] = [];
  filteredTransactions: (Transaction & { showDetails?: boolean })[] = [];
  loading = false;
  error: string | null = null;
  
  // Date filter properties
  dateFilterEnabled = false;
  startDate: string = '';
  endDate: string = '';

  constructor(
    private fb: FormBuilder,
    private transactionService: TransactionService
  ) {
    this.searchForm = this.fb.group({
      transactionId: ['', [Validators.required]]
    });
    
    // Initialize with today's date and 7 days ago
    const today = new Date();
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    this.endDate = today.toISOString().split('T')[0];
    this.startDate = sevenDaysAgo.toISOString().split('T')[0];
  }

  searchTransaction() {
    if (this.searchForm.invalid || this.loading) return;

    const id = this.searchForm.get('transactionId')?.value;
    this.loading = true;
    this.error = null;
    this.transactions = [];
    this.filteredTransactions = [];

    this.transactionService.getTransactionById(id).subscribe({
      next: (response) => {
        if (response.data && response.data.length > 0) {
          this.transactions = response.data.map(tx => ({
            ...tx,
            showDetails: false
          }));
          
          // Apply date filters if enabled
          this.applyDateFilter();
        } else {
          this.error = 'No transactions found';
        }
        this.loading = false;
      },
      error: (err) => {
        this.error = err.message || 'Failed to fetch transaction';
        this.loading = false;
      }
    });
  }
  
  toggleDateFilter() {
    this.dateFilterEnabled = !this.dateFilterEnabled;
    this.applyDateFilter();
  }
  
  applyDateFilter() {
    if (!this.dateFilterEnabled || !this.transactions.length) {
      this.filteredTransactions = [...this.transactions];
      return;
    }
    
    const start = this.startDate ? new Date(this.startDate) : null;
    const end = this.endDate ? new Date(this.endDate) : null;
    
    // Add one day to end date to include the full day
    if (end) {
      end.setDate(end.getDate() + 1);
    }
    
    this.filteredTransactions = this.transactions.filter(tx => {
      const txDate = new Date(tx.createdAt);
      return (!start || txDate >= start) && (!end || txDate < end);
    });
  }
  
  onDateFilterChange() {
    this.applyDateFilter();
  }

  toggleDetails(transaction: Transaction & { showDetails?: boolean }) {
    transaction.showDetails = !transaction.showDetails;
  }

  getStatusClass(status: string): string {
    const baseClasses = 'px-3 py-1 text-sm font-medium rounded-full';
    return `${baseClasses} ${
      status === 'PAID' ? 'bg-green-100 text-green-800' :
      status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
      'bg-red-100 text-red-800'
    }`;
  }

  calculateTotal(field: keyof Pick<Transaction, 'amount' | 'charges' | 'actualAmount'>): number {
    // Use filtered transactions for calculations
    return this.filteredTransactions.reduce((sum, tx) => sum + (tx[field] || 0), 0);
  }

  formatAmount(amount: number): string {
    return new Intl.NumberFormat('en-GH', {
      style: 'currency',
      currency: 'GHS'
    }).format(amount);
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleString();
  }
  
  resetFilters() {
    const today = new Date();
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    this.endDate = today.toISOString().split('T')[0];
    this.startDate = sevenDaysAgo.toISOString().split('T')[0];
    
    this.applyDateFilter();
  }
}