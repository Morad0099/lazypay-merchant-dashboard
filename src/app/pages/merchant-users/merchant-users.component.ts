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
    <div class="max-w-7xl mx-auto p-4">
      <!-- Header -->
      <header class="flex justify-between items-center mb-4">
        <div>
          <h1 class="text-xl font-semibold">User Management</h1>
          <p class="text-sm text-gray-600">
            Manage user access and permissions
          </p>
        </div>
        <button
          class="bg-blue-600 text-white px-3 py-1.5 rounded"
          (click)="showAddUserModal = true"
        >
          Add New User
        </button>
      </header>

      <!-- States -->
      <div *ngIf="loading" class="flex justify-center p-4">
        <div
          class="spinner animate-spin h-6 w-6 border-b-2 border-blue-600 rounded-full"
        ></div>
      </div>
      <div *ngIf="error" class="text-red-600 bg-red-50 p-3 rounded mb-4">
        {{ error }}
      </div>

      <!-- Users -->
      <div
        *ngIf="!loading && users.length > 0"
        class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3"
      >
        <div
          *ngFor="let user of users"
          class="bg-white p-3 rounded shadow-sm border"
        >
          <!-- User Header -->
          <div class="flex gap-2 mb-2">
            <span
              class="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center text-sm font-medium"
            >
              {{ user.name[0] }}
            </span>
            <div class="flex-1 min-w-0">
              <h3 class="font-medium truncate text-sm">{{ user.name }}</h3>
              <p class="text-xs text-gray-500 truncate">{{ user.email }}</p>
            </div>
            <button
              (click)="editUser(user)"
              class="text-gray-400 hover:text-blue-600"
            >
              Edit
            </button>
          </div>

          <!-- User Info -->
          <div class="text-xs space-y-1 mb-2">
            <div class="flex justify-between">
              <span class="text-gray-500">Phone:</span>{{ user.phone }}
            </div>
            <div class="flex justify-between">
              <span class="text-gray-500">Type:</span
              >{{ user.accountType || 'Standard' }}
            </div>
            <div class="flex justify-between">
              <span class="text-gray-500">Active:</span
              >{{ formatDate(user.lastSeen || user.createdAt) }}
            </div>
          </div>

          <!-- Permissions -->
          <div class="flex flex-wrap gap-1">
            <span
              *ngFor="let perm of user.permissions"
              class="px-2 py-0.5 bg-blue-50 text-blue-600 text-xs rounded"
              >{{ perm }}</span
            >
          </div>
        </div>
      </div>

      <!-- Add Modal -->
      <div
        *ngIf="showAddUserModal"
        class="fixed inset-0 bg-black/50 flex items-center justify-center p-4"
        (click)="closeModals($event)"
      >
        <div class="bg-white rounded w-full max-w-md p-4">
          <h2 class="text-lg font-medium mb-3">Add New User</h2>
          <form (submit)="addUser($event)" class="space-y-3">
            <!-- Form Fields -->
            <div *ngFor="let field of ['name', 'email', 'phone', 'password']">
              <label class="block text-sm mb-1">{{ field }}</label>
              <input
                [type]="
                  field === 'password'
                    ? 'password'
                    : field === 'email'
                    ? 'email'
                    : 'text'
                "
                [(ngModel)]="newUser[field]"
                [name]="field"
                required
                class="w-full px-3 py-1.5 border rounded text-sm"
              />
            </div>

            <!-- Permissions -->
            <div>
              <label class="block text-sm mb-1">Permissions</label>
              <div class="space-y-1">
                <label
                  *ngFor="let perm of ['Admin', 'Initiator', 'Approver']"
                  class="flex items-center text-sm"
                >
                  <input
                    type="checkbox"
                    [checked]="newUser.permissions.includes(perm)"
                    (change)="togglePermission(perm, newUser.permissions)"
                    class="mr-2"
                  />
                  {{ perm }}
                </label>
              </div>
            </div>

            <!-- Actions -->
            <div class="flex justify-end gap-2 mt-4">
              <button
                type="button"
                (click)="showAddUserModal = false"
                class="px-3 py-1.5 text-sm"
              >
                Cancel
              </button>
              <button
                type="submit"
                [disabled]="isSubmitting"
                class="bg-blue-600 text-white px-3 py-1.5 rounded text-sm"
              >
                <span
                  *ngIf="isSubmitting"
                  class="inline-block animate-spin mr-1"
                  >⌛</span
                >Add
              </button>
            </div>
          </form>
        </div>
      </div>

      <!-- Edit Modal -->
      <div
        *ngIf="showEditModal"
        class="fixed inset-0 bg-black/50 flex items-center justify-center p-4"
        (click)="closeModals($event)"
      >
        <div class="bg-white rounded w-full max-w-md p-4">
          <h2 class="text-lg font-medium mb-3">Edit User</h2>
          <form (submit)="updateUser($event)" class="space-y-3">
            <div *ngFor="let field of ['name', 'email', 'phone']">
              <label class="block text-sm mb-1">{{ field }}</label>
              <input
                [type]="field === 'email' ? 'email' : 'text'"
                [(ngModel)]="editingUser[field]"
                [name]="field"
                required
                class="w-full px-3 py-1.5 border rounded text-sm"
              />
            </div>

            <div>
              <label class="block text-sm mb-1">Permissions</label>
              <div class="space-y-1">
                <label
                  *ngFor="let perm of ['Admin', 'Initiator', 'Approver']"
                  class="flex items-center text-sm"
                >
                  <input
                    type="checkbox"
                    [checked]="editingUser.permissions.includes(perm)"
                    (change)="togglePermission(perm, editingUser.permissions)"
                    class="mr-2"
                  />
                  {{ perm }}
                </label>
              </div>
            </div>

            <div class="flex justify-end gap-2 mt-4">
              <button
                type="button"
                (click)="showEditModal = false"
                class="px-3 py-1.5 text-sm"
              >
                Cancel
              </button>
              <button
                type="submit"
                [disabled]="isSubmitting"
                class="bg-blue-600 text-white px-3 py-1.5 rounded text-sm"
              >
                <span
                  *ngIf="isSubmitting"
                  class="inline-block animate-spin mr-1"
                  >⌛</span
                >Update
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['./users.component.scss'],
})
export class UsersComponent implements OnInit {
  users: User[] = [];
  loading = false;
  error = '';
  showAddUserModal = false;
  showEditModal = false;
  isSubmitting = false;

