import { CommonModule } from '@angular/common';
import {
  HttpClient,
  HttpClientModule,
  HttpHeaders,
} from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Store } from '@ngxs/store';
import { AuthState } from '../../state/apps/app.states';

interface Settlement {
  _id: string;
  merchantId: string;
  count: number;
  amountWithCharges: number;
  totalAmountWithoutCharges: number;
  totalCharges: number;
  amount: number;
  startDate: string;
  endDate: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

@Component({
  selector: 'app-settlements',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  template: `
    <div class="min-h-screen p-6">
      <div class="max-w-7xl mx-auto space-y-6">
        <!-- Header -->
        <div class="bg-white rounded-lg p-6 shadow-sm">
          <h1 class="text-2xl font-bold text-gray-900">Settlements Overview</h1>
          <p class="text-gray-500">Track and manage your settlements</p>
        </div>

        <!-- Stats Grid -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div class="bg-white p-6 rounded-lg shadow-sm">
            <div class="flex items-center space-x-4">
              <div class="p-3 bg-blue-100 rounded-full">
                <i class="material-icons text-blue-600">account_balance</i>
              </div>
              <div>
                <p class="text-sm text-gray-500">Total Settlements</p>
                <p class="text-xl font-semibold">{{ getTotalSettlements() }}</p>
              </div>
            </div>
          </div>

          <div class="bg-white p-6 rounded-lg shadow-sm">
            <div class="flex items-center space-x-4">
              <div class="p-3 bg-green-100 rounded-full">
                <i class="material-icons text-green-600">payments</i>
              </div>
              <div>
                <p class="text-sm text-gray-500">Total Amount</p>
                <p class="text-xl font-semibold">
                  {{ formatCurrency(getTotalAmount()) }}
                </p>
              </div>
            </div>
          </div>

          <div class="bg-white p-6 rounded-lg shadow-sm">
            <div class="flex items-center space-x-4">
              <div class="p-3 bg-red-100 rounded-full">
                <i class="material-icons text-red-600">money_off</i>
              </div>
              <div>
                <p class="text-sm text-gray-500">Total Charges</p>
                <p class="text-xl font-semibold">
                  {{ formatCurrency(getTotalCharges()) }}
                </p>
              </div>
            </div>
          </div>

          <div class="bg-white p-6 rounded-lg shadow-sm">
            <div class="flex items-center space-x-4">
              <div class="p-3 bg-purple-100 rounded-full">
                <i class="material-icons text-purple-600">receipt_long</i>
              </div>
              <div>
                <p class="text-sm text-gray-500">Total Transactions</p>
                <p class="text-xl font-semibold">
                  {{ getTotalTransactions() }}
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- Loading State -->
        <div class="flex justify-center items-center h-64" *ngIf="loading">
          <div
            class="animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent"
          ></div>
        </div>

        <!-- Error Message -->
        <div class="p-4 text-red-600 bg-red-50 rounded-lg" *ngIf="error">
          {{ error }}
        </div>

        <!-- Settlements Table -->
        <div
          class="bg-white rounded-lg shadow-sm overflow-hidden"
          *ngIf="!loading && settlements.length > 0"
        >
          <div class="overflow-x-auto">
            <table class="w-full">
              <thead class="bg-gray-50">
                <tr>
                  <th
                    class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Date Range
                  </th>
                  <th
                    class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Transactions
                  </th>
                  <th
                    class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Amount
                  </th>
                  <th
                    class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Charges
                  </th>
                  <th
                    class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Net Amount
                  </th>
                  <th
                    class="px-12 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Status
                  </th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-200">
                <tr
                  *ngFor="let settlement of paginatedSettlements"
                  class="hover:bg-gray-50"
                >
                  <td class="px-6 py-4">
                    <div class="flex flex-col">
                      <span class="text-sm text-gray-900">{{
                        formatDate(settlement.startDate)
                      }}</span>
                      <span class="text-sm text-gray-500">to</span>
                      <span class="text-sm text-gray-900">{{
                        formatDate(settlement.endDate)
                      }}</span>
                    </div>
                  </td>
                  <td class="px-6 py-4 text-sm text-gray-900">
                    {{ settlement.count }}
                  </td>
                  <td class="px-6 py-4 text-sm text-gray-900">
                    {{ formatCurrency(settlement.amountWithCharges) }}
                  </td>
                  <td class="px-6 py-4 text-sm text-gray-900">
                    {{ formatCurrency(settlement.totalCharges) }}
                  </td>
                  <td class="px-6 py-4 text-sm text-gray-900">
                    {{ formatCurrency(settlement.totalAmountWithoutCharges) }}
                  </td>
                  <td class="px-6 py-4">
                    <span
                      class="px-3 py-1 text-sm font-medium rounded-full"
                      [class.bg-green-100]="settlement.status === 'Completed'"
                      [class.text-green-800]="settlement.status === 'Completed'"
                      [class.bg-yellow-100]="settlement.status === 'Pending'"
                      [class.text-yellow-800]="settlement.status === 'Pending'"
                      [class.bg-red-100]="settlement.status === 'Failed'"
                      [class.text-red-800]="settlement.status === 'Failed'"
                    >
                      {{ settlement.status }}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Pagination -->
          <div class="bg-gray-50 px-6 py-3 flex items-center justify-between">
            <button
              class="px-3 py-1 rounded-md bg-white text-gray-700 border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
              [disabled]="currentPage === 1"
              (click)="changePage(currentPage - 1)"
            >
              <i class="material-icons text-sm">chevron_left</i>
            </button>

            <span class="text-sm text-gray-700">
              Page {{ currentPage }} of {{ totalPages }}
            </span>

            <button
              class="px-3 py-1 rounded-md bg-white text-gray-700 border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
              [disabled]="currentPage === totalPages"
              (click)="changePage(currentPage + 1)"
            >
              <i class="material-icons text-sm">chevron_right</i>
            </button>
          </div>
        </div>

        <!-- No Data -->
        <div
          class="flex flex-col items-center justify-center h-64 bg-white rounded-lg"
          *ngIf="!loading && settlements.length === 0"
        >
          <i class="material-icons text-4xl text-gray-400"
            >account_balance_wallet_off</i
          >
          <p class="mt-2 text-gray-500">No settlements found</p>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['./merchant-settlements.component.scss'],
})
export class SettlementsComponent implements OnInit {
  settlements: Settlement[] = [];
  loading = false;
  error = '';

  currentPage = 1;
  pageSize = 5;

  constructor(private http: HttpClient, private store: Store) {}

  ngOnInit() {
    this.fetchSettlements();
  }

  get paginatedSettlements(): Settlement[] {
    const startIndex = (this.currentPage - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    return this.settlements.slice(startIndex, endIndex);
  }

  get totalPages(): number {
    return Math.ceil(this.settlements.length / this.pageSize);
  }

  changePage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }

  private getHeaders(): HttpHeaders {
    const token = this.store.selectSnapshot(AuthState.token);
    return new HttpHeaders().set('Authorization', `Bearer ${token}`);
  }

  async fetchSettlements() {
    this.loading = true;
    this.error = '';

    try {
      const merchantId = this.store.selectSnapshot(
        (state) => state.auth.user?.merchantId?._id
      );
      const response = await this.http
        .get<any>(`https://lazypaygh.com/api/settlements/get/${merchantId}`, {
          headers: this.getHeaders(),
        })
        .toPromise();

      if (response?.success) {
        this.settlements = response.data;
        this.currentPage = 1; // Reset to first page when new data is loaded
      } else {
        this.error = 'Failed to load settlements';
      }
    } catch (err) {
      this.error = 'Failed to load settlements';
      console.error('Settlement fetch error:', err);
    } finally {
      this.loading = false;
    }
  }

  // Stats calculation methods
  getTotalSettlements(): number {
    return this.settlements.length;
  }

  getTotalAmount(): number {
    return this.settlements.reduce(
      (sum, settlement) => sum + settlement.amountWithCharges,
      0
    );
  }

  getTotalCharges(): number {
    return this.settlements.reduce(
      (sum, settlement) => sum + settlement.totalCharges,
      0
    );
  }

  getTotalTransactions(): number {
    return this.settlements.reduce(
      (sum, settlement) => sum + settlement.count,
      0
    );
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-GH', {
      style: 'currency',
      currency: 'GHS',
    }).format(amount);
  }
}
