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
      <div class="settlements-container">
        <!-- Header -->
        <div class="header">
          <div class="title-section">
            <h1>Settlements Overview</h1>
            <p>Track and manage your settlements</p>
          </div>
        </div>
  
        <!-- Stats Summary -->
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-icon">
              <i class="material-icons">account_balance</i>
            </div>
            <div class="stat-info">
              <span class="label">Total Settlements</span>
              <span class="value">{{getTotalSettlements()}}</span>
            </div>
          </div>
  
          <div class="stat-card">
            <div class="stat-icon">
              <i class="material-icons">payments</i>
            </div>
            <div class="stat-info">
              <span class="label">Total Amount</span>
              <span class="value">{{formatCurrency(getTotalAmount())}}</span>
            </div>
          </div>
  
          <div class="stat-card">
            <div class="stat-icon">
              <i class="material-icons">money_off</i>
            </div>
            <div class="stat-info">
              <span class="label">Total Charges</span>
              <span class="value">{{formatCurrency(getTotalCharges())}}</span>
            </div>
          </div>
  
          <div class="stat-card">
            <div class="stat-icon">
              <i class="material-icons">receipt_long</i>
            </div>
            <div class="stat-info">
              <span class="label">Total Transactions</span>
              <span class="value">{{getTotalTransactions()}}</span>
            </div>
          </div>
        </div>
  
        <!-- Loading State -->
        <div class="loading-spinner" *ngIf="loading">
          <div class="spinner"></div>
        </div>
  
        <!-- Error Message -->
        <div class="error-message" *ngIf="error">{{error}}</div>
  
        <!-- Settlements Table -->
        <div class="table-container" *ngIf="!loading && settlements.length > 0">
          <table class="settlements-table">
            <thead>
              <tr>
                <th>Date Range</th>
                <th>Transactions</th>
                <th>Amount</th>
                <th>Charges</th>
                <th>Net Amount</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
            <tr *ngFor="let settlement of paginatedSettlements">
                <td>
                  <div class="date-range">
                    <span class="date">{{formatDate(settlement.startDate)}}</span>
                    <span class="separator">to</span>
                    <span class="date">{{formatDate(settlement.endDate)}}</span>
                  </div>
                </td>
                <td>
                  <span class="transaction-count">{{settlement.count}}</span>
                </td>
                <td>{{formatCurrency(settlement.amountWithCharges)}}</td>
                <td>{{formatCurrency(settlement.totalCharges)}}</td>
                <td>{{formatCurrency(settlement.totalAmountWithoutCharges)}}</td>
                <td>
                  <span class="status-badge" [class]="settlement.status.toLowerCase()">
                    {{settlement.status}}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
          <!-- Pagination Controls -->
        <div class="pagination-controls">
          <button 
            class="pagination-button" 
            [disabled]="currentPage === 1"
            (click)="changePage(currentPage - 1)">
            <i class="material-icons">chevron_left</i>
          </button>
          
          <span class="page-info">
            Page {{currentPage}} of {{totalPages}}
          </span>

          <button 
            class="pagination-button" 
            [disabled]="currentPage === totalPages"
            (click)="changePage(currentPage + 1)">
            <i class="material-icons">chevron_right</i>
          </button>
        </div>
      </div>

      <!-- No Data -->
      <div class="no-data" *ngIf="!loading && settlements.length === 0">
        <i class="material-icons">account_balance_wallet_off</i>
        <p>No settlements found</p>
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
  pageSize = 10;

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
      const merchantId = this.store.selectSnapshot(state => state.auth.user?.merchantId?._id);
      const response = await this.http.get<any>(
        `https://lazypaygh.com/api/settlements/get/${merchantId}`,
        { headers: this.getHeaders() }
      ).toPromise();

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
