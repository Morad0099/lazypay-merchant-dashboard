import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Store } from '@ngxs/store';
import { AuthState } from '../../state/apps/app.states';
import * as XLSX from 'xlsx';
import { TransactionModalComponent } from '../../components/transactoin.modal';
import { ApiTransaction } from '../../types';

interface SearchFilters {
  phone: string;
  transactionRef: string;
  customerName: string;
}

interface ReportFilters {
  startDate: string;
  endDate: string;
  status: string;
  merchantId: string;
  transaction_type: string;
  page: number;
  limit: number;
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
  merchantId: any;
  customerId: any;
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
  imports: [CommonModule, FormsModule, TransactionModalComponent],
  template: `
    <div class="p-6 max-w-7xl mx-auto">
      <!-- Header -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900">Transaction Reports</h1>
        <p class="text-gray-600 mt-1">
          Track and analyze your financial activity
        </p>
      </div>

      <!-- Stats Cards -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div
          class="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow border border-gray-100"
        >
          <p class="text-blue-600 mb-2 text-sm font-medium">
            Total Transactions
          </p>
          <p class="text-2xl font-bold text-gray-900">
            {{ reportStats.count || 0 }}
          </p>
          <div class="mt-2 text-blue-600 text-sm">
            <span>+12.5% vs last month</span>
          </div>
        </div>

        <div
          class="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow border border-gray-100"
        >
          <p class="text-green-600 mb-2 text-sm font-medium">Total Amount</p>
          <p class="text-2xl font-bold text-gray-900">
            {{ formatCurrency(reportStats.amount || 0) }}
          </p>
          <div class="mt-2 text-green-600 text-sm">
            <span>+8.3% vs last month</span>
          </div>
        </div>

        <div
          class="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow border border-gray-100"
        >
          <p class="text-indigo-600 mb-2 text-sm font-medium">Net Amount</p>
          <p class="text-2xl font-bold text-gray-900">
            {{ formatCurrency(reportStats.actualAmount || 0) }}
          </p>
          <div class="mt-2 text-indigo-600 text-sm">
            <span>+10.2% vs last month</span>
          </div>
        </div>

        <div
          class="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow border border-gray-100"
        >
          <p class="text-red-600 mb-2 text-sm font-medium">Total Charges</p>
          <p class="text-2xl font-bold text-gray-900">
            {{ formatCurrency(reportStats.charges || 0) }}
          </p>
          <div class="mt-2 text-red-600 text-sm">
            <span>-2.1% vs last month</span>
          </div>
        </div>
      </div>

      <!-- Search & Filters -->
      <div class="bg-white rounded-2xl shadow-sm border border-gray-100 mb-8">
        <div class="p-6 border-b border-gray-100">
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <!-- Phone Search -->
            <div class="relative">
              <i
                class="material-icons absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                >phone</i
              >
              <input
                [(ngModel)]="searchFilters.phone"
                type="text"
                placeholder="Search by phone number"
                class="pl-10 w-full h-12 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
              />
            </div>

            <!-- Transaction Reference -->
            <div class="relative">
              <i
                class="material-icons absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                >receipt</i
              >
              <input
                [(ngModel)]="searchFilters.transactionRef"
                type="text"
                placeholder="Search by transaction reference"
                class="pl-10 w-full h-12 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
              />
            </div>

            <!-- Customer Name -->
            <div class="relative">
              <i
                class="material-icons absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                >person</i
              >
              <input
                [(ngModel)]="searchFilters.customerName"
                type="text"
                placeholder="Search by customer name"
                class="pl-10 w-full h-12 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
              />
            </div>
          </div>

          <!-- Advanced Filters -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div class="bg-gray-50 p-4 rounded-xl">
              <label class="block text-sm font-medium text-gray-900 mb-3"
                >Date Range</label
              >
              <div class="grid grid-cols-2 gap-4">
                <div class="relative">
                  <i
                    class="material-icons absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                    >calendar_today</i
                  >
                  <input
                    type="date"
                    [(ngModel)]="filters.startDate"
                    [max]="filters.endDate"
                    class="pl-10 w-full h-12 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                  />
                </div>
                <div class="relative">
                  <i
                    class="material-icons absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                    >calendar_today</i
                  >
                  <input
                    type="date"
                    [(ngModel)]="filters.endDate"
                    [min]="filters.startDate"
                    class="pl-10 w-full h-12 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                  />
                </div>
              </div>
            </div>

            <div class="bg-gray-50 p-4 rounded-xl">
              <label class="block text-sm font-medium text-gray-900 mb-3"
                >Transaction Filters</label
              >
              <div class="grid grid-cols-2 gap-4">
                <div class="relative">
                  <i
                    class="material-icons absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                    >flag</i
                  >
                  <select
                    [(ngModel)]="filters.status"
                    class="pl-10 w-full h-12 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 appearance-none"
                  >
                    <option value="">All Status</option>
                    <option value="PAID">Paid</option>
                    <option value="PENDING">Pending</option>
                    <option value="FAILED">Failed</option>
                  </select>
                </div>
                <div class="relative">
                  <i
                    class="material-icons absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                    >sync_alt</i
                  >
                  <select
                    [(ngModel)]="filters.transaction_type"
                    class="pl-10 w-full h-12 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 appearance-none"
                  >
                    <option value="">All Types</option>
                    <option value="DEBIT">Debit</option>
                    <option value="CREDIT">Credit</option>
                    <option value="REVERSAL">Reversal</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          <!-- Action Buttons -->
          <div class="flex justify-end gap-4">
            <button
              (click)="generateReport()"
              [disabled]="loading"
              class="inline-flex items-center px-6 h-12 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 focus:ring-4 focus:ring-blue-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <i class="material-icons mr-2">assessment</i>
              Generate Report
            </button>

            <button
              (click)="downloadReport()"
              [disabled]="!transactions.length"
              class="inline-flex items-center px-6 h-12 bg-green-600 text-white font-medium rounded-xl hover:bg-green-700 focus:ring-4 focus:ring-green-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <i class="material-icons mr-2">download</i>
              Download Excel
            </button>
          </div>
        </div>

        <!-- Results Table -->
        <div class="overflow-x-auto" *ngIf="transactions.length > 0">
          <table class="w-full">
            <thead class="bg-gray-50">
              <tr>
                <th
                  *ngFor="
                    let header of [
                      'Date',
                      'Merchant',
                      'Customer',
                      'Amount',
                      'Charges',
                      'Net Amount',
                      'Type',
                      'Status',
                      'Reference',
                      'Actions'
                    ]
                  "
                  class="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  {{ header }}
                </th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100">
              <tr
                *ngFor="let tx of paginatedTransactions"
                class="hover:bg-gray-50"
              >
                <td class="px-6 py-4 text-sm text-gray-900">
                  {{ formatDate(tx.createdAt) }}
                </td>
                <td class="px-6 py-4">
                  <div class="text-sm font-medium text-gray-900">
                    {{
                      tx.customerId?.merchant_tradeName ??
                        tx.merchantId?.merchant_tradeName
                    }}
                  </div>
                  <div class="text-sm text-gray-500">
                    {{ tx.customerId?.email ?? tx.merchantId?.email }}
                  </div>
                </td>
                <td class="px-6 py-4">
                  <div class="text-sm font-medium text-gray-900">
                    {{ tx.payment_account_name }}
                  </div>
                  <div class="text-sm text-gray-500">
                    {{ tx.payment_account_number }}
                    <span class="text-xs text-gray-400"
                      >({{ tx.payment_account_issuer }}
                      {{ tx.payment_account_type }})</span
                    >
                  </div>
                </td>
                <td class="px-6 py-4 text-sm text-gray-900">
                  {{ formatCurrency(tx.amount) }}
                </td>
                <td class="px-6 py-4 text-sm text-red-600">
                  {{ formatCurrency(tx.charges) }}
                </td>
                <td class="px-6 py-4 text-sm font-medium text-green-600">
                  {{ formatCurrency(tx.actualAmount) }}
                </td>
                <td class="px-6 py-4">
                  <span
                    [ngClass]="{
                      'px-3 py-1 text-xs font-medium rounded-full': true,
                      'bg-blue-100 text-blue-800':
                        tx.transaction_type === 'CREDIT',
                      'bg-purple-100 text-purple-800':
                        tx.transaction_type === 'DEBIT'
                    }"
                  >
                    {{ tx.transaction_type }}
                  </span>
                </td>
                <td class="px-6 py-4">
                  <span
                    [ngClass]="{
                      'px-3 py-1 text-xs font-medium rounded-full': true,
                      'bg-green-100 text-green-800': tx.status === 'PAID',
                      'bg-yellow-100 text-yellow-800': tx.status === 'PENDING',
                      'bg-red-100 text-red-800': tx.status === 'FAILED'
                    }"
                  >
                    {{ tx.status }}
                  </span>
                </td>
                <td class="px-6 py-4">
                  <div class="text-sm font-medium text-gray-900">
                    {{ tx.transactionRef }}
                  </div>
                  <div class="text-sm text-gray-500">{{ tx.description }}</div>
                </td>
                <td class="px-6 py-4">
                  <button
                    (click)="viewTransactionDetails(tx)"
                    class="inline-flex items-center px-3 py-1.5 text-sm text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100"
                  >
                    <i class="material-icons text-base mr-1">visibility</i>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination -->
        <div
          class="px-6 py-4 border-t border-gray-100"
          *ngIf="transactions.length > 0"
        >
          <div class="flex items-center justify-between">
            <span class="text-sm text-gray-600">
              Showing {{ startIndex + 1 }} to {{ endIndex }} of
              {{ transactions.length }} entries
            </span>
            <div class="flex items-center gap-2">
              <button
                [disabled]="currentPage === 1"
                (click)="changePage(currentPage - 1)"
                class="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50"
              >
                <i class="material-icons">chevron_left</i>
              </button>
              <div class="flex gap-1">
                <button
                  *ngFor="let page of visiblePages"
                  (click)="changePage(page)"
                  [class]="
                    page === currentPage
                      ? 'px-4 py-2 rounded-lg bg-blue-50 text-blue-600'
                      : 'px-4 py-2 rounded-lg hover:bg-gray-100'
                  "
                >
                  {{ page }}
                </button>
              </div>
              <button
                [disabled]="currentPage === totalPages"
                (click)="changePage(currentPage + 1)"
                class="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50"
              >
                <i class="material-icons">chevron_right</i>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Loading State -->
      <div class="flex justify-center items-center py-12" *ngIf="loading">
        <div
          class="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"
        ></div>
      </div>

      <!-- Error Message -->
      <div class="bg-red-50 text-red-600 p-4 rounded-xl" *ngIf="error">
        {{ error }}
      </div>

      <!-- No Results -->
      <div
        class="text-center py-12"
        *ngIf="!loading && !transactions.length && !error"
      >
        <i class="material-icons text-4xl text-gray-400 mb-2">search_off</i>
        <p class="text-gray-600">
          No transactions found. Try adjusting your filters.
        </p>
      </div>
    </div>

    <app-transaction-modal
      *ngIf="showModal"
      [transaction]="selectedTransaction"
      (click)="closeTransactionModal()"
    >
    </app-transaction-modal>
  `,
  styleUrls: ['./merchants.reports.component.scss'],
})
export class ReportsComponent implements OnInit {
  selectedTransaction: ApiTransaction | null = null;
  showModal = false;
  // Add to your existing properties
  searchFilters: SearchFilters = {
    phone: '',
    transactionRef: '',
    customerName: '',
  };

