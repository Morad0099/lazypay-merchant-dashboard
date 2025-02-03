import { CommonModule } from "@angular/common";
import { Component, OnInit } from "@angular/core";
import { ReactiveFormsModule } from "@angular/forms";
import { TransferMoneyService } from "./transfer-money.service";

@Component({
  selector: 'withdraw-crypto',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <!-- Withdraw Tab -->
    <div class="bg-white rounded-xl shadow-sm">
      <div class="p-4 bg-gradient-to-r from-green-600 to-green-700 rounded-t-xl">
        <div class="flex items-center gap-3">
          <div class="p-2 bg-white/10 rounded-lg">
            <i class="material-icons text-xl text-white">savings</i>
          </div>
          <div>
            <h2 class="text-lg font-bold text-white">Withdraw Crypto</h2>
            <p class="text-sm text-green-100">Convert to local currency</p>
          </div>
        </div>
      </div>

      <form [formGroup]="$service.withdrawForm" (ngSubmit)="$service.onWithdraw()" class="p-4">
        <div class="space-y-6">
          <!-- Crypto Balance -->
          <div class="bg-gray-50 p-6 rounded-xl space-y-4">
            <div class="flex justify-between items-center">
              <div class="flex items-center gap-2">
                <img src="/assets/images/usdt.svg" alt="USDT" class="w-6 h-6" />
                <span class="text-sm font-medium text-gray-600">USDT Balance</span>
              </div>
              <div class="text-right">
                <div class="text-lg font-semibold">
                  {{ $service.withdrawalBalance.usdt.cryptoBalance | currency }} USDT
                </div>
                <div class="text-sm text-gray-500">
                  ≈ {{ $service.withdrawalBalance.usdt.availableBalance | currency }}
                </div>
              </div>
            </div>

            <div class="flex justify-between items-center">
              <div class="flex items-center gap-2">
                <img src="/assets/images/bitcoin.svg" alt="BTC" class="w-6 h-6" />
                <span class="text-sm font-medium text-gray-600">BTC Balance</span>
              </div>
              <div class="text-right">
                <div class="text-lg font-semibold">
                  {{ $service.withdrawalBalance.btc.cryptoBalance }} BTC
                </div>
                <div class="text-sm text-gray-500">
                  ≈ {{ $service.withdrawalBalance.btc.availableBalance | currency }}
                </div>
              </div>
            </div>
          </div>

          <!-- Withdrawal Method -->
          <div class="form-group">
            <label class="block text-sm font-semibold text-gray-700 mb-3">Withdrawal Method</label>
            <div class="grid grid-cols-2 gap-4">
              <label class="relative">
                <input type="radio" formControlName="withdrawalMethod" value="bank" class="peer sr-only" />
                <div class="p-4 border-2 rounded-xl cursor-pointer flex items-center gap-3 peer-checked:border-green-500 peer-checked:bg-green-50">
                  <div class="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                    <i class="material-icons">account_balance</i>
                  </div>
                  <span class="font-medium text-gray-700">Bank Transfer</span>
                </div>
              </label>
              <label class="relative">
                <input type="radio" formControlName="withdrawalMethod" value="momo" class="peer sr-only" />
                <div class="p-4 border-2 rounded-xl cursor-pointer flex items-center gap-3 peer-checked:border-green-500 peer-checked:bg-green-50">
                  <div class="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                    <i class="material-icons">smartphone</i>
                  </div>
                  <span class="font-medium text-gray-700">Mobile Money</span>
                </div>
              </label>
            </div>
          </div>

          <!-- Network/Bank Selection -->
          <ng-container *ngIf="$service.withdrawForm.get('withdrawalMethod')?.value === 'momo'">
            <div class="form-group">
              <label class="block text-sm font-semibold text-gray-700 mb-2">Network Provider</label>
              <div class="relative">
                <select
                  formControlName="account_issuer"
                  class="w-full bg-gray-50 border-2 border-gray-200 rounded-xl px-4 h-14 appearance-none focus:outline-none focus:border-green-500 focus:bg-white transition-colors"
                >
                  <option value="">Select Provider</option>
                  <option value="mtn" class="py-2">MTN Mobile Money</option>
                  <option value="vodafone" class="py-2">Vodafone Cash</option>
                  <option value="airteltigo" class="py-2">AirtelTigo Money</option>
                </select>
                <i class="material-icons absolute right-4 top-4 text-gray-400">expand_more</i>
              </div>
              <p class="mt-2 text-sm text-red-500" *ngIf="$service.withdrawForm.get('account_issuer')?.touched && $service.withdrawForm.get('account_issuer')?.errors?.['required']">
                Please select a provider
              </p>
            </div>
          </ng-container>

          <ng-container *ngIf="$service.withdrawForm.get('withdrawalMethod')?.value === 'bank'">
            <div class="form-group">
              <label class="block text-sm font-semibold text-gray-700 mb-2">Select Bank</label>
              <div class="relative">
                <select
                  formControlName="account_issuer"
                  class="w-full bg-gray-50 border-2 border-gray-200 rounded-xl px-4 h-14 appearance-none focus:outline-none focus:border-green-500 focus:bg-white transition-colors"
                >
                  <option value="">Select Bank</option>
                  <option *ngFor="let bank of $service.banks" [value]="bank.BankCode" class="py-2">
                    {{ bank.BankName }}
                  </option>
                </select>
                <i class="material-icons absolute right-4 top-4 text-gray-400">expand_more</i>
              </div>
              <p class="mt-2 text-sm text-red-500" *ngIf="$service.withdrawForm.get('account_issuer')?.touched && $service.withdrawForm.get('account_issuer')?.errors?.['required']">
                Please select a bank
              </p>
            </div>
          </ng-container>

          <!-- Account Details Section -->
          <div class="bg-gray-50 p-6 rounded-xl space-y-6">
            <div class="form-group">
              <label class="block text-sm font-semibold text-gray-700 mb-2">Account Number</label>
              <div class="flex gap-3">
                <input
                  type="text"
                  formControlName="account_number"
                  class="flex-1 h-14 px-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-green-500"
                  placeholder="Enter account number"
                />
                <button
                  type="button"
                  [disabled]="!$service.canVerify || $service.isVerifyingAccount"
                  (click)="$service.verifyAccount()"
                  class="px-6 bg-green-600 text-white rounded-xl hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 min-w-[120px] justify-center h-14"
                >
                  <ng-container *ngIf="!$service.isVerifyingAccount">
                    <i class="material-icons text-sm">verified</i>
                    Verify
                  </ng-container>
                  <ng-container *ngIf="$service.isVerifyingAccount">
                    <div class="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Verifying...
                  </ng-container>
                </button>
              </div>
            </div>

            <div class="form-group">
              <label class="block text-sm font-semibold text-gray-700 mb-2">Account Name</label>
              <input
                type="text"
                formControlName="account_name"
                readonly
                class="w-full h-14 px-4 bg-gray-100 border-2 rounded-xl"
                [class.border-green-500]="$service.isAccountVerified"
                [class.border-gray-200]="!$service.isAccountVerified"
              />
            </div>
          </div>

          <!-- Crypto Selection -->
          <div class="form-group">
            <label class="block text-sm font-semibold text-gray-700 mb-2">Select Crypto to Withdraw</label>
            <div class="relative">
              <select
                formControlName="cryptoType"
                class="w-full bg-gray-50 border-2 border-gray-200 rounded-xl px-4 h-14 appearance-none focus:outline-none focus:border-green-500"
              >
                <option value="usdt">USDT</option>
                <option value="btc">Bitcoin (BTC)</option>
              </select>
              <i class="material-icons absolute right-4 top-4 text-gray-400">expand_more</i>
            </div>
          </div>

          <!-- Amount -->
          <div class="form-group">
            <label class="block text-sm font-semibold text-gray-700 mb-2">Amount to Withdraw</label>
            <div class="relative">
              <span class="absolute left-4 top-4 text-gray-500">USD</span>
              <input
                type="number"
                formControlName="amount"
                class="w-full h-14 pl-16 pr-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-green-500"
                placeholder="0.00"
              />
            </div>
          </div>

          <div class="form-group">
            <label class="block text-sm font-semibold text-gray-700 mb-2"
              >Description</label
            >
            <textarea
              formControlName="description"
              rows="3"
              class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 resize-none"
              placeholder="What's this payment for?"
            ></textarea>
            <p
              class="mt-2 text-sm text-red-500"
              *ngIf="$service.withdrawForm.get('description')?.touched && $service.withdrawForm.get('description')?.errors?.['required']"
            >
              Description is required
            </p>
          </div>

          <!-- OTP Section -->
          <ng-container *ngIf="$service.showOtpSection">
            <div class="bg-green-50 p-6 rounded-xl space-y-3 border-2 border-green-100">
              <label class="block text-sm font-semibold text-gray-700">Enter OTP</label>
              <div class="flex gap-3">
                <input
                  type="text"
                  formControlName="otp"
                  maxlength="5"
                  class="flex-1 h-14 px-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-green-500"
                  placeholder="Enter OTP code"
                />
                <button
                  type="button"
                  (click)="$service.resendOtp()"
                  class="px-6 text-green-600 hover:bg-green-100 rounded-xl transition-colors"
                >
                  Resend OTP
                </button>
              </div>
            </div>
          </ng-container>

          <!-- Withdrawal Details -->
          <div class="bg-gray-50 p-6 rounded-xl space-y-4">
            <div class="flex justify-between items-center">
              <span class="text-sm text-gray-600">Platform Fee</span>
              <span class="text-sm font-medium">
                {{ $service.withdrawCryptoDetails.platformTransactionFee | currency }}
              </span>
            </div>
            <div class="flex justify-between items-center">
              <span class="text-sm text-gray-600">Total Amount</span>
              <span class="text-sm font-medium">
                {{ $service.withdrawCryptoDetails.totalAmount | currency }}
              </span>
            </div>
            <div class="flex justify-between items-center">
              <span class="text-sm text-gray-600">Crypto Amount</span>
              <span class="text-sm font-medium">{{ $service.withdrawCryptoDetails.cryptoAmount }}</span>
            </div>
            <div class="flex justify-between items-center">
              <span class="text-sm text-gray-600">You'll Receive (GHS)</span>
              <span class="text-lg font-semibold">
                {{ $service.withdrawCryptoDetails.amountToRecieve | currency : 'GHS' }}
              </span>
            </div>
          </div>
        </div>

        <!-- Transaction Status -->
        <div class="border-t border-gray-200 mt-6 pt-6" *ngIf="$service.transactionStatus > 0">
          <h3 class="text-sm font-semibold text-gray-700 mb-4">Transaction Status</h3>

          <!-- Status Timeline -->
          <div class="space-y-4">
            <!-- Processing -->
            <div class="flex items-center gap-3">
              <div [class]="'w-8 h-8 rounded-full flex items-center justify-center ' + 
                ($service.transactionStatus >= 1 ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400')">
                <i class="material-icons text-sm">sync</i>
              </div>
              <div class="flex-1">
                <p class="text-sm font-medium text-gray-700">Processing</p>
                <p class="text-xs text-gray-500">Your withdrawal is being processed</p>
              </div>
            </div>

            <!-- Complete -->
            <div class="flex items-center gap-3">
              <div [class]="'w-8 h-8 rounded-full flex items-center justify-center ' + 
                ($service.transactionStatus === 4 ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400')">
                <i class="material-icons text-sm">check_circle</i>
              </div>
              <div class="flex-1">
                <p class="text-sm font-medium text-gray-700">Complete</p>
                <p class="text-xs text-gray-500">Funds have been sent to your account</p>
              </div>
            </div>

            <!-- Error State -->
            <div class="flex items-center gap-3" *ngIf="$service.transactionStatus === -1">
              <div class="w-8 h-8 rounded-full flex items-center justify-center bg-red-100 text-red-600">
                <i class="material-icons text-sm">error</i>
              </div>
              <div class="flex-1">
                <p class="text-sm font-medium text-gray-700">Transaction Failed</p>
                <p class="text-xs text-gray-500">Please try again or contact support</p>
              </div>
            </div>
          </div>

          <!-- Transaction Details -->
          <div class="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <div class="space-y-2 text-sm">
              <div class="flex justify-between">
                <span class="text-gray-500">Transaction ID</span>
                <span class="font-medium text-gray-700">{{ $service.transactionHash || 'Pending...' }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-500">Status</span>
                <span class="font-medium" [ngClass]="{
                  'text-yellow-600': $service.transactionStatus === 1,
                  'text-green-600': $service.transactionStatus === 4,
                  'text-red-600': $service.transactionStatus === -1
                }">
                  {{ $service.transactionStatus === 1 ? 'Processing' : 
                     $service.transactionStatus === 4 ? 'Completed' : 
                     $service.transactionStatus === -1 ? 'Failed' : 'Pending' }}
                </span>
              </div>
              <div class="flex justify-between" *ngIf="$service.confirmations > 0">
                <span class="text-gray-500">Confirmations</span>
                <span class="font-medium text-gray-700">
                  {{ $service.confirmations }}/{{ $service.requiredConfirmations }}
                </span>
              </div>
            </div>
          </div>

          <!-- Processing Timer -->
          <div *ngIf="$service.transactionStatus === 1" class="mt-4 p-4 bg-amber-50 rounded-lg border border-amber-200">
            <div class="flex items-center gap-2">
              <i class="material-icons text-amber-500">timer</i>
              <div>
                <p class="text-sm font-medium text-gray-700">Estimated processing time</p>
                <p class="text-lg font-semibold text-amber-600">{{ $service.paymentTimer }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="mt-8">
          <ng-container *ngIf="!$service.showOtpSection && $service.isAccountVerified">
            <button
              type="button"
              (click)="$service.requestOtp()"
              [disabled]="$service.isSendingOtp"
              class="w-full h-14 bg-gray-800 text-white rounded-xl hover:bg-gray-900 flex items-center gap-2 justify-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ng-container *ngIf="!$service.isSendingOtp">
                <i class="material-icons text-sm">sms</i>
                Request OTP
              </ng-container>
              <ng-container *ngIf="$service.isSendingOtp">
                <div class="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                Sending...
              </ng-container>
            </button>
          </ng-container>

          <ng-container *ngIf="$service.showOtpSection">
            <button
              type="submit"
              [disabled]="!$service.withdrawForm.valid || $service.isSubmitting"
              class="w-full h-14 bg-green-600 text-white rounded-xl hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <i class="material-icons text-sm">account_balance_wallet</i>
              {{ $service.isSubmitting ? 'Processing...' : 'Withdraw Funds' }}
            </button>
          </ng-container>
        </div>
      </form>
    </div>
  `
})
export class WithdrawCryptoComponent implements OnInit {
  constructor(public $service: TransferMoneyService) {}

  ngOnInit() {
    // Initialize form and fetch any required data
    this.$service.fetchWallets();
  }
}