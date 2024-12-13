import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Store } from '@ngxs/store';
import { AuthState } from '../../state/apps/app.states';

interface User {
  _id: string;
  name: string;
  email: string;
  phone: string;
  permissions: string[];
  accountType?: string;
  lastSeen?: string;
  createdAt: string;
}

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="users-container">
      <!-- Header Section -->
      <div class="header">
        <div class="title-section">
          <h1>User Management</h1>
          <p>Manage user access and permissions</p>
        </div>
        <button class="add-btn" (click)="showAddUserModal = true">
          Add New User
        </button>
      </div>

      <!-- Loading State -->
      <div class="loading-spinner" *ngIf="loading">
        <div class="spinner"></div>
      </div>

      <!-- Error Message -->
      <div class="error-message" *ngIf="error">
        {{error}}
      </div>

      <!-- Users Grid -->
      <div class="users-grid" *ngIf="!loading && users.length > 0">
        <div class="user-card" *ngFor="let user of users">
          <div class="user-header">
            <div class="user-avatar">
              {{ user.name.charAt(0).toUpperCase() }}
            </div>
            <div class="user-info">
              <h3>{{user.name}}</h3>
              <p class="email">{{user.email}}</p>
            </div>
            <div class="actions">
              <button class="edit-btn" (click)="editUser(user)">Edit</button>
            </div>
          </div>

          <div class="user-details">
            <div class="detail-item">
              <span class="label">Phone:</span>
              <span class="value">{{user.phone}}</span>
            </div>
            <div class="detail-item">
              <span class="label">Account Type:</span>
              <span class="value">{{user.accountType || 'Standard'}}</span>
            </div>
            <div class="detail-item">
              <span class="label">Last Active:</span>
              <span class="value">{{formatDate(user.lastSeen || user.createdAt)}}</span>
            </div>
          </div>

          <div class="permissions">
            <span class="permission-tag" *ngFor="let perm of user.permissions">
              {{perm}}
            </span>
          </div>
        </div>
      </div>

      <!-- Add User Modal -->
      <div class="modal" *ngIf="showAddUserModal" (click)="closeModals($event)">
        <div class="modal-content">
          <h2>Add New User</h2>
          <form (submit)="addUser($event)">
            <div class="form-group">
              <label>Name</label>
              <input type="text" [(ngModel)]="newUser.name" name="name" required>
            </div>
            <div class="form-group">
              <label>Email</label>
              <input type="email" [(ngModel)]="newUser.email" name="email" required>
            </div>
            <div class="form-group">
              <label>Phone</label>
              <input type="tel" [(ngModel)]="newUser.phone" name="phone" required>
            </div>
            <div class="form-group">
              <label>Password</label>
              <input type="password" [(ngModel)]="newUser.password" name="password" required>
            </div>
            <div class="form-group">
              <label>Permissions</label>
              <div class="permissions-select">
                <label class="checkbox-label">
                  <input type="checkbox" 
                         [checked]="newUser.permissions.includes('Admin')"
                         (change)="togglePermission('Admin', newUser.permissions)">
                  Admin
                </label>
                <label class="checkbox-label">
                  <input type="checkbox" 
                         [checked]="newUser.permissions.includes('Initiator')"
                         (change)="togglePermission('Initiator', newUser.permissions)">
                  Initiator
                </label>
                <label class="checkbox-label">
                  <input type="checkbox" 
                         [checked]="newUser.permissions.includes('Approver')"
                         (change)="togglePermission('Approver', newUser.permissions)">
                  Approver
                </label>
              </div>
            </div>
            <div class="modal-actions">
              <button type="button" class="cancel-btn" (click)="showAddUserModal = false">Cancel</button>
              <button type="submit" class="submit-btn" [disabled]="isSubmitting">
                <span class="spinner" *ngIf="isSubmitting"></span>
                Add User
              </button>
            </div>
          </form>
        </div>
      </div>

      <!-- Edit User Modal -->
      <div class="modal" *ngIf="showEditModal" (click)="closeModals($event)">
        <div class="modal-content">
          <h2>Edit User</h2>
          <form (submit)="updateUser($event)">
            <div class="form-group">
              <label>Name</label>
              <input type="text" [(ngModel)]="editingUser.name" name="name" required>
            </div>
            <div class="form-group">
              <label>Email</label>
              <input type="email" [(ngModel)]="editingUser.email" name="email" required>
            </div>
            <div class="form-group">
              <label>Phone</label>
              <input type="tel" [(ngModel)]="editingUser.phone" name="phone" required>
            </div>
            <div class="form-group">
              <label>Permissions</label>
              <div class="permissions-select">
                <label class="checkbox-label">
                  <input type="checkbox" 
                         [checked]="editingUser.permissions.includes('Admin')"
                         (change)="togglePermission('Admin', editingUser.permissions)">
                  Admin
                </label>
                <label class="checkbox-label">
                  <input type="checkbox" 
                         [checked]="editingUser.permissions.includes('Initiator')"
                         (change)="togglePermission('Initiator', editingUser.permissions)">
                  Initiator
                </label>
                <label class="checkbox-label">
                  <input type="checkbox" 
                         [checked]="editingUser.permissions.includes('Approver')"
                         (change)="togglePermission('Approver', editingUser.permissions)">
                  Approver
                </label>
              </div>
            </div>
            <div class="modal-actions">
              <button type="button" class="cancel-btn" (click)="showEditModal = false">Cancel</button>
              <button type="submit" class="submit-btn" [disabled]="isSubmitting">
                <span class="spinner" *ngIf="isSubmitting"></span>
                Update User
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['./users.component.scss']
})
export class UsersComponent implements OnInit {
  users: User[] = [];
  loading = false;
  error = '';
  showAddUserModal = false;
  showEditModal = false;
  isSubmitting = false;

