import { Component, OnDestroy, OnInit } from '@angular/core';
import { TransferMoneyService } from './transfer-money.service';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';

@Component({
  selector: 'deposit-crypto',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <!-- Wallet Address Display -->
    <div class="flex justify-between items-start gap-4">
      <div class="bg-white rounded-xl shadow-sm">
        <div
          class="p-4 bg-gradient-to-r from-amber-600 to-amber-700 rounded-t-xl"
        >
          <div class="flex items-center gap-3">
            <div class="p-2 bg-white/10 rounded-lg">
              <i class="material-icons text-xl text-white">download</i>
            </div>
            <div>
              <h2 class="text-lg font-bold text-white">Deposit Crypto</h2>
              <p class="text-sm text-amber-100">
                Fund your wallet with USDT or BTC
              </p>
            </div>
          </div>
        </div>

        <form [formGroup]="$service.depositForm" class="p-4">
          <div class="space-y-6">
            <!-- Crypto Selection -->
            <div class="form-group">
              <label class="block text-sm font-semibold text-gray-700 mb-3"
                >Select Cryptocurrency</label
              >
              <div class="grid grid-cols-2 gap-4">
                <label class="relative">
                  <input
                    type="radio"
                    formControlName="cryptoType"
                    value="usdt"
                    class="peer sr-only"
                  />
                  <div
                    class="p-4 border-2 rounded-xl cursor-pointer flex items-center gap-3 peer-checked:border-amber-500 peer-checked:bg-amber-50"
                  >
                    <div
                      class="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600"
                    >
                      <i class="material-icons">attach_money</i>
                    </div>
                    <span class="font-medium text-gray-700">USDT</span>
                  </div>
                </label>
                <label class="relative">
                  <input
                    type="radio"
                    formControlName="cryptoType"
                    value="btc"
                    class="peer sr-only"
                  />
                  <div
                    class="p-4 border-2 rounded-xl cursor-pointer flex items-center gap-3 peer-checked:border-amber-500 peer-checked:bg-amber-50"
                  >
                    <div
                      class="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-600"
                    >
                      <i class="material-icons">currency_bitcoin</i>
                    </div>
                    <span class="font-medium text-gray-700">Bitcoin</span>
                  </div>
                </label>
              </div>
            </div>

            <div class="form-group">
              <div class="mb-6">
                <label class="block text-sm font-medium text-gray-600 mb-2"
                  >Deposit Amount</label
                >
                <div class="relative">
                  <input
                    type="text"
                    formControlName="amount"
                    class="w-full h-14 px-4 bg-white border-2 border-gray-200 rounded-xl"
                    placeholder="Enter amount"
                  />
                  <span
                    class="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500"
                    >USD</span
                  >
                </div>
              </div>

              <button
                (click)="$service.generateWallet()"
                [disabled]="
                  $service.isGenerating || !$service.depositForm.valid
                "
                class="w-full px-6 py-3 bg-amber-600 text-white rounded-xl hover:bg-amber-700 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <i class="material-icons" *ngIf="!$service.isGenerating"
                  >account_balance_wallet</i
                >
                <div
                  class="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"
                  *ngIf="$service.isGenerating"
                ></div>
                {{
                  $service.isGenerating
                    ? 'Generating...'
                    : 'Generate Deposit Address'
                }}
              </button>
            </div>

            <!-- Wallet Address Display & Transaction Tracking -->
            <div
              class="bg-gray-50 p-6 rounded-xl space-y-4"
              *ngIf="$service.depositResponse"
            >
              <div class="flex justify-between items-start gap-4">
                <div class="flex-1">
                  <label class="block text-sm font-medium text-gray-600 mb-2"
                    >Your Deposit Address</label
                  >
                  <div class="relative">
                    <input
                      type="text"
                      [value]="$service.depositResponse?.destination"
                      readonly
                      disabled
                      class="w-full h-14 px-4 bg-white border-2 border-gray-200 rounded-xl"
                    />
                    <button
                      type="button"
                      (click)="
                        $service.copyAddress(
                          $service.depositResponse?.destination
                        )
                      "
                      class="absolute right-2 top-2 p-2 text-gray-500 hover:text-gray-700"
                    >
                      <i class="material-icons">content_copy</i>
                    </button>
                  </div>
                </div>
                <div class="w-32 h-32 bg-white p-2 rounded-xl">
                  <img
                    *ngIf="$service.depositResponse?.qrCode; else qrPlaceholder"
                    [src]="$service.depositResponse?.qrCode"
                    alt="QR Code"
                    class="w-full h-full rounded-lg"
                  />
                  <ng-template #qrPlaceholder>
                    <div class="w-full h-full bg-gray-100 rounded-lg"></div>
                  </ng-template>
                </div>
              </div>

              <!-- Network Selection for USDT -->
              <div
                *ngIf="$service.depositForm.get('cryptoType')?.value === 'usdt'"
              >
                <label class="block text-sm font-medium text-gray-600 mb-2"
                  >Select Network</label
                >
                <select
                  disabled
                  class="w-full bg-white border-2 border-gray-200 rounded-xl px-4 h-12 appearance-none"
                >
                  <option value="trc20">Tron (TRC20)</option>
                </select>
              </div>

              <!-- Important Notice -->
              <div class="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <div class="flex gap-2">
                  <i class="material-icons text-amber-500">warning</i>
                  <div class="text-sm text-gray-600">
                    <p class="font-medium text-gray-700 mb-1">Important:</p>
                    <ul class="list-disc list-inside space-y-1">
                      <li>
                        Send only
                        {{
                          $service.depositForm
                            .get('cryptoType')
                            ?.value?.toUpperCase()
                        }}
                        to this address
                      </li>
                      <li>Minimum deposit: {{ $service.getMinDeposit() }}</li>
                      <li>
                        Processing time: {{ $service.getProcessingTime() }}
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </form>

        <!-- Transaction Status -->
        <div class="border-t border-gray-200 mt-4 p-4">
          <h3 class="text-sm font-semibold text-gray-700 mb-3">
            Transaction Status
          </h3>

          <!-- Status Timeline -->
          <div class="space-y-4">
            <!-- Waiting for Payment -->
            <div class="flex items-center gap-3">
              <div
                [class]="
                  'w-8 h-8 rounded-full flex items-center justify-center ' +
                  ($service.transactionStatus >= 1
                    ? 'bg-green-100 text-green-600'
                    : 'bg-gray-100 text-gray-400')
                "
              >
                <i class="material-icons text-sm">pending</i>
              </div>
              <div class="flex-1">
                <p class="text-sm font-medium text-gray-700">
                  Waiting for Payment
                </p>
                <p class="text-xs text-gray-500">
                  Send funds to the provided address
                </p>
              </div>
            </div>

            <!-- Deposit Completed -->
            <div class="flex items-center gap-3">
              <div
                [class]="
                  'w-8 h-8 rounded-full flex items-center justify-center ' +
                  ($service.transactionStatus === 4
                    ? 'bg-green-100 text-green-600'
                    : 'bg-gray-100 text-gray-400')
                "
              >
                <i class="material-icons text-sm">check_circle</i>
              </div>
              <div class="flex-1">
                <p class="text-sm font-medium text-gray-700">
                  Deposit Completed
                </p>
                <p class="text-xs text-gray-500">
                  Funds will be credited to your account
                </p>
              </div>
            </div>

            <!-- Error State -->
            <div
              class="flex items-center gap-3"
              *ngIf="$service.transactionStatus === -1"
            >
              <div
                class="w-8 h-8 rounded-full flex items-center justify-center bg-red-100 text-red-600"
              >
                <i class="material-icons text-sm">error</i>
              </div>
              <div class="flex-1">
                <p class="text-sm font-medium text-gray-700">
                  Transaction Failed
                </p>
                <p class="text-xs text-gray-500">
                  Please try again or contact support
                </p>
              </div>
            </div>
          </div>

          <!-- Transaction Details -->
          <div class="mt-4 p-4 bg-white rounded-lg border border-gray-200">
            <h4 class="text-sm font-semibold text-gray-700 mb-3">
              Transaction Details
            </h4>
            <div class="space-y-2 text-sm">
              <div class="flex justify-between">
                <span class="text-gray-500">Amount</span>
                <span class="font-medium text-gray-700">
                  {{ $service.depositForm.get('amount')?.value }} USD
                </span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-500"
                  >Expected
                  {{
                    $service.depositForm.get('cryptoType')?.value?.toUpperCase()
                  }}</span
                >
                <span class="font-medium text-gray-700">{{
                  $service.expectedCryptoAmount
                }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-500">Network Fee</span>
                <span class="font-medium text-gray-700">{{
                  $service.networkFee
                }}</span>
              </div>
            </div>
          </div>

          <!-- Payment Timer -->
          <div
            *ngIf="$service.transactionStatus === 1"
            class="mt-4 p-4 bg-amber-50 rounded-lg border border-amber-200"
          >
            <div class="flex items-center gap-2">
              <i class="material-icons text-amber-500">timer</i>
              <div>
                <p class="text-sm font-medium text-gray-700">
                  Time remaining to send payment
                </p>
                <p class="text-lg font-semibold text-amber-600">
                  {{ $service.paymentTimer }}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class DepositCryptoComponent implements OnInit, OnDestroy {
  private transactionStatusSubscription: Subscription | undefined;

  constructor(public $service: TransferMoneyService) {}

  ngOnInit() {}

  ngOnDestroy() {
    if (this.transactionStatusSubscription) {
      this.transactionStatusSubscription.unsubscribe();
    }
    this.$service.stopPolling$.next(); // Stop polling when the component is destroyed
    this.$service.stopPolling$.complete(); // Clean up the subject
  }
}
