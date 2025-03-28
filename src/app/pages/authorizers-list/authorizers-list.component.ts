// authorizers-list.component.ts
import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { NgxsModule, Select, Store } from '@ngxs/store';
import { AuthState } from '../../state/apps/app.states';
import { Observable } from 'rxjs';

interface Authorizer {
  _id: string;
  payrollId: string;
  merchantId: string;
  authorizer: [] | any;
  status: string;
  createdAt: string;
  updatedAt: string;
}

interface AuthorizersResponse {
  success: boolean;
  message: string;
  data?: Authorizer[];
}

@Component({
  selector: 'app-authorizers-list',
  templateUrl: './authorizers-list.component.html',
  standalone: true,
  imports: [
    CommonModule,
    NgxsModule,
  ],
  styleUrls: ['./authorizers-list.component.scss']
})
export class AuthorizersListComponent implements OnInit {
  @Select(AuthState.user) user$!: Observable<any>;
  @Select(AuthState.token) token$!: Observable<string>;
  
  authorizers: Authorizer[] = [];
  loading = false;
  error = '';
  
  // Merchant data
  merchantId: string = '';
  merchantName: string = '';

  constructor(
    private http: HttpClient,
    private store: Store
  ) {}

  ngOnInit(): void {
    // Get merchant ID from store
    this.store.select(AuthState.user).subscribe((user) => {
      if (user?.merchantId?._id) {
        this.merchantId = user.merchantId._id;
        this.merchantName = user.merchantId.merchant_tradeName;
        
        // Fetch authorizers once we have the merchant ID
        this.fetchAuthorizers();
      }
    });
  }

  private getHeaders(): HttpHeaders {
    const token = this.store.selectSnapshot(AuthState.token);
    return new HttpHeaders().set('Authorization', `Bearer ${token}`);
  }

  fetchAuthorizers(): void {
    if (!this.merchantId) {
      this.error = 'Merchant ID not available';
      return;
    }

    this.loading = true;
    this.error = '';

    this.http.get<AuthorizersResponse>(
      `https://doronpay.com/api/payrolls/authorizers/${this.merchantId}`,
      { headers: this.getHeaders() }
    ).subscribe({
      next: (response) => {
        this.loading = false;
        if (response.success && response.data) {
          this.authorizers = response.data;
        } else {
          this.error = response.message || 'Failed to fetch authorizers';
        }
      },
      error: (err) => {
        this.loading = false;
        this.error = err.error?.message || 'Error fetching authorizers';
        console.error('Error fetching authorizers:', err);
      }
    });
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'APPROVED':
        return 'bg-green-100 text-green-800';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'REJECTED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-blue-100 text-blue-800';
    }
  }
}