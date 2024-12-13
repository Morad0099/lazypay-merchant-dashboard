import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Store } from '@ngxs/store';
import { AuthState } from '../../state/apps/app.states';

interface Merchant {
  _id: string;
  merchant_tradeName: string;
  email: string;
  phone: string;
  location: string;
  registrationNumber: string;
  lineOfBusiness: string;
  contact_person: string;
  contactPersonEmail: string;
  contactPersonPhone: string;
  contactPersonDesignation: string;
  active: boolean;
  type: string;
  accountType: string;
  createdAt: string;
  approvedDate?: string;
  can_onboard_merchants: boolean;
}

interface DocumentUpload {
  name: 'Business registration document' | 'Government ID';
  data: string;
}

interface MerchantForm {
  merchant_tradeName: string;
  email: string;
  phone: string;
  location: string;
  registrationNumber: string;
  lineOfBusiness: string;
  contact_person: string;
  contactPersonEmail: string;
  contactPersonPhone: string;
  contactPersonDesignation: string;
  documents: DocumentUpload[];
  onboardedBy: string;
}
interface MerchantDocument {
  _id: string;
  id: string;
  path: string;
  name: string;
  data: string;
  createdAt: string;
  updatedAt: string;
}
@Component({
  selector: 'app-merchants',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="merchants-container">
      <!-- Header Section -->
      <div class="header">
        <div class="title-section">
          <h1>Merchants</h1>
          <p>Manage your onboarded merchants</p>
        </div>
        <button class="add-btn" (click)="showAddModal = true">
          Add New Merchant
        </button>
      </div>

      <!-- Stats Section -->
      <div class="stats-section">
        <div class="stat-card">
          <span class="label">Total Merchants</span>
          <span class="value">{{ merchants.length }}</span>
        </div>
        <div class="stat-card">
          <span class="label">Active Merchants</span>
          <span class="value">{{ getActiveMerchants() }}</span>
        </div>
        <div class="stat-card">
          <span class="label">Pending Approval</span>
          <span class="value">{{ getPendingMerchants() }}</span>
        </div>
      </div>

      <!-- Loading State -->
      <div class="loading-spinner" *ngIf="loading">
        <div class="spinner"></div>
      </div>

      <!-- Error Message -->
      <div class="error-message" *ngIf="error">{{ error }}</div>

      <!-- Merchants Table -->
      <div class="table-container" *ngIf="!loading && merchants.length > 0">
        <table class="merchants-table">
          <thead>
            <tr>
              <th>Business Name</th>
              <th>Contact Person</th>
              <th>Contact</th>
              <th>Business Type</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let merchant of merchants">
              <td>
                <div class="merchant-name">
                  {{ merchant.merchant_tradeName || 'N/A' }}
                  <span class="reg-number">{{
                    merchant.registrationNumber || 'N/A'
                  }}</span>
                </div>
              </td>
              <td>
                <div class="contact-person">
                  {{ merchant.contact_person || 'N/A' }}
                  <span class="designation">{{
                    merchant.contactPersonDesignation
                  }}</span>
                </div>
              </td>
              <td>
                <div class="contact-info">
                  {{ merchant.phone }}
                  <span class="email">{{ merchant.email }}</span>
                </div>
              </td>
              <td>{{ merchant.lineOfBusiness }}</td>
              <td>
                <span class="status-badge" [class.active]="merchant.active">
                  {{ merchant.active ? 'Active' : 'Inactive' }}
                </span>
              </td>
              <div class="action-buttons">
                <button
                  class="icon-btn view-btn"
                  (click)="viewMerchantDetails(merchant)"
                  title="View Details"
                >
                  <i class="material-icons">visibility</i>
                </button>

                <button
                  class="icon-btn document-btn"
                  (click)="viewDocuments(merchant)"
                  title="View Documents"
                >
                  <i class="material-icons">description</i>
                </button>

                <button
                  class="icon-btn settings-btn"
                  (click)="toggleOnboarding(merchant)"
                  title="Settings"
                >
                  <i class="material-icons">settings</i>
                </button>

                <button
                  class="icon-btn"
                  [class.approve-btn]="!merchant.approvedDate"
                  [class.deactivate-btn]="merchant.active"
                  (click)="handleStatusAction(merchant)"
                  [title]="getActionButtonText(merchant)"
                >
                  <i class="material-icons">
                    {{
                      merchant.active ? 'power_settings_new' : 'check_circle'
                    }}
                  </i>
                </button>
              </div>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="modal" *ngIf="showViewModal" (click)="closeModals($event)">
  <div class="modal-content">
    <div class="modal-header">
      <h2>Merchant Details</h2>
      <button class="close-btn" (click)="showViewModal = false">×</button>
    </div>
    <div class="merchant-details" *ngIf="selectedMerchant">
      <div class="detail-section">
        <h3>Business Information</h3>
        <div class="detail-grid">
          <div class="detail-item">
            <label>Business Name</label>
            <p>{{selectedMerchant.merchant_tradeName}}</p>
          </div>
          <div class="detail-item">
            <label>Registration Number</label>
            <p>{{selectedMerchant.registrationNumber}}</p>
          </div>
          <div class="detail-item">
            <label>Business Type</label>
            <p>{{selectedMerchant.lineOfBusiness}}</p>
          </div>
          <div class="detail-item">
            <label>Email</label>
            <p>{{selectedMerchant.email}}</p>
          </div>
          <div class="detail-item">
            <label>Phone</label>
            <p>{{selectedMerchant.phone}}</p>
          </div>
          <div class="detail-item">
            <label>Location</label>
            <p>{{selectedMerchant.location}}</p>
          </div>
        </div>
      </div>

      <div class="detail-section">
        <h3>Contact Person</h3>
        <div class="detail-grid">
          <div class="detail-item">
            <label>Name</label>
            <p>{{selectedMerchant.contact_person}}</p>
          </div>
          <div class="detail-item">
            <label>Designation</label>
            <p>{{selectedMerchant.contactPersonDesignation}}</p>
          </div>
          <div class="detail-item">
            <label>Email</label>
            <p>{{selectedMerchant.contactPersonEmail}}</p>
          </div>
          <div class="detail-item">
            <label>Phone</label>
            <p>{{selectedMerchant.contactPersonPhone}}</p>
          </div>
        </div>
      </div>

      <div class="detail-section">
        <h3>Additional Information</h3>
        <div class="detail-grid">
          <div class="detail-item">
            <label>Status</label>
            <p class="status-badge" [class.active]="selectedMerchant.active">
              {{selectedMerchant.active ? 'Active' : 'Inactive'}}
            </p>
          </div>
          <div class="detail-item">
            <label>Can Onboard Merchants</label>
            <p>{{selectedMerchant.can_onboard_merchants ? 'Yes' : 'No'}}</p>
          </div>
          <div class="detail-item">
            <label>Created Date</label>
            <p>{{formatDate(selectedMerchant.createdAt)}}</p>
          </div>
          <div class="detail-item">
            <label>Approval Date</label>
            <p>{{selectedMerchant.approvedDate ? formatDate(selectedMerchant.approvedDate) : 'Pending'}}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>

<!-- Documents Modal -->
<div class="modal" *ngIf="showDocumentsModal" (click)="closeModals($event)">
  <div class="modal-content">
    <div class="modal-header">
      <h2>Merchant Documents</h2>
      <button class="close-btn" (click)="showDocumentsModal = false">×</button>
    </div>
    
    <div class="documents-container">
      <div class="no-documents" *ngIf="!merchantDocuments?.length">
        <i class="material-icons">description_off</i>
        <p>No documents available</p>
      </div>

      <div class="documents-grid" *ngIf="merchantDocuments?.length">
        <div class="document-card" *ngFor="let doc of merchantDocuments">
          <div class="document-preview">
            <img [src]="doc.data" [alt]="doc.name">
          </div>
          <div class="document-info">
            <p class="doc-name">{{doc.name}}</p>
            <p class="doc-date">Uploaded: {{formatDate(doc.createdAt)}}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>

      <!-- Add Merchant Modal -->
      <div class="modal" *ngIf="showAddModal" (click)="closeModals($event)">
        <div class="modal-content">
          <h2>Add New Merchant</h2>
          <form (submit)="addMerchant($event)">
            <!-- Business Information -->
            <div class="form-section">
              <h3>Business Information</h3>
              <div class="form-grid">
                <div class="form-group">
                  <label>Business Name</label>
                  <input
                    type="text"
                    [(ngModel)]="newMerchant.merchant_tradeName"
                    name="merchant_tradeName"
                    required
                  />
                </div>
                <div class="form-group">
                  <label>Registration Number</label>
                  <input
                    type="text"
                    [(ngModel)]="newMerchant.registrationNumber"
                    name="registrationNumber"
                    required
                  />
                </div>
                <div class="form-group">
                  <label>Business Type</label>
                  <input
                    type="text"
                    [(ngModel)]="newMerchant.lineOfBusiness"
                    name="lineOfBusiness"
                    required
                  />
                </div>
                <div class="form-group">
                  <label>Business Email</label>
                  <input
                    type="email"
                    [(ngModel)]="newMerchant.email"
                    name="email"
                    required
                  />
                </div>
                <div class="form-group">
                  <label>Business Phone</label>
                  <input
                    type="tel"
                    [(ngModel)]="newMerchant.phone"
                    name="phone"
                    required
                  />
                </div>
                <div class="form-group">
                  <label>Location</label>
                  <input
                    type="text"
                    [(ngModel)]="newMerchant.location"
                    name="location"
                    required
                  />
                </div>
              </div>
            </div>

            <!-- Contact Person Information -->
            <div class="form-section">
              <h3>Contact Person</h3>
              <div class="form-grid">
                <div class="form-group">
                  <label>Name</label>
                  <input
                    type="text"
                    [(ngModel)]="newMerchant.contact_person"
                    name="contact_person"
                    required
                  />
                </div>
                <div class="form-group">
                  <label>Designation</label>
                  <input
                    type="text"
                    [(ngModel)]="newMerchant.contactPersonDesignation"
                    name="contactPersonDesignation"
                    required
                  />
                </div>
                <div class="form-group">
                  <label>Email</label>
                  <input
                    type="email"
                    [(ngModel)]="newMerchant.contactPersonEmail"
                    name="contactPersonEmail"
                    required
                  />
                </div>
                <div class="form-group">
                  <label>Phone</label>
                  <input
                    type="tel"
                    [(ngModel)]="newMerchant.contactPersonPhone"
                    name="contactPersonPhone"
                    required
                  />
                </div>
              </div>
            </div>

            <!-- Document Upload -->
            <div class="form-section">
              <h3>Document Upload</h3>
              <div class="document-type-selector">
                <label class="radio-label">
                  <input
                    type="radio"
                    name="documentType"
                    value="business"
                    [(ngModel)]="selectedDocumentType"
                  />
                  Business Registration
                </label>
                <label class="radio-label">
                  <input
                    type="radio"
                    name="documentType"
                    value="government"
                    [(ngModel)]="selectedDocumentType"
                  />
                  Government ID
                </label>
              </div>

              <div class="file-upload" *ngIf="selectedDocumentType">
                <input
                  type="file"
                  accept="image/*"
                  (change)="handleFileSelect($event)"
                  #fileInput
                />
                <button
                  type="button"
                  class="upload-btn"
                  (click)="fileInput.click()"
                >
                  Select Document
                </button>
                <span class="file-name" *ngIf="selectedFile">
                  {{ selectedFile.name }}
                </span>
              </div>
            </div>

            <div class="modal-actions">
              <button
                type="button"
                class="cancel-btn"
                (click)="showAddModal = false"
              >
                Cancel
              </button>
              <button
                type="submit"
                class="submit-btn"
                [disabled]="isSubmitting"
              >
                <span class="spinner" *ngIf="isSubmitting"></span>
                Add Merchant
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['./user-merchants.component.scss'],
})
export class UserMerchantsComponent implements OnInit {
  merchants: Merchant[] = [];
  loading = false;
  error = '';
  showAddModal = false;
  isSubmitting = false;
  selectedDocumentType: 'business' | 'government' | null = null;
  selectedFile: File | null = null;

