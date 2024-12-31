import { CommonModule } from "@angular/common";
import { Component, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from "@angular/forms";
import { Store } from "@ngxs/store";
import { MoneyTransferService } from "./money-transfer.service";
import { Bank } from "./money-transfer.types";

@Component({
  selector: 'app-money-transfer',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './money-transfer.component.html',
  styleUrls: ['./money-transfer.component.scss']
})
export class MoneyTransferComponent implements OnInit {
  activeTab: 'send' | 'fund' = 'send';
  banks: Bank[] = [];
  sendMoneyForm!: FormGroup;
  fundWalletForm!: FormGroup;
  isAccountVerified = false;
  showOtpSection = false;
  showFundWalletOtp = false;
  isSubmitting = false;
  showSuccessModal = false;
  showErrorModal = false;
  successMessage = '';
  errorMessage = '';
  isVerifyingAccount = false;

  constructor(
    private fb: FormBuilder,
    private store: Store,
    private moneyTransferService: MoneyTransferService
  ) {
    this.initializeForms();
  }

  private initializeForms() {
    this.sendMoneyForm = this.fb.group({
      transferType: ['momo', Validators.required],
      account_issuer: ['', Validators.required],
      account_number: ['', [Validators.required]],
      account_name: ['', Validators.required],
      amount: ['', [Validators.required, Validators.min(1)]],
      description: ['', Validators.required],
      otp: ['']
    });

    this.fundWalletForm = this.fb.group({
      account_issuer: ['mtn', Validators.required],
      account_number: ['', [Validators.required, Validators.minLength(10)]],
      amount: ['', [Validators.required, Validators.min(1)]],
      otp: ['']
    });
  }

  ngOnInit() {
    if (this.activeTab === 'send') {
      this.fetchBanks();
    }
  }

  async fetchBanks() {
    try {
      const response = await this.moneyTransferService.getBanks();
      if (response?.success) {
        this.banks = response.data;
      }
    } catch (error) {
      this.showError('Failed to fetch banks. Please try again.');
    }
  }

  switchTab(tab: 'send' | 'fund') {
    this.activeTab = tab;
    this.resetForms();
    if (tab === 'send') {
      this.fetchBanks();
    }
  }

  resetForms() {
    this.sendMoneyForm.reset({ transferType: 'momo' });
    this.fundWalletForm.reset({ account_issuer: 'mtn' });
    this.isAccountVerified = false;
    this.showOtpSection = false;
    this.showFundWalletOtp = false;
  }

  onTransferTypeChange() {
    const transferType = this.sendMoneyForm.get('transferType')?.value;
    this.sendMoneyForm.patchValue({
      account_issuer: '',
      account_number: '',
      account_name: ''
    });
    this.isAccountVerified = false;
    this.showOtpSection = false;
  }

  get canVerify(): boolean {
    const form = this.sendMoneyForm;
    return form.get('account_number')!.valid && form.get('account_issuer')!.valid;
  }

  async verifyAccount() {
    const form = this.sendMoneyForm;
    const number = form.get('account_number')?.value;
    const bankCode = form.get('account_issuer')?.value;
    const accountType = form.get('transferType')?.value;
    this.isVerifyingAccount = true;
    try {
      const response = await this.moneyTransferService.verifyAccount(number, bankCode, accountType);
      if (response?.success && response.data.success) {
        this.isVerifyingAccount = true;
        form.patchValue({ account_name: response.data.data });
        this.isAccountVerified = true;

      } else {

        this.showError('Account verification failed. Please check the details and try again.');
      }
    } catch (error) {

      this.showError('Failed to verify account. Please try again.');
    }  finally {
      this.isVerifyingAccount = false; // Stop the loader
    }
  }

  async requestOtp() {
    const userEmail = this.store.selectSnapshot(state => state.auth.user?.email);
    const userPhone = this.store.selectSnapshot(state => state.auth.user?.phone);

    try {
      const response = await this.moneyTransferService.sendOtp(userEmail, userPhone);
      if (response?.success) {
        this.showOtpSection = true;
      } else {
        this.showError('Failed to send OTP. Please try again.');
      }
    } catch (error) {
      this.showError('Failed to send OTP. Please try again.');
    }
  }

  async resendOtp() {
    await this.requestOtp();
  }

  async onSendMoney() {
    if (!this.sendMoneyForm.valid) return;

    this.isSubmitting = true;
    const form = this.sendMoneyForm.value;
    const userId = this.store.selectSnapshot(state => state.auth.user?.merchantId._id);
    const initateId = this.store.selectSnapshot(state => state.auth.user?._id);
    try {
      const payload = {
        account_issuer: form.account_issuer,
        account_name: form.account_name,
        account_number: form.account_number,
        account_type: form.transferType,
        amount: form.amount.toString(),
        customerId: userId,
        customerType: 'merchants',
        description: form.description,
        initiatedBy: initateId,
        otp: form.otp,
        serviceName: 'banktrf'
      };

      const response = await this.moneyTransferService.sendMoney(payload);
      if (response?.success) {
        this.showSuccess('Money sent successfully!');
        this.resetForms();
      } else {
        this.showError(response?.message || 'Failed to send money. Please try again.');
      }
    } catch (error: any) {
      this.showError(error?.error?.message || 'Failed to send money. Please try again.');
    } finally {
      this.isSubmitting = false;
    }
  }

  async requestFundWalletOtp() {
    const userEmail = this.store.selectSnapshot(state => state.auth.user?.email);
    const userPhone = this.fundWalletForm.get('account_number')?.value;

    try {
      const response = await this.moneyTransferService.sendOtp(userEmail, userPhone);
      if (response?.success) {
        this.showFundWalletOtp = true;
      } else {
        this.showError('Failed to send OTP. Please try again.');
      }
    } catch (error) {
      this.showError('Failed to send OTP. Please try again.');
    }
  }

  async resendFundWalletOtp() {
    await this.requestFundWalletOtp();
  }

  async onFundWallet() {
    if (!this.fundWalletForm.valid) return;

    this.isSubmitting = true;
    const form = this.fundWalletForm.value;
    const userId = this.store.selectSnapshot(state => state.auth.user?.merchantId._id);

    try {
      const payload = {
        account_issuer: form.account_issuer,
        account_number: form.account_number,
        amount: form.amount.toString(),
        customerId: userId,
        customerType: 'merchants',
        otp: form.otp
      };

      const response = await this.moneyTransferService.fundWallet(payload);
      if (response?.success) {
        this.showSuccess('Wallet funded successfully!');
        this.resetForms();
      } else {
        this.showError(response?.message || 'Failed to fund wallet. Please try again.');
      }
    } catch (error: any) {
      this.showError(error?.error?.message || 'Failed to fund wallet. Please try again.');
    } finally {
      this.isSubmitting = false;
    }
  }

  showError(message: string) {
    this.errorMessage = message;
    this.showErrorModal = true;
  }

  showSuccess(message: string) {
    this.successMessage = message;
    this.showSuccessModal = true;
  }

  closeErrorModal() {
    this.showErrorModal = false;
    this.errorMessage = '';
  }

  closeSuccessModal() {
    this.showSuccessModal = false;
    this.successMessage = '';
  }
}