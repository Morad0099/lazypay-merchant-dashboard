// payment-link-generator.component.ts
import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import {
  FormBuilder,
  FormGroup,
  Validators,
  FormsModule,
  ReactiveFormsModule,
  FormControl,
} from '@angular/forms';
import { CommonModule, DatePipe } from '@angular/common';
import { ClipboardModule } from '@angular/cdk/clipboard';
import { NgxsModule, Select, Store } from '@ngxs/store';
import { AuthState } from '../../state/apps/app.states';
import { Observable } from 'rxjs';

enum AccountCurrency {
  GHS = "GHS",
  USD = "USD",
  EUR = "EUR",
  NGN = "NGN",
  KES = "KES",
  BTC = "BTC",
}

interface PaymentLinkResponse {
  success: boolean;
  message: string;
  data?: {
    url: string;
    linkId: string;
    expiresAt?: string;
    amount: number;
    currency: string;
    merchantName: string;
  };
}

@Component({
  selector: 'app-payment-link-generator',
  templateUrl: './payment-link-generator.component.html',
  standalone: true,
  imports: [
    ReactiveFormsModule, 
    FormsModule, 
    CommonModule, 
    ClipboardModule,
    NgxsModule,
  ],
  styleUrls: ['./payment-link-generator.component.scss'],
  providers: [DatePipe]
})
export class PaymentLinkGeneratorComponent implements OnInit {
  @Select(AuthState.user) user$!: Observable<any>;
  @Select(AuthState.token) token$!: Observable<string>;
  
  // Form
  paymentLinkForm: FormGroup;
  
  // Currency options
  currencies = Object.values(AccountCurrency);
  
  // Result display
  paymentLink: {
    url: string;
    linkId: string;
    expiresAt?: string;
    amount: number;
    currency: string;
    merchantName: string;
  } | null = null;
  loading = false;
  error = '';
  success = false;
  copied = false;
  
  // Merchant data
  merchantId: string = '';
  merchantName: string = '';
  
  // Min date for expiry (tomorrow)
  minDate: string;

  constructor(
    private http: HttpClient,
    private fb: FormBuilder,
    private datePipe: DatePipe,
    private store: Store
  ) {
    // Calculate tomorrow's date for min date value
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    this.minDate = tomorrow.toISOString().split('T')[0];
    
    // Initialize form
    this.paymentLinkForm = this.fb.group({
      merchantId: ['', Validators.required],
      amount: ['', [Validators.required, Validators.min(0.01), Validators.pattern(/^\d+(\.\d{1,2})?$/)]],
      currency: [AccountCurrency.GHS, Validators.required],
      description: ['', [Validators.maxLength(200)]],
      accountName: ['', [Validators.maxLength(100)]],
      expiryDate: ['', []]
    });
  }

  ngOnInit(): void {
    // Get merchant ID from store
    this.store.select(AuthState.user).subscribe((user) => {
      if (user?.merchantId?._id) {
        this.merchantId = user.merchantId._id;
        this.merchantName = user.merchantId.merchant_tradeName;
        
        // Set merchant ID in form
        this.paymentLinkForm.patchValue({
          merchantId: this.merchantId
        });
      }
    });
  }

  private getHeaders(): HttpHeaders {
    const token = this.store.selectSnapshot(AuthState.token);
    return new HttpHeaders().set('Authorization', `Bearer ${token}`);
  }

  generatePaymentLink(): void {
    if (this.paymentLinkForm.invalid) {
      this.markFormGroupTouched(this.paymentLinkForm);
      return;
    }

    this.loading = true;
    this.error = '';
    this.success = false;
    this.paymentLink = null;
    this.copied = false;

    // Format the expiry date if provided
    const formValues = { ...this.paymentLinkForm.value };
    if (formValues.expiryDate) {
      // Ensure the date is in ISO format
      const expiryDate = new Date(formValues.expiryDate);
      formValues.expiryDate = expiryDate.toISOString();
    }

    // Make API request with authentication header
    this.http.post<PaymentLinkResponse>(
      'https://doronpay.com/api/transactions/payment-links/create',
      formValues,
      { headers: this.getHeaders() }
    ).subscribe({
      next: (response) => {
        this.loading = false;
        if (response.success && response.data) {
          this.success = true;
          this.paymentLink = response.data;
        } else {
          this.error = response.message || 'Failed to generate payment link';
        }
      },
      error: (err) => {
        this.loading = false;
        this.error = err.error?.message || 'Error generating payment link';
        console.error('Error generating payment link:', err);
      }
    });
  }

  copyToClipboard(): void {
    // This is called when the copy button is clicked
    this.copied = true;
    
    // Reset the copied status after 3 seconds
    setTimeout(() => {
      this.copied = false;
    }, 3000);
  }

  reset(): void {
    // Reset form but keep the merchant ID
    this.paymentLinkForm.reset({
      merchantId: this.merchantId,
      currency: AccountCurrency.GHS
    });
    this.paymentLink = null;
    this.error = '';
    this.success = false;
    this.copied = false;
  }

  // Helper method to mark all controls as touched
  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched();
      if ((control as any).controls) {
        this.markFormGroupTouched(control as FormGroup);
      }
    });
  }

  // Helper method to check if a specific field has an error
  hasError(controlName: string, errorName: string): boolean {
    const control = this.paymentLinkForm.get(controlName);
    return control !== null && control.touched && control.hasError(errorName);
  }
  
  // Format date for display
  formatDate(dateString?: string): string {
    if (!dateString) return 'No expiry';
    return this.datePipe.transform(dateString, 'medium') || dateString;
  }
  
  // Format currency for display
  formatCurrency(amount: number, currency: string): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: currency === 'BTC' ? 8 : 2,
    }).format(amount || 0);
  }
}