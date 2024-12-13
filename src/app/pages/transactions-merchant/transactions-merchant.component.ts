import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Store } from '@ngxs/store';
import { AuthState } from '../../state/apps/app.states';
import { FormsModule } from '@angular/forms';

interface Transaction {
  _id: string;
  channel: string;
  payment_account_name: string;
  payment_account_number: string;
  payment_account_issuer: string;
  payment_account_type: string;
  actualAmount: number;
  amount: number;
  charges: number;
  profitEarned: number;
  status: string;
  transaction_type: string;
  transactionRef: string;
  externalTransactionId: string;
  description: string;
  currency: string;
  createdAt: string;
  updatedAt: string;
  recipient_account_name: string;
  recipient_account_number: string;
  recipient_account_issuer_name: string;
  recipient_account_type: string;
  debitOperator?: string;
  reason?: string;
  transaction?: {
    Status: string;
    Message: string;
    GTBTransId?: string;
    PartnerTransId: string;
    ProviderTransId?: string;
    Data?: {
      Network?: string;
    }
  };
}

interface APIResponse {
    success: boolean;
    message: string;
    data: Transaction[]; // Changed from { transactions: Transaction[] }
  }

interface PaginatedResponse {
  success: boolean;
  message: string;
  data: {
    count: number;
    actualAmount: number;
    amount: number;
    charges: number;
    transactions: Transaction[];
  };
}
interface FilterOptions {
    status: string;
    type: string;
    search: string;
  }
