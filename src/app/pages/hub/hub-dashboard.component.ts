import { Component, OnInit } from '@angular/core';
import { NgxsModule, Select, Store } from '@ngxs/store';
import { Observable } from 'rxjs';
import { HttpClient, HttpClientModule, HttpHeaders } from '@angular/common/http';
import { AuthState } from '../../state/apps/app.states';
import { AsyncPipe, CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

interface App {
  _id: string;
  name: string;
  apikey: string;
  operations: string[];
  cardTransactionCharge: number;
  momoTransactionCharge: number;
  btcTransactionCharge: number;
  mode: string;
  createdAt: string;
}

interface Balance {
  totalBalance: number;
  balance: number;
  confirmedBalance: number;
  accountNumber: string;
  blockedBalance: number;
}

@Component({
  selector: 'app-hub-dashboard',
  standalone: true,
  imports: [CommonModule, HttpClientModule, AsyncPipe, NgxsModule, FormsModule],
  templateUrl: './hub-dashboard.component.html',
  styleUrls: ['./hub-dashboard.component.scss']
})
export class HubDashboardComponent implements OnInit {
  @Select(AuthState.user) user$!: Observable<any>;
  @Select(AuthState.token) token$!: Observable<string>;
  
  merchantId: string = '';
  apps: App[] = [];
  balance: Balance | null = null;
  loading = false;
  error = '';
  showCreateModal = false;
  newAppName = '';
  merchantname: string= '';

  constructor(
    private http: HttpClient,
    private store: Store,
    private router: Router
  ) {}

  ngOnInit() {
    this.store.select(AuthState.user).subscribe(user => {
      if (user?.merchantId?._id) {
        this.merchantId = user.merchantId._id;
        this.fetchApps(this.merchantId);
        this.fetchBalance(this.merchantId);
        this.merchantname = user.merchantId.merchant_tradeName;
      }
    });
  }

  fetchApps(merchantId: string) {
    this.loading = true;
    this.http.get<any>(`https://lazypaygh.com/api/hub/get/${merchantId}`, {
      headers: this.getHeaders()
    }).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.apps = response.data;
        }
        this.loading = false;
      },
      error: (err) => {
        alert('Failed to fetch apps');
        this.loading = false;
      }
    });
  }

  fetchBalance(merchantId: string) {
    this.http.get<any>(`https://lazypaygh.com/api/merchants/balance/get/${merchantId}`, {
      headers: this.getHeaders()
    }).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.balance = response.data;
        }
      },
      error: (err) => {
        alert('Failed to fetch balance');
      }
    });
  }

  generateNewKey(appId: string, merchantId: string) {
    if (!merchantId) {
      alert('Merchant ID not found');
      return;
    }

    if (confirm('Are you sure you want to generate a new API key? The old key will stop working immediately.')) {
      this.loading = true;
      this.http.post<any>('https://lazypaygh.com/api/hub/generatekey', {
        appId,
        merchantId
      }, { headers: this.getHeaders() }).subscribe({
        next: (response) => {
          if (response.success) {
            alert('New API key generated successfully');
            this.fetchApps(merchantId);
          } else {
            alert(response.message || 'Failed to generate new key');
          }
          this.loading = false;
        },
        error: (err) => {
          alert('Failed to generate new key');
          this.loading = false;
        }
      });
    }
  }

  createNewApp() {
    if (!this.newAppName.trim()) {
      alert('Please enter an app name');
      return;
    }

    this.loading = true;
    this.http.post<any>('https://lazypaygh.com/api/hub/new', {
      merchantId: this.merchantId,
      name: this.newAppName.trim()
    }, { headers: this.getHeaders() }).subscribe({
      next: (response) => {
        if (response.success) {
          alert('App created successfully');
          this.newAppName = '';
          this.showCreateModal = false;
          this.fetchApps(this.merchantId);
        } else {
          alert(response.message || 'Failed to create app');
        }
        this.loading = false;
      },
      error: (err) => {
        alert('Failed to create app');
        this.loading = false;
      }
    });
  }

  viewTransactions(appId: string) {
    this.router.navigate(['/transactions', appId]);
  }

  private getHeaders(): HttpHeaders {
    const token = this.store.selectSnapshot(AuthState.token);
    return new HttpHeaders().set('Authorization', `Bearer ${token}`);
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString();
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-GH', {
      style: 'currency',
      currency: 'GHS'
    }).format(amount);
  }
}


