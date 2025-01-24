import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="p-6">
      <h2 class="text-lg font-semibold mb-4">
        Deposit to {{ wallet.walletType }} Wallet
      </h2>
      <form (ngSubmit)="onSubmit()" class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700">Amount</label>
          <div class="mt-1 relative rounded-md shadow-sm">
            <div
              class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"
            >
              <span class="text-gray-500">{{
                getCurrencySymbol(wallet.walletType)
              }}</span>
            </div>
            <input
              type="number"
              [(ngModel)]="amount"
              name="amount"
              class="pl-7 block w-full rounded-md border-gray-300 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>
        </div>

        <button
          type="submit"
          class="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Confirm Deposit
        </button>
      </form>
    </div>
  `,
})
export class DepositComponent {
  wallet: any;
  amount: number = 0;

  getCurrencySymbol(type: string): string {
    // Same as wallet component
    return '';
  }

  onSubmit() {
    console.log(
      'Deposit:',
      this.amount,
      'to wallet:',
      this.wallet.accountNumber
    );
    // Handle deposit logic
  }
}
