// payment-links-page.component.ts
import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { NgxsModule, Select, Store } from '@ngxs/store';
import { AuthState } from '../../state/apps/app.states';
import { Observable } from 'rxjs';
import { PaymentLinkGeneratorComponent } from '../payment-link-generator/payment-link-generator.component';

interface PaymentLink {
  linkId: string;
  merchantName: string;
  amount: number;
  currency: string;
  description: string;
  accountName: string;
  status: string;
  createdAt: string;
}

interface ApiResponse {
  success: boolean;
  message: string;
  data: PaymentLink[];
}

@Component({
  selector: 'app-payment-links-page',
  templateUrl: './payment-links-page.component.html',
  standalone: true,
  imports: [
    CommonModule, 
    NgxsModule,
    PaymentLinkGeneratorComponent
  ]
})
export class PaymentLinksPageComponent implements OnInit {
  @Select(AuthState.user) user$!: Observable<any>;
  @Select(AuthState.token) token$!: Observable<string>;
  
  paymentLinks: PaymentLink[] = [];
  isLoading: boolean = true;
  error: string | null = null;
  activeView: 'list' | 'create' = 'list';
  merchantId: string = '';
  
  constructor(
    private http: HttpClient,
    private store: Store
  ) {}

  ngOnInit(): void {
    // Get merchant ID from store
    this.store.select(AuthState.user).subscribe((user) => {
      if (user?.merchantId?._id) {
        this.merchantId = user.merchantId._id;
        this.fetchPaymentLinks();
      }
    });
  }

  private getHeaders(): HttpHeaders {
    const token = this.store.selectSnapshot(AuthState.token);
    return new HttpHeaders().set('Authorization', `Bearer ${token}`);
  }

  fetchPaymentLinks(): void {
    this.isLoading = true;
    this.http.get<ApiResponse>(
      `https://doronpay.com/api/transactions/payment-links/merchant/${this.merchantId}`,
      { headers: this.getHeaders() }
    ).subscribe({
      next: (response) => {
        if (response.success) {
          this.paymentLinks = response.data;
        } else {
          this.error = response.message || 'Failed to fetch payment links';
        }
        this.isLoading = false;
      },
      error: (err) => {
        this.error = err.error?.message || 'An error occurred while fetching payment links';
        this.isLoading = false;
        console.error('Error fetching payment links:', err);
      }
    });
  }

  refreshLinks(): void {
    this.error = null;
    this.fetchPaymentLinks();
  }

  toggleView(view: 'list' | 'create'): void {
    this.activeView = view;
    if (view === 'list') {
      this.refreshLinks();
    }
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  getStatusClass(status: string): string {
    switch (status.toUpperCase()) {
      case 'ACTIVE':
        return 'bg-green-100 text-green-800';
      case 'INACTIVE':
        return 'bg-gray-100 text-gray-800';
      case 'EXPIRED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-blue-100 text-blue-800';
    }
  }

  formatCurrency(amount: number, currency: string): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: currency === 'BTC' ? 8 : 2,
    }).format(amount || 0);
  }
}