  filters: ReportFilters = {
    startDate: '',
    endDate: '',
    status: '',
    transaction_type: '',
    limit: 100,
    merchantId: '',
    page: 1,
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
  pageSize = 5;
  maxVisiblePages = 5;

  constructor(private http: HttpClient, private store: Store) {}

  closeTransactionModal(): void {
    this.showModal = false;
    this.selectedTransaction = null;
  }

  ngOnInit() {
    this.filters.merchantId = this.store.selectSnapshot(
      (state) => state.auth.user?.merchantId?._id
    );

    const today = new Date();
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    this.filters.endDate = today.toISOString().split('T')[0];
    this.filters.startDate = sevenDaysAgo.toISOString().split('T')[0];
  }

  // Modify your existing generateReport method to include search
  get filteredTransactions(): Transaction[] {
    return this.transactions.filter((tx) => {
      const phoneMatch =
        !this.searchFilters.phone ||
        tx.payment_account_number.includes(this.searchFilters.phone);

      const refMatch =
        !this.searchFilters.transactionRef ||
        tx.transactionRef
          .toLowerCase()
          .includes(this.searchFilters.transactionRef.toLowerCase());

      const nameMatch =
        !this.searchFilters.customerName ||
        tx.payment_account_name
          .toLowerCase()
          .includes(this.searchFilters.customerName.toLowerCase());

      return phoneMatch && refMatch && nameMatch;
    });
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
    return Math.ceil(this.filteredTransactions.length / this.pageSize);
  }

  get paginatedTransactions(): Transaction[] {
    return this.filteredTransactions.slice(this.startIndex, this.endIndex);
  }

  get visiblePages(): number[] {
    const pages: number[] = [];
    let start = Math.max(
      1,
      this.currentPage - Math.floor(this.maxVisiblePages / 2)
    );
    let end = Math.min(this.totalPages, start + this.maxVisiblePages - 1);

    // Adjust start if we're near the end
    start = Math.max(
      1,
      Math.min(start, this.totalPages - this.maxVisiblePages + 1)
    );

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
    if (!this.validateFilters()) {
      return;
    }

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
          'https://doronpay.com/api/transactions/reports',
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
        Merchant:
          tx.customerId?.merchant_tradeName ||
          tx.merchantId?.merchant_tradeName,
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

  viewTransactionDetails(transaction: any) {
    // Here you can implement the logic to show the transaction details modal
    // For example:
    this.selectedTransaction = transaction;
    this.showModal = true;
  }
}
