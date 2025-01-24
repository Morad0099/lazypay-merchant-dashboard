import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="p-6">
      <h2 class="text-lg font-semibold mb-4">
        Withdraw from {{ wallet.walletType }} Wallet
      </h2>
      <div class="mb-4 p-3 bg-gray-50 rounded-md">
        <div class="text-sm text-gray-500">Available Balance</div>
        <div class="text-lg font-semibold">
          {{ formatCurrency(wallet.confirmedBalance, wallet.currency) }}
        </div>
      </div>

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
              [max]="wallet.confirmedBalance"
              class="pl-7 block w-full rounded-md border-gray-300 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>
        </div>

        <button
          type="submit"
          [disabled]="amount > wallet.confirmedBalance"
          [class]="
            'w-full py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 ' +
            (amount > wallet.confirmedBalance
              ? 'bg-gray-300 cursor-not-allowed'
              : 'bg-blue-500 hover:bg-blue-600 text-white')
          "
        >
          Confirm Withdrawal
        </button>
      </form>
    </div>
  `,
})
export class WithdrawComponent {
  wallet: any;
  amount: number = 0;

  formatCurrency(amount: number, currency: string): string {
    // Same as wallet component
    return '';
  }

  getCurrencySymbol(type: string): string {
    // Same as wallet component
    return '';
  }

  onSubmit() {
    if (this.amount > this.wallet.confirmedBalance) return;
    console.log(
      'Withdraw:',
      this.amount,
      'from wallet:',
      this.wallet.accountNumber
    );
    // Handle withdrawal logic
  }
}
