import { Component, OnInit } from '@angular/core';
import { AsyncPipe, CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule, HttpHeaders } from '@angular/common/http';
import { FormBuilder } from '@angular/forms';
import { NgxsModule, Select, Store } from '@ngxs/store';
import { AuthState } from '../../state/apps/app.states';
import { Observable } from 'rxjs';

interface WalletAccount {
  _id: string;
  accountType: string;
  walletId: string;
  accountNumber: string;
  merchantId: string;
  walletType: string;
  currency: string;
  blockedBalance: number;
  confirmedBalance: number;
  unConfirmedBalance: number;
  totalBalance: number;
  balance: number;
  lastBalance: number;
  active: boolean;
  availableBalance: number;
  id: string;
  createdAt: string;
  updatedAt: string;
}

@Component({
  selector: 'app-merchant-wallets',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, HttpClientModule, AsyncPipe, NgxsModule],
  templateUrl: './merchant-wallets.component.html',
  styleUrls: ['./merchant-wallets.component.scss']
})
export class MerchantWalletsComponent implements OnInit {
  @Select(AuthState.user) user$!: Observable<any>;
  @Select(AuthState.token) token$!: Observable<string>;

  loading = false;
  error: string | null = null;
  searchTerm: string = '';
  filteredWallets: WalletAccount[] = [];
  wallets: WalletAccount[] = [];
  merchantId: string = '';
  merchantname: string = '';

  constructor(
    private http: HttpClient,
    private fb: FormBuilder,
    private store: Store,
  ) {}

  ngOnInit(): void {
    this.store.select(AuthState.user).subscribe(user => {
      if (user?.merchantId?._id) {
        this.merchantId = user.merchantId._id;
        this.merchantname = user.merchantId.merchant_tradeName;
        this.fetchWallets(this.merchantId);
      }
    });
  }

  fetchWallets(merchantId: string) {
    this.loading = true;
    this.error = null;
    
    this.http.get<any>(`https://doronpay.com/api/accounts/merchant/${merchantId}`, {
      headers: this.getHeaders()
    }).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.wallets = response.data;
          this.filteredWallets = response.data;
        }
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to fetch wallets. Please try again later.';
        this.loading = false;
      }
    });
  }

  private getHeaders(): HttpHeaders {
    const token = this.store.selectSnapshot(AuthState.token);
    return new HttpHeaders().set('Authorization', `Bearer ${token}`);
  }

  searchWallets(event: KeyboardEvent): void {
    const searchTerm = (event.target as HTMLInputElement).value.toLowerCase();
    this.searchTerm = searchTerm;
    this.filterWallets();
  }

  filterWallets(): void {
    if (!this.searchTerm.trim()) {
      this.filteredWallets = this.wallets;
      return;
    }

    this.filteredWallets = this.wallets.filter(wallet => {
      return (
        wallet.accountNumber.toLowerCase().includes(this.searchTerm) ||
        wallet.walletType.toLowerCase().includes(this.searchTerm) ||
        wallet.currency.toLowerCase().includes(this.searchTerm) ||
        wallet.accountType.toLowerCase().includes(this.searchTerm)
      );
    });
  }

  formatAccountNumber(accountNumber: string): string {
    if (!accountNumber) return '';
    return accountNumber.replace(/(\d{4})/g, '$1 ').trim();
  }

  formatCurrency(amount: number, currency: string): string {
    return new Intl.NumberFormat('en-GH', {
      style: 'currency',
      currency: currency
    }).format(amount || 0);
  }

  getStatusClass(active: boolean): string {
    return active ? 'status-active' : 'status-inactive';
  }
}