  newUser:any = {
    name: '',
    email: '',
    phone: '',
    password: '',
    permissions: [] as string[],
    merchantId: '',
  };

  editingUser:any = {
    _id: '',
    name: '',
    email: '',
    phone: '',
    permissions: [] as string[],
  };

  constructor(private http: HttpClient, private store: Store) {}

  ngOnInit() {
    this.fetchUsers();
    this.newUser.merchantId = this.store.selectSnapshot(
      (state) => state.auth.user?.merchantId?._id
    );
  }

  private getHeaders(): HttpHeaders {
    const token = this.store.selectSnapshot(AuthState.token);
    return new HttpHeaders().set('Authorization', `Bearer ${token}`);
  }

  fetchUsers() {
    const merchantId = this.store.selectSnapshot(
      (state) => state.auth.user?.merchantId?._id
    );
    if (!merchantId) return;

    this.loading = true;
    this.http
      .get<any>(`https://doronpay.com/api/merchants/roles/get/${merchantId}`, {
        headers: this.getHeaders(),
      })
      .subscribe({
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
        },
      });
  }

  addUser(event: Event) {
    event.preventDefault();
    this.isSubmitting = true;

    this.http
      .post<any>('https://doronpay.com/api/merchants/roles/add', this.newUser, {
        headers: this.getHeaders(),
      })
      .subscribe({
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
        },
      });
  }

  editUser(user: User) {
    this.editingUser = {
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      permissions: [...user.permissions],
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
        permissions: this.editingUser.permissions,
      },
    };

    this.http
      .put<any>('https://doronpay.com/api/merchants/roles/update', payload, {
        headers: this.getHeaders(),
      })
      .subscribe({
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
        },
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
      merchantId: this.newUser.merchantId,
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
      year: 'numeric',
    });
  }
}
