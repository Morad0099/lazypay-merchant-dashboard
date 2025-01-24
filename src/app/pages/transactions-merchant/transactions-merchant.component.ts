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
    };
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
  imports: [CommonModule, FormsModule],
  template: `
    <div class="container mx-auto p-4">
      <div class="bg-white rounded-lg shadow-sm">
        <!-- Header -->
        <div class="p-4 border-b">
          <div class="flex justify-between items-center mb-4">
            <h1 class="text-2xl font-semibold">Transactions</h1>
            <div class="flex gap-2">
              <span class="text-sm">Total: {{ totalTransactions }}</span>
              <span class="text-sm">Amount: {{ totalAmount | currency }}</span>
            </div>
          </div>

          <!-- Filters -->
          <div class="flex gap-4">
            <input
              type="text"
              [(ngModel)]="filters.search"
              (input)="applyFilters()"
              placeholder="Search transactions..."
              class="flex-1 px-3 py-2 border rounded-md"
            />
            <select
              [(ngModel)]="filters.status"
              (change)="applyFilters()"
              class="px-3 py-2 border rounded-md"
            >
              <option value="">All Status</option>
              <option value="PAID">Paid</option>
              <option value="FAILED">Failed</option>
              <option value="PENDING">Pending</option>
            </select>
            <select
              [(ngModel)]="filters.type"
              (change)="applyFilters()"
              class="px-3 py-2 border rounded-md"
            >
              <option value="">All Types</option>
              <option value="DEBIT">Debit</option>
              <option value="CREDIT">Credit</option>
            </select>
          </div>
        </div>

        <!-- Table -->
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead class="bg-gray-50">
              <tr>
                <th
                  class="px-4 py-3 text-left text-sm font-medium text-gray-600"
                >
                  Status
                </th>
                <th
                  class="px-4 py-3 text-left text-sm font-medium text-gray-600"
                >
                  Amount
                </th>
                <th
                  class="px-4 py-3 text-left text-sm font-medium text-gray-600"
                >
                  From
                </th>
                <th
                  class="px-4 py-3 text-left text-sm font-medium text-gray-600"
                >
                  To
                </th>
                <th
                  class="px-4 py-3 text-left text-sm font-medium text-gray-600"
                >
                  Reference
                </th>
                <th
                  class="px-4 py-3 text-left text-sm font-medium text-gray-600"
                >
                  Date
                </th>
                <th
                  class="px-4 py-3 text-left text-sm font-medium text-gray-600"
                >
                  Charges
                </th>
              </tr>
            </thead>
            <tbody>
              <tr
                *ngFor="let tx of paginatedTransactions"
                class="border-t hover:bg-gray-50"
              >
                <td class="px-4 py-3">
                  <span [ngClass]="getStatusClass(tx.status)">
                    {{ tx.status }}
                  </span>
                </td>
                <td class="px-4 py-3">
                  <div class="font-medium">{{ tx.amount | currency }}</div>
                  <div class="text-sm text-gray-500">{{ tx.currency }}</div>
                </td>
                <td class="px-4 py-3">
                  <div class="font-medium">{{ tx.payment_account_name }}</div>
                  <div class="text-sm text-gray-500">
                    {{ tx.payment_account_number }}
                  </div>
                </td>
                <td class="px-4 py-3">
                  <div class="font-medium">{{ tx.recipient_account_name }}</div>
                  <div class="text-sm text-gray-500">
                    {{ tx.recipient_account_number }}
                  </div>
                </td>
                <td class="px-4 py-3">
                  <div class="font-medium">{{ tx.transactionRef }}</div>
                  <div class="text-sm text-gray-500">
                    {{ tx.externalTransactionId }}
                  </div>
                </td>
                <td class="px-4 py-3">
                  <div class="font-medium">{{ tx.createdAt | date }}</div>
                  <div class="text-sm text-gray-500">
                    {{ tx.updatedAt | date : 'shortTime' }}
                  </div>
                </td>
                <td class="px-4 py-3">
                  <div class="font-medium">{{ tx.charges | currency }}</div>
                  <div class="text-sm text-gray-500">
                    Net: {{ tx.actualAmount | currency }}
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination -->
        <div class="flex items-center justify-between p-4 border-t">
          <span class="text-sm text-gray-500">
            Showing {{ (currentPage - 1) * pageSize + 1 }} to
            {{ currentPage * pageSize }} of {{ totalTransactions }}
          </span>
          <div class="flex gap-2">
            <button
              [disabled]="currentPage === 1"
              (click)="changePage(currentPage - 1)"
              class="px-3 py-1 border rounded hover:bg-gray-50 disabled:opacity-50"
            >
              Previous
            </button>
            <button
              *ngFor="let page of pageNumbers"
              (click)="changePage(page)"
              [ngClass]="{ 'bg-blue-50 text-blue-600': page === currentPage }"
              class="px-3 py-1 border rounded hover:bg-gray-50"
            >
              {{ page }}
            </button>
            <button
              [disabled]="currentPage === totalPages"
              (click)="changePage(currentPage + 1)"
              class="px-3 py-1 border rounded hover:bg-gray-50 disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['./transactions-merchant.component.scss'],
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
    search: '',
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

  getStatusClass(status: string): string {
    const classes: any = {
      PAID: 'bg-green-100 text-green-800',
      FAILED: 'bg-red-100 text-red-800',
      PENDING: 'bg-yellow-100 text-yellow-800',
    };
    return `inline-block px-2 py-1 text-xs font-medium rounded-full ${
      classes[status] || ''
    }`;
  }

  private getHeaders(): HttpHeaders {
    const token = this.store.selectSnapshot(AuthState.token);
    return new HttpHeaders().set('Authorization', `Bearer ${token}`);
  }

  fetchTransactions() {
    this.loading = true;
    this.error = '';

    this.http
      .get<APIResponse>(
        `https://doronpay.com/api/transactions/pending?id=${this.appId}`,
        {
          headers: this.getHeaders(),
        }
      )
      .subscribe({
        next: (response) => {
          if (response.success && response.data) {
            this.allTransactions = response.data;
            this.transactions = response.data; // Keep this for backward compatibility

            // Calculate totals from all transactions
            this.totalTransactions = this.allTransactions.length;
            this.totalAmount = this.allTransactions.reduce(
              (sum, tx) => sum + (tx.amount || 0),
              0
            );
            this.totalCharges = this.allTransactions.reduce(
              (sum, tx) => sum + (tx.charges || 0),
              0
            );

            this.applyFilters();
          } else {
            this.error = 'No transactions data found';
          }
          this.loading = false;
        },
        error: (err) => {
          this.error = 'Failed to fetch transactions';
          this.loading = false;
        },
      });
  }

  updatePagination() {
    const totalPages = Math.ceil(
      this.filteredTransactions.length / this.pageSize
    );
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
      filtered = filtered.filter((tx) => tx.status === this.filters.status);
    }

    if (this.filters.type) {
      filtered = filtered.filter(
        (tx) => tx.transaction_type === this.filters.type
      );
    }

    if (this.filters.search) {
      const search = this.filters.search.toLowerCase();
      filtered = filtered.filter(
        (tx) =>
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
    const totalPages = Math.ceil(
      this.filteredTransactions.length / this.pageSize
    );

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
      minute: '2-digit',
    });
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-GH', {
      style: 'currency',
      currency: 'GHS',
    }).format(amount);
  }
}