  showViewModal = false;
  showDocumentsModal = false;
  selectedMerchant: Merchant | null = null;
  merchantDocuments: MerchantDocument[] = [];

  newMerchant: MerchantForm = {
    merchant_tradeName: '',
    email: '',
    phone: '',
    location: '',
    registrationNumber: '',
    lineOfBusiness: '',
    contact_person: '',
    contactPersonEmail: '',
    contactPersonPhone: '',
    contactPersonDesignation: '',
    documents: [],
    onboardedBy: '',
  };

  constructor(private http: HttpClient, private store: Store) {}

  ngOnInit() {
    this.fetchMerchants();
    this.newMerchant.onboardedBy = this.store.selectSnapshot(
      (state) => state.auth.user?.merchantId?._id
    );
  }

  private getHeaders(): HttpHeaders {
    const token = this.store.selectSnapshot(AuthState.token);
    return new HttpHeaders().set('Authorization', `Bearer ${token}`);
  }

  viewMerchantDetails(merchant: Merchant) {
    this.selectedMerchant = merchant;
    this.showViewModal = true;
  }

  async viewDocuments(merchant: Merchant) {
    try {
      const response = await this.http
        .get<any>(`https://lazypaygh.com/api/documents/get/${merchant._id}`, {
          headers: this.getHeaders(),
        })
        .toPromise();

      if (response.success) {
        this.merchantDocuments = response.data;
        this.showDocumentsModal = true;
      } else {
        alert('Failed to fetch documents');
      }
    } catch (err) {
      alert('Failed to fetch documents');
    }
  }

