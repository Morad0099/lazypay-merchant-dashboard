import { Component, OnInit } from '@angular/core';
import { TransferMoneyService } from './transfer-money.service';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'send-fiat',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="bg-white rounded-xl shadow-sm">
      <div class="p-4 bg-gradient-to-r from-blue-600 to-blue-700 rounded-t-xl">
        <div class="flex items-center gap-3">
          <div class="p-2 bg-white/10 rounded-lg">
            <i class="material-icons text-xl text-white">payments</i>
          </div>
          <div>
            <h2 class="text-lg font-bold text-white">Send Money</h2>
            <p class="text-sm text-blue-100">
              Transfer to mobile money or bank
            </p>
          </div>
        </div>
      </div>

      <form
        [formGroup]="$service.sendMoneyForm"
        (ngSubmit)="$service.onSendMoney()"
        class="p-4"
      >
        <div class="mb-8">
          <label class="block text-sm font-semibold text-gray-700 mb-3"
            >Transfer Type</label
          >
          <div class="grid grid-cols-2 gap-4">
            <label class="relative">
              <input
                type="radio"
                formControlName="transferType"
                value="momo"
                class="peer sr-only"
                (change)="$service.onTransferTypeChange()"
              />
              <div
                class="p-4 border-2 rounded-xl cursor-pointer flex items-center gap-3 peer-checked:border-blue-500 peer-checked:bg-blue-50 hover:border-blue-200"
              >
                <div
                  class="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600"
                >
                  <i class="material-icons">smartphone</i>
                </div>
                <span class="font-medium text-gray-700">Mobile Money</span>
              </div>
            </label>
            <label class="relative">
              <input
                type="radio"
                formControlName="transferType"
                value="bank"
                class="peer sr-only"
                (change)="$service.onTransferTypeChange()"
              />
              <div
                class="p-4 border-2 rounded-xl cursor-pointer flex items-center gap-3 peer-checked:border-blue-500 peer-checked:bg-blue-50 hover:border-blue-200"
              >
                <div
                  class="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600"
                >
                  <i class="material-icons">account_balance</i>
                </div>
                <span class="font-medium text-gray-700">Bank Transfer</span>
              </div>
            </label>
          </div>
        </div>

        <!-- Network/Bank Selection -->
        <div class="space-y-6">
          <ng-container
            *ngIf="$service.sendMoneyForm.get('transferType')?.value === 'momo'"
          >
            <div class="form-group">
              <label class="block text-sm font-semibold text-gray-700 mb-2"
                >Network Provider</label
              >
              <div class="relative">
                <select
                  formControlName="account_issuer"
                  class="w-full bg-gray-50 border-2 border-gray-200 rounded-xl px-4 h-14 appearance-none focus:outline-none focus:border-blue-500 focus:bg-white transition-colors"
                >
                  <option value="">Select Provider</option>
                  <option value="mtn" class="py-2">MTN Mobile Money</option>
                  <option value="vodafone" class="py-2">Vodafone Cash</option>
                  <option value="airteltigo" class="py-2">
                    AirtelTigo Money
                  </option>
                </select>
                <i class="material-icons absolute right-4 top-4 text-gray-400"
                  >expand_more</i
                >
              </div>
              <p
                class="mt-2 text-sm text-red-500"
                *ngIf="$service.sendMoneyForm.get('account_issuer')?.touched && $service.sendMoneyForm.get('account_issuer')?.errors?.['required']"
              >
                Please select a provider
              </p>
            </div>
          </ng-container>

          <ng-container
            *ngIf="$service.sendMoneyForm.get('transferType')?.value === 'bank'"
          >
            <div class="form-group">
              <label class="block text-sm font-semibold text-gray-700 mb-2"
                >Select Bank</label
              >
              <div class="relative">
                <select
                  formControlName="account_issuer"
                  class="w-full bg-gray-50 border-2 border-gray-200 rounded-xl px-4 h-14 appearance-none focus:outline-none focus:border-blue-500 focus:bg-white transition-colors"
                >
                  <option value="">Select Bank</option>
                  <option
                    *ngFor="let bank of $service.banks"
                    [value]="bank.BankCode"
                    class="py-2"
                  >
                    {{ bank.BankName }}
                  </option>
                </select>
                <i class="material-icons absolute right-4 top-4 text-gray-400"
                  >expand_more</i
                >
              </div>
              <p
                class="mt-2 text-sm text-red-500"
                *ngIf="$service.sendMoneyForm.get('account_issuer')?.touched && $service.sendMoneyForm.get('account_issuer')?.errors?.['required']"
              >
                Please select a bank
              </p>
            </div>
          </ng-container>

          <!-- Account Details Section -->
          <div class="bg-gray-50 p-6 rounded-xl space-y-6">
            <div class="form-group">
              <label class="block text-sm font-semibold text-gray-700 mb-2"
                >Account Number</label
              >
              <div class="flex gap-3">
                <input
                  type="text"
                  formControlName="account_number"
                  class="flex-1 h-14 px-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500"
                  placeholder="Enter account number"
                />
                <button
                  type="button"
                  [disabled]="
                    !$service.canVerify || $service.isVerifyingAccount
                  "
                  (click)="$service.verifyAccount()"
                  class="px-6 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 min-w-[120px] justify-center h-14"
                >
                  <ng-container *ngIf="!$service.isVerifyingAccount">
                    <i class="material-icons text-sm">verified</i>
                    Verify
                  </ng-container>
                  <ng-container *ngIf="$service.isVerifyingAccount">
                    <div
                      class="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"
                    ></div>
                    Verifying...
                  </ng-container>
                </button>
              </div>
              <p
                class="mt-2 text-sm text-red-500"
                *ngIf="$service.sendMoneyForm.get('account_number')?.touched && $service.sendMoneyForm.get('account_number')?.errors?.['required']"
              >
                Account number is required
              </p>
            </div>

            <div class="form-group">
              <label class="block text-sm font-semibold text-gray-700 mb-2"
                >Account Name</label
              >
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

          <!-- Amount and Description -->
          <div class="form-group">
            <label class="block text-sm font-semibold text-gray-700 mb-2"
              >Amount (GHS)</label
            >
            <div class="relative">
              <span class="absolute left-4 top-4 text-gray-500">GHS</span>
              <input
                type="number"
                formControlName="amount"
                min="1"
                class="w-full h-14 pl-14 pr-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500"
                placeholder="0.00"
              />
            </div>
            <p
              class="mt-2 text-sm text-red-500"
              *ngIf="$service.sendMoneyForm.get('amount')?.touched && $service.sendMoneyForm.get('amount')?.errors?.['required']"
            >
              Amount is required
            </p>
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
              *ngIf="$service.sendMoneyForm.get('description')?.touched && $service.sendMoneyForm.get('description')?.errors?.['required']"
            >
              Description is required
            </p>
          </div>

          <!-- OTP Section -->
          <ng-container *ngIf="$service.showOtpSection">
            <div
              class="bg-blue-50 p-6 rounded-xl space-y-3 border-2 border-blue-100"
            >
              <label class="block text-sm font-semibold text-gray-700"
                >Enter OTP</label
              >
              <div class="flex gap-3">
                <input
                  type="text"
                  formControlName="otp"
                  maxlength="5"
                  class="flex-1 h-14 px-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500"
                  placeholder="Enter OTP code"
                />
                <button
                  type="button"
                  (click)="$service.resendOtp()"
                  class="px-6 text-blue-600 hover:bg-blue-100 rounded-xl transition-colors"
                >
                  Resend OTP
                </button>
              </div>
            </div>
          </ng-container>
        </div>

        <!-- Action Buttons -->
        <div class="mt-8 flex justify-end gap-4">
          <button
            type="button"
            *ngIf="!$service.showOtpSection && $service.isAccountVerified"
            (click)="$service.requestOtp()"
            [disabled]="$service.isSendingOtp"
            class="h-14 px-8 bg-gray-800 text-white rounded-xl hover:bg-gray-900 flex items-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed min-w-[160px] justify-center"
          >
            <ng-container *ngIf="!$service.isSendingOtp">
              <i class="material-icons text-sm">sms</i>
              Request OTP
            </ng-container>
            <ng-container *ngIf="$service.isSendingOtp">
              <div
                class="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"
              ></div>
              Sending...
            </ng-container>
          </button>

          <button
            type="submit"
            *ngIf="$service.showOtpSection"
            [disabled]="!$service.sendMoneyForm.valid || $service.isSubmitting"
            class="h-14 px-8 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <i class="material-icons text-sm">send</i>
            {{ $service.isSubmitting ? 'Processing...' : 'Send Money' }}
          </button>
        </div>
      </form>
    </div>
  `,
})
export class SendFiatComponent implements OnInit {
  constructor(public $service: TransferMoneyService) {}

  ngOnInit() {}
}