@Component({
  selector: 'app-transactions',
  standalone: true,
  imports: [CommonModule,FormsModule],
  template: `
  <div class="transactions-container">
    <div class="header">
      <h1>Transactions</h1>
      <div class="header-stats">
        <div class="stat-item">
          <span class="label">Total Transactions:</span>
          <span class="value">{{totalTransactions}}</span>
        </div>
        <div class="stat-item">
          <span class="label">Total Amount:</span>
          <span class="value">{{formatCurrency(totalAmount)}}</span>
        </div>
        <div class="stat-item">
          <span class="label">Total Charges:</span>
          <span class="value">{{formatCurrency(totalCharges)}}</span>
        </div>
      </div>
      <button class="back-btn" (click)="goBack()">Back to Hub</button>
    </div>

    <!-- Add Filter Section -->
      <div class="filters-section">
        <div class="search-box">
          <input 
            type="text" 
            [(ngModel)]="filters.search" 
            (input)="applyFilters()"
            placeholder="Search by name, reference or description..."
            class="search-input"
          >
        </div>
        
        <div class="filter-buttons">
          <select [(ngModel)]="filters.status" (change)="applyFilters()" class="filter-select">
            <option value="">All Status</option>
            <option value="PAID">Paid</option>
            <option value="FAILED">Failed</option>
            <option value="PENDING">Pending</option>
            <option value="PROCESSING">Processing</option>
          </select>

          <select [(ngModel)]="filters.type" (change)="applyFilters()" class="filter-select">
            <option value="">All Types</option>
            <option value="DEBIT">Debit</option>
            <option value="CREDIT">Credit</option>
          </select>
        </div>
      </div>

    <div class="loading-spinner" *ngIf="loading">
      <div class="spinner"></div>
    </div>

    <div class="error-message" *ngIf="error">
      {{error}}
    </div>

    <div *ngIf="!loading && transactions.length === 0" class="no-data">
      No transactions found
    </div>

<div class="transactions-grid" *ngIf="!loading && filteredTransactions.length > 0">
        <div class="transaction-card" *ngFor="let tx of paginatedTransactions">
        <div class="transaction-header" [ngClass]="tx.status.toLowerCase()">
          <span class="status-badge">{{tx.status}}</span>
          <span class="type-badge">{{tx.transaction_type}}</span>
          <span class="channel-badge">{{tx.channel}}</span>
        </div>
        
        <div class="transaction-details">
          <div class="amount-section">
            <p class="amount">{{formatCurrency(tx.amount)}}</p>
            <p class="currency">{{tx.currency}}</p>
          </div>

          <div class="party-details">
            <div class="from-party">
              <h4>From</h4>
              <p class="name">{{tx.payment_account_name}}</p>
              <p class="account">
                {{tx.payment_account_number}}
                <span class="account-type">
                  {{tx.payment_account_issuer}} {{tx.payment_account_type}}
                </span>
              </p>
            </div>

            <div class="to-party">
              <h4>To</h4>
              <p class="name">{{tx.recipient_account_name}}</p>
              <p class="account">
                {{tx.recipient_account_number}}
                <span class="account-type">
                  {{tx.recipient_account_issuer_name}} {{tx.recipient_account_type}}
                </span>
              </p>
            </div>
          </div>

          <div class="reference-section">
            <p class="ref-item">
              <span class="label">Transaction Ref:</span>
              <span class="value">{{tx.transactionRef}}</span>
            </p>
            <p class="ref-item">
              <span class="label">External ID:</span>
              <span class="value">{{tx.externalTransactionId}}</span>
            </p>
            <p class="ref-item" *ngIf="tx.transaction?.GTBTransId">
              <span class="label">GTB Trans ID:</span>
              <span class="value">{{tx.transaction?.GTBTransId}}</span>
            </p>
          </div>

          <div class="status-details" *ngIf="tx.transaction">
            <p class="message">{{tx.transaction.Message}}</p>
            <p class="reason" *ngIf="tx.reason">{{tx.reason}}</p>
          </div>

          <p class="description">{{tx.description}}</p>
          
          <div class="timestamps">
            <p class="date">Created: {{formatDate(tx.createdAt)}}</p>
            <p class="date">Updated: {{formatDate(tx.updatedAt)}}</p>
          </div>
        </div>
        
        <div class="transaction-footer">
          <div class="fee-details">
            <p class="charges">Charges: {{formatCurrency(tx.charges)}}</p>
            <p class="actual">Net: {{formatCurrency(tx.actualAmount)}}</p>
            <p class="profit" *ngIf="tx.profitEarned">
              Profit: {{formatCurrency(tx.profitEarned)}}
            </p>
          </div>
          <div class="operator" *ngIf="tx.debitOperator">
            <p class="operator-name">Operator: {{tx.debitOperator}}</p>
          </div>
        </div>

      
    </div>
      </div>
        <!-- Pagination -->
     <div class="pagination" *ngIf="filteredTransactions.length > 0">
  <button 
    class="page-btn"
    [ngClass]="{'disabled': currentPage === 1}"
    [disabled]="currentPage === 1"
    (click)="changePage(currentPage - 1)">
    Previous
  </button>

  <div class="page-numbers">
    <ng-container *ngFor="let page of pageNumbers">
      <button 
        class="page-number"
        [ngClass]="{'active': page === currentPage}"
        (click)="changePage(page)">
        {{ page }}
      </button>
    </ng-container>
  </div>

  <button 
    class="page-btn"
    [ngClass]="{'disabled': currentPage === totalPages}"
    [disabled]="currentPage === totalPages"
    (click)="changePage(currentPage + 1)">
    Next
  </button>
</div>
    </div>
`,
  styleUrls: ['./transactions-merchant.component.scss']
})
export class TransactionsMerchantComponent implements OnInit {
  transactions: Transaction[] = [];
  loading = false;
  error = '';
  appId: string = '';
  pageNumbers: number[] = [];

  
  // Pagination
  currentPage = 1;
  pageSize = 9;
  totalTransactions = 0;
  totalPages = 0;
  
  // Summary stats
  totalAmount = 0;
  totalCharges = 0;

  filters: FilterOptions = {
    status: '',
    type: '',
    search: ''
  };

