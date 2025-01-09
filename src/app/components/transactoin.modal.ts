import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiTransaction } from '../types';

@Component({
  selector: 'app-transaction-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
    >
      <div
        class="bg-white rounded-xl w-full max-w-5xl max-h-[90vh] overflow-y-auto shadow-2xl"
      >
        <!-- Header -->
        <div
          class="p-6 border-b border-gray-100 sticky top-0 bg-white/95 backdrop-blur-sm z-10"
        >
          <div class="flex justify-between items-center">
            <div class="space-y-2">
              <h2 class="text-2xl font-semibold text-gray-900">
                Transaction Details
              </h2>
              <div class="flex items-center gap-3">
                <span
                  [class]="
                    'px-3 py-1 rounded-full text-sm font-medium ' +
                    getStatusClass(transaction?.status)
                  "
                >
                  {{ transaction?.status }}
                </span>
                <span class="text-sm text-gray-500">{{
                  transaction?.createdAt | date : 'medium'
                }}</span>
              </div>
            </div>
            <button
              (click)="close.emit()"
              class="text-gray-400 hover:text-gray-500 focus:outline-none transition-colors"
            >
              <svg
                class="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
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
        </div>

        <!-- Content -->
        <div class="p-6 space-y-8">
          <!-- Main Transaction Info -->
          <div class="grid md:grid-cols-2 gap-8">
            <div class="bg-gray-50 p-6 rounded-lg space-y-4">
              <h3
                class="text-lg font-semibold text-gray-900 flex items-center gap-2"
              >
                <span class="p-2 bg-blue-100 rounded-lg">
                  <svg
                    class="w-5 h-5 text-blue-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M13 10V3L4 14h7v7l9-11h-7z"
                    />
                  </svg>
                </span>
                Transaction Information
              </h3>
              <div class="space-y-3">
                <div class="flex justify-between">
                  <span class="text-gray-600">Reference ID</span>
                  <span class="font-medium">{{
                    transaction?.transactionRef
                  }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-gray-600">External ID</span>
                  <span class="font-medium">{{
                    transaction?.externalTransactionId
                  }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-gray-600">Type</span>
                  <span class="font-medium">{{
                    transaction?.transaction_type
                  }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-gray-600">Description</span>
                  <span class="font-medium">{{
                    transaction?.description
                  }}</span>
                </div>
              </div>
            </div>

            <!-- Amount Details -->
            <div class="bg-gray-50 p-6 rounded-lg space-y-4">
              <h3
                class="text-lg font-semibold text-gray-900 flex items-center gap-2"
              >
                <span class="p-2 bg-green-100 rounded-lg">
                  <svg
                    class="w-5 h-5 text-green-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </span>
                Amount Details
              </h3>
              <div class="space-y-3">
                <div class="flex justify-between">
                  <span class="text-gray-600">Amount</span>
                  <span class="font-medium text-green-600">
                    {{ transaction?.currency }}
                    {{ transaction?.amount | number : '1.2-2' }}
                  </span>
                </div>
                <div class="flex justify-between">
                  <span class="text-gray-600">Actual Amount</span>
                  <span class="font-medium">
                    {{ transaction?.currency }}
                    {{ transaction?.actualAmount | number : '1.2-2' }}
                  </span>
                </div>
                <div class="flex justify-between">
                  <span class="text-gray-600">Charges</span>
                  <span class="font-medium text-red-600">
                    {{ transaction?.currency }}
                    {{ transaction?.charges | number : '1.2-2' }}
                  </span>
                </div>
                <!-- <div class="flex justify-between">
                  <span class="text-gray-600">Profit</span>
                  <span class="font-medium text-blue-600">
                    {{ transaction?.currency }}
                    {{ transaction?.profitEarned | number : '1.2-2' }}
                  </span>
                </div> -->
              </div>
            </div>
          </div>

          <!-- Sender & Recipient Details -->
          <div class="grid md:grid-cols-2 gap-8">
            <!-- Sender Details -->
            <div class="bg-gray-50 p-6 rounded-lg space-y-4">
              <h3
                class="text-lg font-semibold text-gray-900 flex items-center gap-2"
              >
                <span class="p-2 bg-purple-100 rounded-lg">
                  <svg
                    class="w-5 h-5 text-purple-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                </span>
                Sender Details
              </h3>
              <div class="space-y-3">
                <div class="flex justify-between">
                  <span class="text-gray-600">Name</span>
                  <span class="font-medium">{{
                    transaction?.payment_account_name
                  }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-gray-600">Account Number</span>
                  <span class="font-medium">{{
                    transaction?.payment_account_number
                  }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-gray-600">Account Type</span>
                  <span class="font-medium">{{
                    transaction?.payment_account_type
                  }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-gray-600">Issuer</span>
                  <span class="font-medium">{{
                    transaction?.payment_account_issuer | uppercase
                  }}</span>
                </div>
              </div>
            </div>

            <!-- Recipient Details -->
            <div class="bg-gray-50 p-6 rounded-lg space-y-4">
              <h3
                class="text-lg font-semibold text-gray-900 flex items-center gap-2"
              >
                <span class="p-2 bg-orange-100 rounded-lg">
                  <svg
                    class="w-5 h-5 text-orange-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                    />
                  </svg>
                </span>
                Recipient Details
              </h3>
              <div class="space-y-3">
                <div class="flex justify-between">
                  <span class="text-gray-600">Name</span>
                  <span class="font-medium">{{
                    transaction?.recipient_account_name
                  }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-gray-600">Account Number</span>
                  <span class="font-medium">{{
                    transaction?.recipient_account_number
                  }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-gray-600">Account Type</span>
                  <span class="font-medium">{{
                    transaction?.recipient_account_type
                  }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-gray-600">Issuer</span>
                  <span class="font-medium">{{
                    transaction?.recipient_account_issuer_name
                  }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Additional Information -->
          <div class="bg-gray-50 p-6 rounded-lg space-y-4">
            <h3
              class="text-lg font-semibold text-gray-900 flex items-center gap-2"
            >
              <span class="p-2 bg-yellow-100 rounded-lg">
                <svg
                  class="w-5 h-5 text-yellow-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </span>
              Additional Information
            </h3>
            <div class="grid md:grid-cols-2 gap-6">
              <div class="space-y-3">
                <div class="flex justify-between">
                  <span class="text-gray-600">Debit Operator</span>
                  <span class="font-medium">{{
                    transaction?.debitOperator
                  }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-gray-600">Charge Type</span>
                  <span class="font-medium">{{
                    transaction?.charge_type
                  }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-gray-600">Process Attempts</span>
                  <span class="font-medium">{{
                    transaction?.processAttempts
                  }}</span>
                </div>
              </div>
              <div class="space-y-3">
                <div class="flex justify-between">
                  <span class="text-gray-600">Balance Before</span>
                  <span class="font-medium"
                    >{{ transaction?.currency }}
                    {{
                      transaction?.balanceBeforCredit | number : '1.2-2'
                    }}</span
                  >
                </div>
                <div class="flex justify-between">
                  <span class="text-gray-600">Balance After</span>
                  <span class="font-medium"
                    >{{ transaction?.currency }}
                    {{
                      transaction?.balanceAfterCredit | number : '1.2-2'
                    }}</span
                  >
                </div>
                <div class="flex justify-between">
                  <span class="text-gray-600">Customer Type</span>
                  <span class="font-medium">{{
                    transaction?.customerType
                  }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div class="p-6 border-t border-gray-100">
          <div class="flex justify-end gap-4">
            <button
              (click)="close.emit()"
              class="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-300 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
      }
    `,
  ],
})
export class TransactionModalComponent {
  @Input() transaction: ApiTransaction | any = null;
  @Output() close = new EventEmitter<void>();

  getStatusClass(status: string): string {
    const classes = {
      PAID: 'bg-green-100 text-green-800',
      FAILED: 'bg-red-100 text-red-800',
      PENDING: 'bg-yellow-100 text-yellow-800',
      INITIATED: 'bg-blue-100 text-blue-800',
    };
    return (
      classes[status as keyof typeof classes] || 'bg-gray-100 text-gray-800'
    );
  }
}