  async toggleOnboarding(merchant: Merchant) {
    if (!confirm('Are you sure you want to update merchant settings?')) return;

    try {
      const response = await this.http
        .put<any>(
          'https://lazypaygh.com/api/merchants/update',
          {
            id: merchant._id,
            data: {
              can_onboard_merchants: !merchant.can_onboard_merchants,
            },
          },
          { headers: this.getHeaders() }
        )
        .toPromise();

      if (response.success) {
        alert('Merchant settings updated successfully');
        this.fetchMerchants();
      } else {
        alert(response.message || 'Failed to update merchant settings');
      }
    } catch (err) {
      alert('Failed to update merchant settings');
    }
  }

  async handleStatusAction(merchant: Merchant) {
    const action = this.getActionType(merchant);
    if (!confirm(`Are you sure you want to ${action} this merchant?`)) return;

    const endpoint =
      action === 'approve'
        ? 'https://lazypaygh.com/api/merchants/approve'
        : 'https://lazypaygh.com/api/merchants/deactivate';

    try {
      const response = await this.http
        .put<any>(
          endpoint,
          { id: merchant._id },
          { headers: this.getHeaders() }
        )
        .toPromise();

      if (response.success) {
        alert(`Merchant ${action}d successfully`);
        this.fetchMerchants();
      } else {
        alert(response.message || `Failed to ${action} merchant`);
      }
    } catch (err) {
      alert(`Failed to ${action} merchant`);
    }
  }

