import { Component, OnInit } from '@angular/core';
import { NgxsModule, Select, Store } from '@ngxs/store';
import { Observable } from 'rxjs';
import { HttpClient, HttpClientModule, HttpHeaders } from '@angular/common/http';
import { AuthState } from '../../state/apps/app.states';
import { AsyncPipe, CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';

interface App {
  _id: string;
  name: string;
  apikey: string;
  ussdShortCode: string;
  ussdPaymentCallbackUrl: string;
  operations: string[];
  cardTransactionCharge: number;
  momoTransactionCharge: number;
  btcTransactionCharge: number;
  ussdEnabled: boolean;
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

interface WalletAccount {
  accountType: string;
  walletType: string;
  currency: string;
  blockedBalance: number;
  unConfirmedBalance: number;
  merchantId: string;
  walletId: string;
  totalBalance: number;
  balance: number;
  lastBalance: number;
  type: string;
  active: boolean;
  confirmedBalance: number;
  accountNumber: string;
  availableBalance: number;
  id: string;
}

@Component({
  selector: 'app-hub-dashboard',
  standalone: true,
  imports: [CommonModule, HttpClientModule, AsyncPipe, NgxsModule, FormsModule, ReactiveFormsModule],
  templateUrl: './hub-dashboard.component.html',
  styleUrls: ['./hub-dashboard.component.scss']
})
export class HubDashboardComponent implements OnInit {
  @Select(AuthState.user) user$!: Observable<any>;
  @Select(AuthState.token) token$!: Observable<string>;
  
  merchantId: string = '';
  apps: App[] = [];
  balance: WalletAccount | null = null;
  loading = false;
  error = '';
  showCreateModal = false;
  newAppName = '';
  merchantname: string= '';
  showUpdateModal = false;
  updateForm: FormGroup;
  currentAppId: string = '';
  isKeyVisible: { [key: string]: boolean } = {};

  constructor(
    private http: HttpClient,
    private store: Store,
    private router: Router,
    private fb: FormBuilder,
  ) {
    this.updateForm = this.fb.group({
      ussdShortCode: ['', Validators.pattern(/^\*\d+#$/)],
      ussdPaymentCallbackUrl: ['', Validators.pattern(/^https?:\/\/.+/)],
      ussdEnabled: [false]
    });
  }

  ngOnInit() {
    this.store.select(AuthState.user).subscribe(user => {
      
      let merchantIdValue;
      
      if (typeof user?.merchantId === 'string') {
        // If merchantId is a string, use it directly
        merchantIdValue = user.merchantId;
        console.log('Merchant ID found (string):', merchantIdValue);
      } else if (user?.merchantId?._id) {
        // If merchantId is an object with _id, use that
        merchantIdValue = user.merchantId._id;
      }
      
      if (merchantIdValue) {
        this.merchantId = merchantIdValue;
        this.fetchApps(this.merchantId);
        
        // Set merchant name if available
        if (typeof user?.merchantId === 'object' && user?.merchantId?.merchant_tradeName) {
          this.merchantname = user.merchantId.merchant_tradeName;
        } else {
          // Default merchantname if not available
          this.merchantname = 'Merchant';
        }
      } else {
        console.log('No merchant ID found in user object');
      }
    });
    console.log('After AuthState.user subscription');
    
    this.apps.forEach(app => {
      this.isKeyVisible[app._id] = false;
    });
  }

  toggleKeyVisibility(appId: string) {
    this.isKeyVisible[appId] = !this.isKeyVisible[appId];
    
    // Automatically hide after 30 seconds
    if (this.isKeyVisible[appId]) {
      setTimeout(() => {
        this.isKeyVisible[appId] = false;
      }, 30000);
    }
  }

  fetchApps(merchantId: string) {
    this.loading = true;
    this.http.get<any>(`https://doronpay.com/api/hub/get/${merchantId}`, {
      headers: this.getHeaders()
    }).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.apps = response.data;
          // Initialize visibility state for all apps
          this.apps.forEach(app => {
            this.isKeyVisible[app._id] = false;
          });
        }
        this.loading = false;
      },
      error: (err) => {
        // alert('Failed to fetch apps');
        this.loading = false;
      }
    });
  }

  // fetchBalance(merchantId: string) {
  //   this.http.get<any>(`https://doronpay.com/api/accounts/merchant/${merchantId}`, {
  //     headers: this.getHeaders()
  //   }).subscribe({
  //     next: (response) => {
  //       if (response.success && response.data) {
  //         this.balance = response.data;
  //       }
  //     },
  //     error: (err) => {
  //       alert('Failed to fetch balance');
  //     }
  //   });
  // }

  generateNewKey(appId: string, merchantId: string) {
    if (!merchantId) {
      alert('Merchant ID not found');
      return;
    }

    if (confirm('Are you sure you want to generate a new API key? The old key will stop working immediately.')) {
      this.loading = true;
      this.http.post<any>('https://doronpay.com/api/hub/generatekey', {
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
    this.http.post<any>('https://doronpay.com/api/hub/new', {
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
      currency: 'GHS',
      minimumFractionDigits: 2
    }).format(amount);
  }

  formatAccountNumber(number: string): string {
    return number.replace(/(\d{4})/g, '$1 ').trim();
  }

  openUpdateModal(app: App) {
    this.currentAppId = app._id;
    this.updateForm.patchValue({
      ussdShortCode: app.ussdShortCode || '',
      ussdPaymentCallbackUrl: app.ussdPaymentCallbackUrl || '',
      ussdEnabled: app.ussdEnabled || false
    });
    this.showUpdateModal = true;
  }

  closeModal(event: MouseEvent) {
    if ((event.target as HTMLElement).className === 'modal-overlay') {
      this.showUpdateModal = false;
    }
  }

  updateWalletDetails() {
    if (this.updateForm.invalid) return;

    const payload = {
      id: this.currentAppId,
      data: this.updateForm.value
    };

    this.loading = true;
    this.http.put('https://doronpay.com/api/hub/update', payload, {
      headers: this.getHeaders()
    }).subscribe({
      next: (response: any) => {
        if (response.success) {
          this.showUpdateModal = false;
          this.fetchApps(this.merchantId);
          alert('Wallet settings updated successfully');
        } else {
          alert(response.message || 'Failed to update wallet settings');
        }
        this.loading = false;
      },
      error: (err) => {
        alert('Failed to update wallet settings');
        this.loading = false;
      }
    });
  }

  copyApiKey(text: string) {
    navigator.clipboard.writeText(text).then(() => {
      // You could show a toast notification here
      alert('API key copied to clipboard');
    });
  }
}


