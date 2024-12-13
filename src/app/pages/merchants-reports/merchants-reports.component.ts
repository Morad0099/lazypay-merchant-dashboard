import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Store } from '@ngxs/store';
import { AuthState } from '../../state/apps/app.states';
import * as XLSX from 'xlsx';

interface ReportFilters {
  startDate: string;
  endDate: string;
  roleId: string;
  status: string;
  transaction_type: string;
}

interface ReportStats {
  count: number;
  actualAmount: number;
  amount: number;
  charges: number;
}

interface Transaction {
  _id: string;
  payment_account_name: string;
  payment_account_number: string;
  payment_account_issuer: string;
  payment_account_type: string;
  actualAmount: number;
  amount: number;
  charges: number;
  status: string;
  transaction_type: string;
  transactionRef: string;
  description: string;
  createdAt: string;
  customerId: {
    merchant_tradeName: string;
    email: string;
  };
}

interface ReportResponse {
  success: boolean;
  message: string;
  data: {
    _id: null;
    count: number;
    actualAmount: number;
    amount: number;
    charges: number;
    transactions: Transaction[];
  };
}

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="reports-container">
      <!-- Header -->
      <div class="header">
        <div class="title-section">
          <h1>Transaction Reports</h1>
          <p>Generate and analyze transaction reports</p>
        </div>
      </div>

      <!-- Stats Cards -->
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon">
            <i class="material-icons">receipt_long</i>
          </div>
          <div class="stat-info">
            <span class="label">Total Transactions</span>
            <span class="value">{{ reportStats.count || 0 }}</span>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon">
            <i class="material-icons">payments</i>
          </div>
          <div class="stat-info">
            <span class="label">Total Amount</span>
            <span class="value">{{
              formatCurrency(reportStats.amount || 0)
            }}</span>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon">
            <i class="material-icons">account_balance_wallet</i>
          </div>
          <div class="stat-info">
            <span class="label">Net Amount</span>
            <span class="value">{{
              formatCurrency(reportStats.actualAmount || 0)
            }}</span>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon">
            <i class="material-icons">attach_money</i>
          </div>
          <div class="stat-info">
            <span class="label">Total Charges</span>
            <span class="value">{{
              formatCurrency(reportStats.charges || 0)
            }}</span>
          </div>
        </div>
      </div>

      <!-- Filters Section -->
      <div class="filters-section">
        <div class="filter-grid">
          <div class="filter-group">
            <label>Start Date</label>
            <input
              type="date"
              [(ngModel)]="filters.startDate"
              [max]="filters.endDate"
            />
          </div>

          <div class="filter-group">
            <label>End Date</label>
            <input
              type="date"
              [(ngModel)]="filters.endDate"
              [min]="filters.startDate"
            />
          </div>

          <div class="filter-group">
            <label>Status</label>
            <select [(ngModel)]="filters.status">
              <option value="">All Status</option>
              <option value="PAID">Paid</option>
              <option value="PENDING">Pending</option>
              <option value="FAILED">Failed</option>
            </select>
          </div>

          <div class="filter-group">
            <label>Transaction Type</label>
            <select [(ngModel)]="filters.transaction_type">
              <option value="">All Types</option>
              <option value="DEBIT">Debit</option>
              <option value="CREDIT">Credit</option>
            </select>
          </div>
        </div>

        <div class="filter-actions">
          <button
            class="generate-btn"
            (click)="generateReport()"
            [disabled]="loading"
          >
            <i class="material-icons">assessment</i>
            Generate Report
          </button>

          <button
            class="download-btn"
            (click)="downloadReport()"
            [disabled]="!transactions.length"
          >
            <i class="material-icons">download</i>
            Download Excel
          </button>
        </div>
      </div>

      <!-- Loading State -->
      <div class="loading-spinner" *ngIf="loading">
        <div class="spinner"></div>
      </div>

      <!-- Error Message -->
      <div class="error-message" *ngIf="error">{{ error }}</div>

      <!-- Results Table -->
      <div class="table-container" *ngIf="transactions.length > 0">
        <table class="transactions-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Merchant</th>
              <th>Customer</th>
              <th>Amount</th>
              <th>Charges</th>
              <th>Net Amount</th>
              <th>Type</th>
              <th>Status</th>
              <th>Reference</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let tx of paginatedTransactions">
              <td>{{ formatDate(tx.createdAt) }}</td>
              <td>
                <div class="merchant-info">
                  <span class="name">{{
                    tx.customerId.merchant_tradeName
                  }}</span>
                  <span class="email">{{ tx.customerId.email }}</span>
                </div>
              </td>
              <td>
                <div class="customer-info">
                  <span class="name">{{ tx.payment_account_name }}</span>
                  <span class="account">
                    {{ tx.payment_account_number }}
                    <small
                      >({{ tx.payment_account_issuer }}
                      {{ tx.payment_account_type }})</small
                    >
                  </span>
                </div>
              </td>
              <td>{{ formatCurrency(tx.amount) }}</td>
              <td>{{ formatCurrency(tx.charges) }}</td>
              <td>{{ formatCurrency(tx.actualAmount) }}</td>
              <td>
                <span
                  class="type-badge"
                  [class]="tx.transaction_type.toLowerCase()"
                >
                  {{ tx.transaction_type }}
                </span>
              </td>
              <td>
                <span class="status-badge" [class]="tx.status.toLowerCase()">
                  {{ tx.status }}
                </span>
              </td>
              <td>
                <span class="reference">{{ tx.transactionRef }}</span>
                <span class="description">{{ tx.description }}</span>
              </td>
            </tr>
          </tbody>
        </table>
        <!-- Pagination Controls -->
        <div class="pagination-controls">
          <div class="pagination-info">
            Showing {{ startIndex + 1 }} to {{ endIndex }} of
            {{ transactions.length }} entries
          </div>
          <div class="pagination-buttons">
            <button
              class="pagination-btn"
              [disabled]="currentPage === 1"
              (click)="changePage(currentPage - 1)"
            >
              <i class="material-icons">chevron_left</i>
            </button>

            <span class="page-numbers">
              <span
                *ngFor="let page of visiblePages"
                class="page-number"
                [class.active]="page === currentPage"
                (click)="changePage(page)"
              >
                {{ page }}
              </span>
            </span>

            <button
              class="pagination-btn"
              [disabled]="currentPage === totalPages"
              (click)="changePage(currentPage + 1)"
            >
              <i class="material-icons">chevron_right</i>
            </button>
          </div>
        </div>
      </div>

      <!-- No Results -->
      <div class="no-data" *ngIf="!loading && !transactions.length && !error">
        <i class="material-icons">search_off</i>
        <p>No transactions found. Try adjusting your filters.</p>
      </div>
    </div>
  `,
  styleUrls: ['./merchants.reports.component.scss'],
})
export class ReportsComponent implements OnInit {
  filters: ReportFilters = {
    startDate: '',
    endDate: '',
    roleId: '',
    status: '',
    transaction_type: '',
  };

  reportStats: ReportStats = {
    count: 0,
    actualAmount: 0,
    amount: 0,
    charges: 0,
  };

  transactions: Transaction[] = [];
  loading = false;
  error = '';

  currentPage = 1;
  pageSize = 10;
  maxVisiblePages = 5;

  constructor(private http: HttpClient, private store: Store) {}

  ngOnInit() {
    this.filters.roleId = this.store.selectSnapshot(
      (state) => state.auth.user?._id
    );

    const today = new Date();
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    this.filters.endDate = today.toISOString().split('T')[0];
    this.filters.startDate = sevenDaysAgo.toISOString().split('T')[0];
  }

  private getHeaders(): HttpHeaders {
    const token = this.store.selectSnapshot(AuthState.token);
    return new HttpHeaders().set('Authorization', `Bearer ${token}`);
  }

  get startIndex(): number {
    return (this.currentPage - 1) * this.pageSize;
  }

  get endIndex(): number {
    return Math.min(this.startIndex + this.pageSize, this.transactions.length);
  }

  get totalPages(): number {
    return Math.ceil(this.transactions.length / this.pageSize);
  }

  get paginatedTransactions(): Transaction[] {
    return this.transactions.slice(this.startIndex, this.endIndex);
  }

  get visiblePages(): number[] {
    const pages: number[] = [];
    let start = Math.max(1, this.currentPage - Math.floor(this.maxVisiblePages / 2));
    let end = Math.min(this.totalPages, start + this.maxVisiblePages - 1);

    // Adjust start if we're near the end
    start = Math.max(1, Math.min(start, this.totalPages - this.maxVisiblePages + 1));

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  }

  changePage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }

  async generateReport() {
    if (!this.validateFilters()) return;

    this.loading = true;
    this.error = '';
    this.transactions = [];
    this.currentPage = 1;
    this.reportStats = {
      count: 0,
      actualAmount: 0,
      amount: 0,
      charges: 0,
    };

    try {
      const response = await this.http
        .post<ReportResponse>(
          'https://lazypaygh.com/api/transactions/role/reports',
          this.filters,
          { headers: this.getHeaders() }
        )
        .toPromise();

      if (response?.success) {
        this.transactions = response.data.transactions;
        this.reportStats = {
          count: response.data.count,
          actualAmount: response.data.actualAmount,
          amount: response.data.amount,
          charges: response.data.charges,
        };
      } else {
        if (response?.message?.includes('memory')) {
          this.error =
            'Too much data requested. Please try a shorter date range or add more filters.';
        } else {
          this.error = response?.message || 'Failed to generate report';
        }
      }
    } catch (err: any) {
      this.error =
        err?.error?.message || 'Failed to generate report. Please try again.';
      console.error('Report generation error:', err);
    } finally {
      this.loading = false;
    }
  }

  validateFilters(): boolean {
    if (!this.filters.startDate || !this.filters.endDate) {
      this.error = 'Please select both start and end dates';
      return false;
    }

    const start = new Date(this.filters.startDate);
    const end = new Date(this.filters.endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    // Limit to 7 days to prevent memory issues
    if (diffDays > 7) {
      this.error =
        'Date range cannot exceed 7 days due to data size limitations';
      return false;
    }

    return true;
  }

  downloadReport() {
    if (!this.transactions.length) return;

    const worksheet = XLSX.utils.json_to_sheet(
      this.transactions.map((tx) => ({
        Date: this.formatDate(tx.createdAt),
        Merchant: tx.customerId.merchant_tradeName,
        'Merchant Email': tx.customerId.email,
        'Customer Name': tx.payment_account_name,
        'Customer Account': tx.payment_account_number,
        'Payment Method': `${tx.payment_account_issuer} ${tx.payment_account_type}`,
        Amount: tx.amount,
        Charges: tx.charges,
        'Net Amount': tx.actualAmount,
        Type: tx.transaction_type,
        Status: tx.status,
        Reference: tx.transactionRef,
        Description: tx.description,
      }))
    );

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Transactions');

    const fileName = `transactions_report_${this.formatDateForFile(
      new Date()
    )}.xlsx`;
    XLSX.writeFile(workbook, fileName);
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  formatDateForFile(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-GH', {
      style: 'currency',
      currency: 'GHS',
    }).format(amount);
  }
}
