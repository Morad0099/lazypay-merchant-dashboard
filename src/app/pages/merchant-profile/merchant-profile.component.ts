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
    <div class="max-w-7xl mx-auto p-4 space-y-4">
      <!-- Loading State -->
      <div *ngIf="loading" class="flex justify-center p-12">
        <div
          class="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"
        ></div>
      </div>

      <!-- Error State -->
      <div
        *ngIf="error"
        class="bg-red-50 text-red-600 p-3 rounded-md flex items-center gap-2"
      >
        <svg
          class="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        {{ error }}
      </div>

      <ng-container *ngIf="!loading && !error">
        <!-- Header Card -->
        <div class="bg-white rounded-lg shadow-sm p-6">
          <div class="flex justify-between items-start gap-4">
            <div>
              <div class="flex items-center gap-2">
                <svg
                  class="w-6 h-6 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                  />
                </svg>
                <h1 class="text-xl font-semibold">
                  {{ profile?.merchant_tradeName }}
                </h1>
              </div>
              <span
                [class]="
                  profile?.active
                    ? 'bg-green-50 text-green-700'
                    : 'bg-gray-50 text-gray-600'
                "
                class="inline-flex items-center px-2 py-1 rounded-full text-sm mt-2 gap-1"
              >
                <span
                  class="w-2 h-2 rounded-full"
                  [class]="profile?.active ? 'bg-green-500' : 'bg-gray-500'"
                ></span>
                {{ profile?.active ? 'Active' : 'Inactive' }}
              </span>
            </div>
            <div class="text-sm text-gray-500 flex flex-col items-end">
              <div class="flex items-center gap-1">
                <svg
                  class="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                <p>Registered: {{ formatDate(profile?.createdAt) }}</p>
              </div>
              <div class="flex items-center gap-1">
                <svg
                  class="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <p>Updated: {{ formatDate(profile?.updatedAt) }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Main Content Grid -->
        <div class="grid md:grid-cols-2 gap-4">
          <!-- Business Info -->
          <div class="bg-white rounded-lg shadow-sm p-6">
            <div class="flex items-center gap-2 mb-4">
              <svg
                class="w-5 h-5 text-blue-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                />
              </svg>
              <h2 class="text-lg font-semibold">Business Details</h2>
            </div>
            <div class="grid sm:grid-cols-2 gap-4">
              <div class="flex gap-2">
                <svg
                  class="w-5 h-5 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                <div>
                  <div class="text-sm text-gray-500">Registration No.</div>
                  <div>{{ profile?.registrationNumber }}</div>
                </div>
              </div>
              <div class="flex gap-2">
                <svg
                  class="w-5 h-5 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
                <div>
                  <div class="text-sm text-gray-500">Type</div>
                  <div>{{ profile?.lineOfBusiness }}</div>
                </div>
              </div>
              <div class="flex gap-2">
                <svg
                  class="w-5 h-5 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
                <div>
                  <div class="text-sm text-gray-500">Email</div>
                  <div>{{ profile?.email }}</div>
                </div>
              </div>
              <div class="flex gap-2">
                <svg
                  class="w-5 h-5 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                  />
                </svg>
                <div>
                  <div class="text-sm text-gray-500">Phone</div>
                  <div>{{ profile?.phone }}</div>
                </div>
              </div>
              <div class="flex gap-2 sm:col-span-2">
                <svg
                  class="w-5 h-5 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  />
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
                <div>
                  <div class="text-sm text-gray-500">Address</div>
                  <div>{{ profile?.address }}</div>
                </div>
              </div>
            </div>
          </div>

          <!-- Contact Person -->
          <div class="bg-white rounded-lg shadow-sm p-6">
            <div class="flex items-center gap-2 mb-4">
              <svg
                class="w-5 h-5 text-blue-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
              <h2 class="text-lg font-semibold">Contact Person</h2>
            </div>
            <div class="grid sm:grid-cols-2 gap-4">
              <div class="flex gap-2">
                <svg
                  class="w-5 h-5 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
                <div>
                  <div class="text-sm text-gray-500">Name</div>
                  <div>{{ profile?.contact_person }}</div>
                </div>
              </div>
              <div class="flex gap-2">
                <svg
                  class="w-5 h-5 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
                <div>
                  <div class="text-sm text-gray-500">Role</div>
                  <div>{{ profile?.contactPersonDesignation }}</div>
                </div>
              </div>
              <div class="flex gap-2">
                <svg
                  class="w-5 h-5 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
                <div>
                  <div class="text-sm text-gray-500">Email</div>
                  <div>{{ profile?.contactPersonEmail }}</div>
                </div>
              </div>
              <div class="flex gap-2">
                <svg
                  class="w-5 h-5 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                  />
                </svg>
                <div>
                  <div class="text-sm text-gray-500">Phone</div>
                  <div>{{ profile?.contactPersonPhone }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Operations -->
        <div class="flex flex-col md:flex-row items-start justify-start gap-4">
          <!-- Loading and Error states from previous code remain the same -->

          <div *ngIf="!loading && !error">
            <!-- Header Card and Business Info sections from previous code remain the same -->
            <!-- Operations -->
            <div class="bg-white rounded-lg shadow-sm p-6">
              <div class="flex items-center gap-2 mb-4">
                <svg
                  class="w-5 h-5 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                  />
                </svg>
                <h2 class="text-lg font-semibold">Operations</h2>
              </div>
              <div class="grid sm:grid-cols-2 gap-4">
                <div class="flex gap-2">
                  <svg
                    class="w-5 h-5 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                    />
                  </svg>
                  <div>
                    <div class="text-sm text-gray-500">Account Type</div>
                    <div>{{ profile?.accountType }}</div>
                  </div>
                </div>
                <div class="flex gap-2">
                  <svg
                    class="w-5 h-5 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                    />
                  </svg>
                  <div>
                    <div class="text-sm text-gray-500">Charge Type</div>
                    <div>{{ profile?.chargeType }}</div>
                  </div>
                </div>
                <div class="flex gap-2">
                  <svg
                    class="w-5 h-5 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z"
                    />
                  </svg>
                  <div>
                    <div class="text-sm text-gray-500">Debit Operator</div>
                    <div>{{ profile?.debitOperator }}</div>
                  </div>
                </div>
                <div class="flex gap-2">
                  <svg
                    class="w-5 h-5 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <div>
                    <div class="text-sm text-gray-500">Credit Operator</div>
                    <div>{{ profile?.creditOperator }}</div>
                  </div>
                </div>
                <div class="sm:col-span-2">
                  <div class="text-sm text-gray-500 mb-2">
                    Permitted Operations
                  </div>
                  <div class="flex flex-wrap gap-2">
                    <span
                      class="inline-flex items-center gap-1 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm"
                      *ngFor="let op of profile?.operations"
                    >
                      <svg
                        class="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      {{ op }}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Transaction Charges -->
            <div class="bg-white rounded-lg shadow-sm p-6 mt-2">
              <div class="flex items-center gap-2 mb-4">
                <svg
                  class="w-5 h-5 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <h2 class="text-lg font-semibold">Transaction Charges</h2>
              </div>
              <div class="grid sm:grid-cols-2 gap-6">
                <div>
                  <h3 class="font-medium mb-3 flex items-center gap-2">
                    <svg
                      class="w-4 h-4 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2z"
                      />
                    </svg>
                    Standard Charges
                  </h3>
                  <div class="space-y-2">
                    <div class="flex justify-between items-center">
                      <span class="text-gray-500">Card Transaction</span>
                      <span class="font-medium"
                        >{{ profile?.card_charge }}%</span
                      >
                    </div>
                    <div class="flex justify-between items-center">
                      <span class="text-gray-500">Mobile Money</span>
                      <span class="font-medium"
                        >{{ profile?.momo_charge }}%</span
                      >
                    </div>
                    <div class="flex justify-between items-center">
                      <span class="text-gray-500">Bitcoin</span>
                      <span class="font-medium"
                        >{{ profile?.btc_charge }}%</span
                      >
                    </div>
                  </div>
                </div>
                <div>
                  <h3 class="font-medium mb-3 flex items-center gap-2">
                    <svg
                      class="w-4 h-4 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
                      />
                    </svg>
                    Disbursement Charges
                  </h3>
                  <div class="space-y-2">
                    <div class="flex justify-between items-center">
                      <span class="text-gray-500">GIP</span>
                      <span class="font-medium"
                        >{{ profile?.disburse_gip_charge }}%</span
                      >
                    </div>
                    <div class="flex justify-between items-center">
                      <span class="text-gray-500">Mobile Money</span>
                      <span class="font-medium"
                        >{{ profile?.disburse_momo_charge }}%</span
                      >
                    </div>
                    <div class="flex justify-between items-center">
                      <span class="text-gray-500">NRT</span>
                      <span class="font-medium"
                        >{{ profile?.disburse_nrt_charge }}%</span
                      >
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Documents -->
          <div
            *ngIf="documents.length > 0"
            class="bg-white rounded-lg shadow-sm p-6"
          >
            <div class="flex items-center gap-2 mb-4">
              <svg
                class="w-5 h-5 text-blue-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              <h2 class="text-lg font-semibold">Documents</h2>
            </div>
            <div class="space-y-2">
              <button
                *ngFor="let doc of documents"
                (click)="openImageModal(doc)"
                class="w-full flex items-center p-3 hover:bg-gray-50 rounded-lg transition-colors"
              >
                <svg
                  class="w-6 h-6 text-gray-400 mr-3"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                <div class="text-left">
                  <div>{{ doc.name }}</div>
                  <div class="text-sm text-gray-500">
                    {{ formatDate(doc.createdAt) }}
                  </div>
                </div>
              </button>
            </div>
          </div>
        </div>

        <!-- Image Modal -->
        <div
          *ngIf="showImageModal"
          class="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          (click)="closeImageModal()"
        >
          <div
            class="bg-white rounded-lg max-w-3xl w-full mx-4"
            (click)="$event.stopPropagation()"
          >
            <div class="flex justify-between items-center p-4 border-b">
              <h3 class="font-semibold">{{ selectedDocument?.name }}</h3>
              <button
                class="text-gray-500 hover:text-gray-700"
                (click)="closeImageModal()"
              >
                <svg
                  class="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
            <div class="p-4">
              <img
                [src]="selectedDocument?.data"
                [alt]="selectedDocument?.name"
                class="w-full h-auto"
              />
            </div>
            <div class="p-4 border-t text-sm text-gray-500">
              Uploaded: {{ formatDate(selectedDocument?.createdAt) }}
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
      .get<any>(`https://doronpay.com/api/merchants/get/${merchantId}`, {
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
      .get<any>(`https://doronpay.com/api/documents/get/${merchantId}`, {
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