  getActionButtonText(merchant: Merchant): string {
    if (!merchant.approvedDate) return 'Approve';
    return merchant.active ? 'Deactivate' : 'Activate';
  }

  getActionType(merchant: Merchant): string {
    if (!merchant.approvedDate) return 'approve';
    return merchant.active ? 'deactivate' : 'activate';
  }

  fetchMerchants() {
    const merchantId = this.store.selectSnapshot(
      (state) => state.auth.user?.merchantId?._id
    );
    if (!merchantId) return;

    this.loading = true;
    this.http
      .get<any>(
        `https://lazypaygh.com/api/merchants/onboardedby/${merchantId}`,
        {
          headers: this.getHeaders(),
        }
      )
      .subscribe({
        next: (response) => {
          if (response.success) {
            this.merchants = response.data;
          } else {
            this.error = 'Failed to load merchants';
          }
          this.loading = false;
        },
        error: (err) => {
          this.error = 'Failed to load merchants';
          this.loading = false;
        },
      });
  }

  handleFileSelect(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      this.selectedFile = input.files[0];
      this.convertFileToBase64(input.files[0]);
    }
  }

  convertFileToBase64(file: File) {
    const reader = new FileReader();
    reader.onload = () => {
      const base64String = reader.result as string;
      const documentName =
        this.selectedDocumentType === 'business'
          ? 'Business registration document'
          : 'Government ID';

      this.newMerchant.documents = [
        {
          name: documentName,
          data: base64String,
        },
      ];
    };
    reader.readAsDataURL(file);
  }

  async addMerchant(event: Event) {
    event.preventDefault();
    if (!this.validateForm()) return;

    this.isSubmitting = true;
    try {
      const response = await this.http
        .post<any>(
          'https://lazypaygh.com/api/merchants/onboard',
          this.newMerchant,
          { headers: this.getHeaders() }
        )
        .toPromise();

      if (response.success) {
        alert('Merchant added successfully');
        this.showAddModal = false;
        this.resetForm();
        this.fetchMerchants();
      } else {
        alert(response.message || 'Failed to add merchant');
      }
    } catch (err) {
      alert('Failed to add merchant');
    } finally {
      this.isSubmitting = false;
    }
  }

  validateForm(): boolean {
    if (!this.newMerchant.documents.length) {
      alert('Please upload required documents');
      return false;
    }

    // Check all required fields
    const requiredFields = [
      'merchant_tradeName',
      'email',
      'phone',
      'location',
      'registrationNumber',
      'lineOfBusiness',
      'contact_person',
      'contactPersonEmail',
      'contactPersonPhone',
      'contactPersonDesignation',
    ];

    for (const field of requiredFields) {
      if (!this.newMerchant[field as keyof MerchantForm]) {
        alert(
          `Please fill in ${field.replace(/([A-Z])/g, ' $1').toLowerCase()}`
        );
        return false;
      }
    }

    return true;
  }

  resetForm() {
    this.newMerchant = {
      merchant_tradeName: '',
      email: '',
      phone: '',
      location: '',
      registrationNumber: '',
      lineOfBusiness: '',
      contact_person: '',
      contactPersonEmail: '',
      contactPersonPhone: '',
      contactPersonDesignation: '',
      documents: [],
      onboardedBy: this.newMerchant.onboardedBy,
    };
    this.selectedDocumentType = null;
    this.selectedFile = null;
  }

  getActiveMerchants(): number {
    return this.merchants.filter((m) => m.active).length;
  }

  getPendingMerchants(): number {
    return this.merchants.filter((m) => !m.approvedDate).length;
  }

  viewMerchant(merchant: Merchant) {
    // TODO: Implement view functionality
    console.log('View merchant:', merchant);
  }

  editMerchant(merchant: Merchant) {
    // TODO: Implement edit functionality
    console.log('Edit merchant:', merchant);
  }

  toggleMerchantStatus(merchant: Merchant) {
    // TODO: Implement status toggle functionality
    console.log('Toggle merchant status:', merchant);
  }

  closeModals(event: MouseEvent) {
    if ((event.target as HTMLElement).classList.contains('modal')) {
      this.showAddModal = false;
      this.showViewModal = false;
      this.showDocumentsModal = false;
    }
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  }
}
