import { CommonModule } from '@angular/common';
import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { TransferMoneyService } from './transfer-money.service';
import { OtpVerificationComponent, OtpVerificationOutput } from './otp-verification.component';

@Component({
  selector: 'buy-cryto',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, OtpVerificationComponent],
  template: `
    <!-- Crypto Tab -->
    <div class="bg-white rounded-xl shadow-sm">
      <div
        class="p-4 bg-gradient-to-r from-purple-600 to-purple-700 rounded-t-xl"
      >
        <div class="flex items-center gap-3">
          <div class="p-2 bg-white/10 rounded-lg">
            <i class="material-icons text-xl text-white">currency_bitcoin</i>
          </div>
          <div>
            <h2 class="text-lg font-bold text-white">Crypto Transfer</h2>
            <p class="text-sm text-purple-100">Send USDT or Bitcoin globally</p>
          </div>
        </div>
      </div>

      <form
        [formGroup]="$service.cryptoForm"
        (ngSubmit)="$service.onCryptoTransfer()"
        class="p-4"
      >
        <div class="space-y-6">
          <!-- Crypto Type Selection -->
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
                  class="p-4 border-2 rounded-xl cursor-pointer flex items-center gap-3 peer-checked:border-purple-500 peer-checked:bg-purple-50"
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
                  class="p-4 border-2 rounded-xl cursor-pointer flex items-center gap-3 peer-checked:border-purple-500 peer-checked:bg-purple-50"
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

          <!-- Wallet Address -->
          <div class="form-group">
            <label class="block text-sm font-semibold text-gray-700 mb-2"
              >Recipient Wallet Address</label
            >
            <input
              type="text"
              formControlName="walletAddress"
              class="w-full h-14 px-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-purple-500"
              placeholder="Enter wallet address"
            />
          </div>

          <!-- Amount -->
          <div class="form-group">
            <label class="block text-sm font-semibold text-gray-700 mb-2"
              >Amount</label
            >
            <div class="relative">
              <span class="absolute left-4 top-4 text-gray-500"> USD </span>
              <input
                type="number"
                formControlName="amount"
                class="w-full h-14 pl-16 pr-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-purple-500"
                placeholder="0.00"
              />
            </div>
          </div>

          <!--Account Name-->
          <div class="form-group">
            <label class="block text-sm font-semibold text-gray-700 mb-2"
              >Account Name</label
            >
            <!-- <div class="relative"> -->
            <!-- <span class="absolute left-4 top-4 text-gray-500"> USD </span> -->
            <input
              type="text"
              formControlName="accountName"
              class="w-full h-14 px-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-purple-500"
              placeholder="Enter account name"
            />
            <!-- </div> -->
          </div>

          <div class="form-group">
            <label class="block text-sm font-semibold text-gray-700 mb-2"
              >Description</label
            >
            <input
              type="text"
              formControlName="description"
              class="w-full h-14 px-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-purple-500"
              placeholder="Enter description"
            />
          </div>

          <div class="form-group" *ngIf="$service.showOtpSection">
    <label class="block text-sm font-semibold text-gray-700 mb-2">Enter OTP</label>
    <input
      type="text"
      formControlName="otp"
      maxlength="6"
      class="w-full h-14 px-4 text-center text-lg tracking-widest border-2 border-gray-200 rounded-xl focus:outline-none focus:border-purple-500"
      placeholder="Enter 6-digit code"
    />
    <div class="mt-2 text-center">
      <ng-container *ngIf="timer > 0; else resendButton">
        <span class="text-sm text-gray-500 flex items-center justify-center gap-1">
          <i class="material-icons text-sm">timer</i>
          Resend in {{timer}}s
        </span>
      </ng-container>
      <ng-template #resendButton>
        <button
          type="button"
          (click)="resendOtp()"
          [disabled]="$service.isSendingOtp"
          class="text-purple-600 hover:text-purple-700 text-sm"
        >
          Resend OTP
        </button>
      </ng-template>
    </div>
  </div>


  <div 
  *ngIf="$service.isSendingOtp"
  class="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
>
  <div class="bg-white p-6 rounded-xl flex flex-col items-center gap-3">
    <div class="w-12 h-12 border-4 border-t-purple-600 border-purple-200 rounded-full animate-spin"></div>
    <p class="text-sm font-medium">Sending OTP...</p>
  </div>
</div>

        <!-- Submit Button -->
        <!-- <button
          type="submit"
          [disabled]="!otpForm.valid || isSubmitting"
          class="w-full h-14 mt-4 bg-purple-600 text-white rounded-xl hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {{ isSubmitting ? 'Verifying...' : 'Verify OTP' }}
        </button> -->

        <!-- Resend Timer -->
        <div class="mt-4 text-center">
          <ng-container *ngIf="timer > 0; else resendButton">
            <span class="text-sm text-gray-500">
              <i class="material-icons align-middle text-sm">timer</i>
              Resend in {{timer}}s
            </span>
          </ng-container>
          <ng-template #resendButton>
            <button
              type="button"
              (click)="resendOtp()"
              class="text-purple-600 hover:text-purple-700 text-sm"
            >
              Resend OTP
            </button>
          </ng-template>
        </div>

          <!-- Network Fee -->
          <div class="bg-gray-50 p-6 rounded-xl">
            <div class="flex justify-between items-center mb-2">
              <span class="text-sm text-gray-600">Network Fee</span>
              <span class="text-sm font-medium">{{
                $service.sendCryptoDetails.networkFee | currency
              }}</span>
            </div>
            <div class="flex justify-between items-center">
              <span class="text-sm text-gray-600">Platform Fee</span>
              <span class="text-sm font-medium">{{
                $service.sendCryptoDetails.platformTransactionFee
              }}</span>
            </div>
            <div class="flex justify-between items-center">
              <span class="text-sm text-gray-600">Transaction Charge</span>
              <span class="text-sm font-medium">{{
                $service.sendCryptoDetails.transactionCharge | currency
              }}</span>
            </div>
            <div class="flex justify-between items-center">
              <span class="text-sm text-gray-600">Crypto Amount</span>
              <span class="text-sm font-medium">{{
                $service.sendCryptoDetails.cryptoAmount
              }}</span>
            </div>
            <div class="flex justify-between items-center">
              <span class="text-sm text-gray-600">Total Amount</span>
              <span class="text-sm font-medium">{{
                $service.sendCryptoDetails.totalAmount | currency
              }}</span>
            </div>
          </div>
        </div>

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
                  Transfer Completed
                </p>
                <p class="text-xs text-gray-500">
                  Funds will be transferred to your provided account
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

        <!-- Submit Button -->
        <button
          type="button"
          (click)="$service.onCryptoTransfer()"
          [disabled]="!$service.cryptoForm.valid || $service.isSubmitting"
          class="w-full h-14 bg-purple-600 text-white rounded-xl..."
        >
          {{
            $service.isSubmitting
              ? 'Processing...'
              : $service.showOtpSection
              ? 'Complete Transfer'
              : 'Send Crypto'
          }}
        </button>
      </form>
    </div>
  `,
})
export class SendCryptoComponent implements OnInit {
  isSubmitting = false;
  timer = 30;
  private timerInterval: any;
  @Output() resend = new EventEmitter<void>();

  constructor(public $service: TransferMoneyService) {}

  handleOtpVerification(event: OtpVerificationOutput) {
    if (event.type === 'verify') {
      this.$service.cryptoForm.patchValue({ otp: event.otp });
    }
    this.$service.onCryptoTransfer();
  }

  resendOtp() {
    this.resend.emit();
    this.timer = 30;
    this.startTimer();
  }

  private startTimer() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }
    
    this.timerInterval = setInterval(() => {
      if (this.timer > 0) {
        this.timer--;
      } else {
        clearInterval(this.timerInterval);
      }
    }, 1000);
  }

  ngOnInit() {}
}
