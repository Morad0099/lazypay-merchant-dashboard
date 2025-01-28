import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { TransferMoneyService } from './transfer-money.service';

@Component({
  selector: 'buy-cryto',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
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

        <!-- Submit Button -->
        <div class="mt-8">
          <button
            type="submit"
            [disabled]="!$service.cryptoForm.valid || $service.isSubmitting"
            class="w-full h-14 bg-purple-600 text-white rounded-xl hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <i class="material-icons text-sm">send</i>
            {{ $service.isSubmitting ? 'Processing...' : 'Send Crypto' }}
          </button>
        </div>
      </form>
    </div>
  `,
})
export class SendCryptoComponent implements OnInit {
  constructor(public $service: TransferMoneyService) {}

  ngOnInit() {}
}
