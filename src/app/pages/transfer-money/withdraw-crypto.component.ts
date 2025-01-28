import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { TransferMoneyService } from './transfer-money.service';
import { ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'withraw-crypto',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <!-- Withdraw Tab -->
    <div class="bg-white rounded-xl shadow-sm">
      <div
        class="p-4 bg-gradient-to-r from-green-600 to-green-700 rounded-t-xl"
      >
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

      <form
        [formGroup]="$service.withdrawForm"
        (ngSubmit)="$service.onWithdraw()"
        class="p-4"
      >
        <div class="space-y-6">
          <!-- Crypto Balance -->
          <div class="bg-gray-50 p-6 rounded-xl space-y-4">
            <div class="flex justify-between items-center">
              <div class="flex items-center gap-2">
                <img src="/assets/images/usdt.svg" alt="USDT" class="w-6 h-6" />
                <span class="text-sm font-medium text-gray-600"
                  >USDT Balance</span
                >
              </div>
              <div class="text-right">
                <div class="text-lg font-semibold">
                  {{ $service.withdrawalBalance.usdt.cryptoBalance | currency }}
                  USDT
                </div>
                <div class="text-sm text-gray-500">
                  ≈
                  {{
                    $service.withdrawalBalance.usdt.availableBalance | currency
                  }}
                </div>
              </div>
            </div>

            <div class="flex justify-between items-center">
              <div class="flex items-center gap-2">
                <img src="/assets/icons/btc.svg" alt="BTC" class="w-6 h-6" />
                <span class="text-sm font-medium text-gray-600"
                  >BTC Balance</span
                >
              </div>
              <div class="text-right">
                <div class="text-lg font-semibold">
                  {{ $service.withdrawalBalance.btc.cryptoBalance }} BTC
                </div>
                <div class="text-sm text-gray-500">
                  ≈
                  {{
                    $service.withdrawalBalance.btc.availableBalance | currency
                  }}
                </div>
              </div>
            </div>
          </div>

          <!-- Withdrawal Method -->
          <div class="form-group">
            <label class="block text-sm font-semibold text-gray-700 mb-3"
              >Withdrawal Method</label
            >
            <div class="grid grid-cols-2 gap-4">
              <label class="relative">
                <input
                  type="radio"
                  formControlName="withdrawalMethod"
                  value="bank"
                  class="peer sr-only"
                />
                <div
                  class="p-4 border-2 rounded-xl cursor-pointer flex items-center gap-3 peer-checked:border-green-500 peer-checked:bg-green-50"
                >
                  <div
                    class="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600"
                  >
                    <i class="material-icons">account_balance</i>
                  </div>
                  <span class="font-medium text-gray-700">Bank Transfer</span>
                </div>
              </label>
              <label class="relative">
                <input
                  type="radio"
                  formControlName="withdrawalMethod"
                  value="momo"
                  class="peer sr-only"
                />
                <div
                  class="p-4 border-2 rounded-xl cursor-pointer flex items-center gap-3 peer-checked:border-green-500 peer-checked:bg-green-50"
                >
                  <div
                    class="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600"
                  >
                    <i class="material-icons">smartphone</i>
                  </div>
                  <span class="font-medium text-gray-700">Mobile Money</span>
                </div>
              </label>
            </div>
          </div>

          <!-- Crypto Selection -->
          <div class="form-group">
            <label class="block text-sm font-semibold text-gray-700 mb-2"
              >Select Crypto to Withdraw</label
            >
            <div class="relative">
              <select
                formControlName="cryptoType"
                class="w-full bg-gray-50 border-2 border-gray-200 rounded-xl px-4 h-14 appearance-none focus:outline-none focus:border-green-500"
              >
                <option value="usdt">USDT</option>
                <option value="btc">Bitcoin (BTC)</option>
              </select>
              <i class="material-icons absolute right-4 top-4 text-gray-400"
                >expand_more</i
              >
            </div>
          </div>

          <!-- Amount -->
          <div class="form-group">
            <label class="block text-sm font-semibold text-gray-700 mb-2"
              >Amount to Withdraw</label
            >
            <div class="relative">
              <span class="absolute left-4 top-4 text-gray-500"> USD </span>
              <input
                type="number"
                formControlName="amount"
                class="w-full h-14 pl-16 pr-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-green-500"
                placeholder="0.00"
              />
            </div>
          </div>

          <!-- Withdrawal Details -->
          <div class="bg-gray-50 p-6 rounded-xl space-y-4">
            <div class="flex justify-between items-center">
              <span class="text-sm text-gray-600">Platform Fee</span>
              <span class="text-sm font-medium">{{
                $service.withdrawCryptoDetails.platformTransactionFee | currency
              }}</span>
            </div>
            <div class="flex justify-between items-center">
              <span class="text-sm text-gray-600">Total Amount</span>
              <span class="text-sm font-medium">{{
                $service.withdrawCryptoDetails.totalAmount | currency
              }}</span>
            </div>
            <div class="flex justify-between items-center">
              <span class="text-sm text-gray-600">Crypto Amount</span>
              <span class="text-sm font-medium">{{
                $service.withdrawCryptoDetails.cryptoAmount
              }}</span>
            </div>
            <div class="flex justify-between items-center">
              <span class="text-sm text-gray-600">You'll Receive (GHS)</span>
              <span class="text-lg font-semibold">{{
                $service.withdrawCryptoDetails.amountToRecieve
                  | currency : 'GHS'
              }}</span>
            </div>
          </div>
        </div>

        <!-- Submit Button -->
        <div class="mt-8">
          <button
            type="submit"
            [disabled]="!$service.withdrawForm.valid || $service.isSubmitting"
            class="w-full h-14 bg-green-600 text-white rounded-xl hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <i class="material-icons text-sm">account_balance_wallet</i>
            {{ $service.isSubmitting ? 'Processing...' : 'Withdraw Funds' }}
          </button>
        </div>
      </form>
    </div>
  `,
})
export class WithdrawCryptoComponent implements OnInit {
  constructor(public $service: TransferMoneyService) {}

  ngOnInit() {}
}