  newUser = {
    name: '',
    email: '',
    phone: '',
    password: '',
    permissions: [] as string[],
    merchantId: ''
  };

  editingUser = {
    _id: '',
    name: '',
    email: '',
    phone: '',
    permissions: [] as string[]
  };

  constructor(
    private http: HttpClient,
    private store: Store
  ) {}

  ngOnInit() {
    this.fetchUsers();
    this.newUser.merchantId = this.store.selectSnapshot(state => state.auth.user?.merchantId?._id);
  }

  private getHeaders(): HttpHeaders {
    const token = this.store.selectSnapshot(AuthState.token);
    return new HttpHeaders().set('Authorization', `Bearer ${token}`);
  }

  fetchUsers() {
    const merchantId = this.store.selectSnapshot(state => state.auth.user?.merchantId?._id);
    if (!merchantId) return;

    this.loading = true;
    this.http.get<any>(`https://lazypaygh.com/api/merchants/roles/get/${merchantId}`, {
      headers: this.getHeaders()
    }).subscribe({
      next: (response) => {
        if (response.success) {
          this.users = response.data;
        } else {
          this.error = 'Failed to load users';
        }
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load users';
        this.loading = false;
      }
    });
  }

  addUser(event: Event) {
    event.preventDefault();
    this.isSubmitting = true;

    this.http.post<any>('https://lazypaygh.com/api/merchants/roles/add', this.newUser, {
      headers: this.getHeaders()
    }).subscribe({
      next: (response) => {
        if (response.success) {
          this.showAddUserModal = false;
          this.fetchUsers();
          this.resetNewUser();
        } else {
          alert(response.message || 'Failed to add user');
        }
        this.isSubmitting = false;
      },
      error: (err) => {
        alert('Failed to add user');
        this.isSubmitting = false;
      }
    });
  }

  editUser(user: User) {
    this.editingUser = {
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      permissions: [...user.permissions]
    };
    this.showEditModal = true;
  }

  updateUser(event: Event) {
    event.preventDefault();
    this.isSubmitting = true;

    const payload = {
      id: this.editingUser._id,
      data: {
        name: this.editingUser.name,
        email: this.editingUser.email,
        phone: this.editingUser.phone,
        permissions: this.editingUser.permissions
      }
    };

    this.http.put<any>('https://lazypaygh.com/api/merchants/roles/update', payload, {
      headers: this.getHeaders()
    }).subscribe({
      next: (response) => {
        if (response.success) {
          this.showEditModal = false;
          this.fetchUsers();
        } else {
          alert(response.message || 'Failed to update user');
        }
        this.isSubmitting = false;
      },
      error: (err) => {
        alert('Failed to update user');
        this.isSubmitting = false;
      }
    });
  }

  togglePermission(permission: string, permissions: string[]) {
    const index = permissions.indexOf(permission);
    if (index === -1) {
      permissions.push(permission);
    } else {
      permissions.splice(index, 1);
    }
  }

  resetNewUser() {
    this.newUser = {
      name: '',
      email: '',
      phone: '',
      password: '',
      permissions: [],
      merchantId: this.newUser.merchantId
    };
  }

  closeModals(event: MouseEvent) {
    if ((event.target as HTMLElement).classList.contains('modal')) {
      this.showAddUserModal = false;
      this.showEditModal = false;
    }
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  }}