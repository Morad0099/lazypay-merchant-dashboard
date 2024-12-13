import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Store } from '@ngxs/store';
import { AuthState } from '../../state/apps/app.states';

interface MerchantProfile {
  _id: string;
  merchant_tradeName: string;
  email: string;
  phone: string;
  address: string;
  lineOfBusiness: string;
  location: string;
  registrationNumber: string;
  contact_person: string;
  contactPersonDesignation: string;
  contactPersonEmail: string;
  contactPersonPhone: string;
  operations: string[];
  debitOperator: string;
  creditOperator: string;
  debitCardOperator: string;
  type: string;
  accountType: string;
  chargeType: string;
  approvedDate: string;
  createdAt: string;
  autosettle: boolean;
  active: boolean;
  updatedAt: string;
  // Charges
  btc_charge: number;
  card_charge: number;
  momo_charge: number;
  momo_cap: number;
  momo_min_charge: number;
  disburse_gip_charge: number;
  disburse_momo_charge: number;
  disburse_nrt_charge: number;
}

interface Document {
  _id: string;
  name: string;
  data: string;
  createdAt: string;
}

@Component({
  selector: 'app-merchant-profile',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="profile-container">
      <div class="loading-spinner" *ngIf="loading">
        <div class="spinner"></div>
      </div>

      <div class="error-message" *ngIf="error">{{ error }}</div>

      <ng-container *ngIf="!loading && !error">
        <!-- Header Section -->
        <div class="profile-header">
          <div class="merchant-info">
            <h1>{{ profile?.merchant_tradeName }}</h1>
            <span class="status" [class.active]="profile?.active">
              {{ profile?.active ? 'Active' : 'Inactive' }}
            </span>
          </div>
          <div class="meta-info">
            <p>Registered: {{ formatDate(profile?.createdAt) }}</p>
            <p>Last Updated: {{ formatDate(profile?.updatedAt) }}</p>
          </div>
        </div>

        <!-- Main Content Grid -->
        <div class="content-grid">
          <!-- Business Information -->
          <div class="info-card">
            <h2>Business Information</h2>
            <div class="info-grid">
              <div class="info-item">
                <label>Registration Number</label>
                <p>{{ profile?.registrationNumber }}</p>
              </div>
              <div class="info-item">
                <label>Business Type</label>
                <p>{{ profile?.lineOfBusiness }}</p>
              </div>
              <div class="info-item">
                <label>Email</label>
                <p>{{ profile?.email }}</p>
              </div>
              <div class="info-item">
                <label>Phone</label>
                <p>{{ profile?.phone }}</p>
              </div>
              <div class="info-item full-width">
                <label>Address</label>
                <p>{{ profile?.address }}</p>
              </div>
              <div class="info-item">
                <label>Location</label>
                <p>{{ profile?.location }}</p>
              </div>
            </div>
          </div>

          <!-- Contact Person -->
          <div class="info-card">
            <h2>Contact Person</h2>
            <div class="info-grid">
              <div class="info-item">
                <label>Name</label>
                <p>{{ profile?.contact_person }}</p>
              </div>
              <div class="info-item">
                <label>Designation</label>
                <p>{{ profile?.contactPersonDesignation }}</p>
              </div>
              <div class="info-item">
                <label>Email</label>
                <p>{{ profile?.contactPersonEmail }}</p>
              </div>
              <div class="info-item">
                <label>Phone</label>
                <p>{{ profile?.contactPersonPhone }}</p>
              </div>
            </div>
          </div>

          <!-- Operations & Settings -->
          <div class="info-card">
            <h2>Operations & Settings</h2>
            <div class="info-grid">
              <div class="info-item">
                <label>Account Type</label>
                <p>{{ profile?.accountType }}</p>
              </div>
              <div class="info-item">
                <label>Charge Type</label>
                <p>{{ profile?.chargeType }}</p>
              </div>
              <div class="info-item">
                <label>Debit Operator</label>
                <p>{{ profile?.debitOperator }}</p>
              </div>
              <div class="info-item">
                <label>Credit Operator</label>
                <p>{{ profile?.creditOperator }}</p>
              </div>
              <div class="info-item">
                <label>Card Operator</label>
                <p>{{ profile?.debitCardOperator }}</p>
              </div>
              <div class="info-item">
                <label>Auto Settle</label>
                <p>{{ profile?.autosettle ? 'Yes' : 'No' }}</p>
              </div>
            </div>
            <div class="operations">
              <label>Permitted Operations</label>
              <div class="operation-tags">
                <span
                  class="operation-tag"
                  *ngFor="let op of profile?.operations"
                >
                  {{ op }}
                </span>
              </div>
            </div>
          </div>

          <!-- Charges -->
          <div class="info-card">
            <h2>Transaction Charges</h2>
            <div class="charges-grid">
              <div class="charge-section">
                <h3>Standard Charges</h3>
                <div class="charge-item">
                  <label>Card Transaction</label>
                  <p>{{ profile?.card_charge }}%</p>
                </div>
                <div class="charge-item">
                  <label>Mobile Money</label>
                  <p>{{ profile?.momo_charge }}%</p>
                </div>
                <div class="charge-item">
                  <label>Bitcoin</label>
                  <p>{{ profile?.btc_charge }}%</p>
                </div>
              </div>
              <div class="charge-section">
                <h3>Disbursement Charges</h3>
                <div class="charge-item">
                  <label>GIP</label>
                  <p>{{ profile?.disburse_gip_charge }}%</p>
                </div>
                <div class="charge-item">
                  <label>Mobile Money</label>
                  <p>{{ profile?.disburse_momo_charge }}%</p>
                </div>
                <div class="charge-item">
                  <label>NRT</label>
                  <p>{{ profile?.disburse_nrt_charge }}%</p>
                </div>
              </div>
            </div>
          </div>

          <div class="info-card" *ngIf="documents.length > 0">
            <h2>Documents</h2>
            <div class="documents-grid">
              <div class="document-item" *ngFor="let doc of documents">
                <button class="doc-preview-btn" (click)="openImageModal(doc)">
                  <div class="doc-icon">
                    <i class="material-icons">image</i>
                    <span>View Document</span>
                  </div>
                  <div class="doc-info">
                    <p class="doc-name">{{ doc.name }}</p>
                    <p class="doc-date">
                      Uploaded: {{ formatDate(doc.createdAt) }}
                    </p>
                  </div>
                </button>
              </div>
            </div>
          </div>

          <!-- Image Modal -->
          <div
            class="image-modal"
            *ngIf="showImageModal"
            (click)="closeImageModal()"
          >
            <div class="modal-content" (click)="$event.stopPropagation()">
              <button class="close-btn" (click)="closeImageModal()">
                <i class="material-icons">close</i>
              </button>
              <div class="image-container">
                <img
                  [src]="selectedDocument?.data"
                  [alt]="selectedDocument?.name"
                />
              </div>
              <div class="image-info">
                <h3>{{ selectedDocument?.name }}</h3>
                <p>Uploaded: {{ formatDate(selectedDocument?.createdAt) }}</p>
              </div>
            </div>
          </div>
        </div>
      </ng-container>
    </div>
  `,
  styleUrls: ['./merchant-profile.component.scss'],
})
export class MerchantProfileComponent implements OnInit {
  profile: MerchantProfile | null = null;
  documents: Document[] = [];
  loading = false;
  error = '';
  showImageModal = false;
  selectedDocument: Document | null = null;

  constructor(private http: HttpClient, private store: Store) {}

  ngOnInit() {
    this.fetchProfile();
    this.fetchDocuments();
  }

  private getHeaders(): HttpHeaders {
    const token = this.store.selectSnapshot(AuthState.token);
    return new HttpHeaders().set('Authorization', `Bearer ${token}`);
  }

  fetchProfile() {
    const merchantId = this.store.selectSnapshot(
      (state) => state.auth.user?.merchantId?._id
    );
    if (!merchantId) {
      this.error = 'Merchant ID not found';
      return;
    }

    this.loading = true;
    this.http
      .get<any>(`https://lazypaygh.com/api/merchants/get/${merchantId}`, {
        headers: this.getHeaders(),
      })
      .subscribe({
        next: (response) => {
          if (response.success) {
            this.profile = response.data;
          } else {
            this.error = 'Failed to load profile';
          }
          this.loading = false;
        },
        error: (err) => {
          this.error = 'Failed to load profile';
          this.loading = false;
        },
      });
  }

  openImageModal(doc: Document) {
    this.selectedDocument = doc;
    this.showImageModal = true;
    // Prevent body scrolling when modal is open
    document.body.style.overflow = 'hidden';
  }

  closeImageModal() {
    this.showImageModal = false;
    this.selectedDocument = null;
    // Restore body scrolling
    document.body.style.overflow = 'auto';
  }

  fetchDocuments() {
    const merchantId = this.store.selectSnapshot(
      (state) => state.auth.user?.merchantId?._id
    );
    if (!merchantId) return;

    this.http
      .get<any>(`https://lazypaygh.com/api/documents/get/${merchantId}`, {
        headers: this.getHeaders(),
      })
      .subscribe({
        next: (response) => {
          if (response.success) {
            this.documents = response.data;
          }
        },
        error: (err) => {
          console.error('Failed to load documents:', err);
        },
      });
  }

  formatDate(date: string | undefined): string {
    if (!date) return '';
    return new Date(date).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  }
}