  allTransactions: Transaction[] = [];
  filteredTransactions: Transaction[] = [];
  paginatedTransactions: Transaction[] = [];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient,
    private store: Store
  ) {}

  ngOnInit() {
    this.appId = this.route.snapshot.paramMap.get('id') || '';
    if (this.appId) {
      this.fetchTransactions();
    } else {
      this.error = 'No App ID provided';
    }
  }

  private getHeaders(): HttpHeaders {
    const token = this.store.selectSnapshot(AuthState.token);
    return new HttpHeaders().set('Authorization', `Bearer ${token}`);
  }

  fetchTransactions() {
    this.loading = true;
    this.error = '';
    
    this.http.get<APIResponse>(`https://lazypaygh.com/api/transactions/pending?id=${this.appId}`, {
      headers: this.getHeaders()
    }).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.allTransactions = response.data;
          this.transactions = response.data; // Keep this for backward compatibility
          
          // Calculate totals from all transactions
          this.totalTransactions = this.allTransactions.length;
          this.totalAmount = this.allTransactions.reduce((sum, tx) => sum + (tx.amount || 0), 0);
          this.totalCharges = this.allTransactions.reduce((sum, tx) => sum + (tx.charges || 0), 0);
          
          this.applyFilters();
        } else {
          this.error = 'No transactions data found';
        }
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to fetch transactions';
        this.loading = false;
      }
    });
}

updatePagination() {
    const totalPages = Math.ceil(this.filteredTransactions.length / this.pageSize);
    this.totalPages = totalPages;

    // Calculate which page numbers to show
    let startPage = Math.max(1, this.currentPage - 2);
    let endPage = Math.min(totalPages, startPage + 4);

    // Adjust start if we're near the end
    if (endPage - startPage < 4) {
      startPage = Math.max(1, endPage - 4);
    }

    this.pageNumbers = Array.from(
      { length: endPage - startPage + 1 },
      (_, i) => startPage + i
    );
  }

  applyFilters() {
    let filtered = [...this.allTransactions];

    if (this.filters.status) {
      filtered = filtered.filter(tx => tx.status === this.filters.status);
    }

    if (this.filters.type) {
      filtered = filtered.filter(tx => tx.transaction_type === this.filters.type);
    }

    if (this.filters.search) {
      const search = this.filters.search.toLowerCase();
      filtered = filtered.filter(tx => 
        tx.payment_account_name.toLowerCase().includes(search) ||
        tx.transactionRef.toLowerCase().includes(search) ||
        tx.description.toLowerCase().includes(search) ||
        tx.payment_account_number.includes(search)
      );
    }

    this.filteredTransactions = filtered;
    this.totalTransactions = filtered.length;
    this.currentPage = 1; // Reset to first page when filters change
    this.updatePagination(); // Update pagination numbers
    this.updatePaginatedTransactions();
  }

  changePage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.updatePaginatedTransactions();
      this.updatePagination();
    }
  }

  updatePaginatedTransactions() {
    const start = (this.currentPage - 1) * this.pageSize;
    const end = start + this.pageSize;
    this.paginatedTransactions = this.filteredTransactions.slice(start, end);
  }

//   changePage(page: number) {
//     if (page >= 1 && page <= this.totalPages) {
//       this.currentPage = page;
//       this.updatePaginatedTransactions();
//     }
//   }

  getPageNumbers(): number[] {
    const pages: number[] = [];
    const totalPages = Math.ceil(this.filteredTransactions.length / this.pageSize);
    
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (this.currentPage <= 3) {
        for (let i = 1; i <= 5; i++) pages.push(i);
      } else if (this.currentPage >= totalPages - 2) {
        for (let i = totalPages - 4; i <= totalPages; i++) pages.push(i);
      } else {
        for (let i = this.currentPage - 2; i <= this.currentPage + 2; i++) {
          pages.push(i);
        }
      }
    }
    return pages;
  }

  goBack() {
    window.history.back();
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-GH', {
      style: 'currency',
      currency: 'GHS'
    }).format(amount);
  }
}