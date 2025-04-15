import { Injectable, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Store } from '@ngxs/store';
import { MoneyTransferService } from './money-transfer.service';
import {
  Bank,
  SendCryptoDetails,
  SendMoneyPayload,
  WithdrawCryptoDetails,
} from './money-transfer.types';
import {
  catchError,
  combineLatest,
  debounceTime,
  distinctUntilChanged,
  EMPTY,
  filter,
  interval,
  map,
  Observable,
  Subject,
  Subscription,
  switchMap,
  take,
  takeUntil,
  takeWhile,
  throwError,
} from 'rxjs';
import { AuthState } from '../../state/apps/app.states';
import { HttpClient } from '@angular/common/http';
import API from '../../constants/api.constant';

type Tab = 'send' | 'fund' | 'withdraw' | 'crypto' | 'deposit';

// In transfer-money.service.ts
interface DepositStatus {
  status: 'pending' | 'confirmed' | 'completed';
  confirmations?: number;
  requiredConfirmations?: number;
}

@Injectable({ providedIn: 'root' })
export class TransferMoneyService implements OnDestroy {
  activeTab: Tab = 'send';
  banks: Bank[] = [];

  sendMoneyForm!: FormGroup;
  fundWalletForm!: FormGroup;
  cryptoForm!: FormGroup;
  withdrawForm!: FormGroup;
  depositForm!: FormGroup;

  usdtBalance = 1000.5;
  btcBalance = 0.025;

  isAccountVerified = false;
  showOtpSection = false;
  showFundWalletOtp = false;
  isSubmitting = false;
  showSuccessModal = false;
  showErrorModal = false;
  successMessage = '';
  errorMessage = '';
  isVerifyingAccount = false;
  isSendingOtp: boolean = false;
  public stopPolling$ = new Subject<void>();

  walletGenerated = false;
  isGenerating = false;
  walletAddress: string = '';

  sendCryptoDetails: SendCryptoDetails = {
    platformTransactionFee: '1%',
    cryptoAmount: '0',
    networkFee: 0,
    totalAmount: 0,
    transactionCharge: 0,
  };

  withdrawCryptoDetails: WithdrawCryptoDetails = {
    amountToRecieve: 0,
    cryptoAmount: '0',
    platformTransactionFee: '0',
    totalAmount: 0,
  };

  // Deposit response
  depositResponse: any = {};

  // Withdrawal balance
  withdrawalBalance = {
    usdt: {
      availableBalance: 0,
      cryptoBalance: 0,
    },
    btc: {
      availableBalance: 0,
      cryptoBalance: 0,
    },
  };

  private cryptoform$!: Subscription;
  private withdrawform$!: Subscription;

  // Payment tracking
  private timerSubscription: Subscription | null = null;
  private trackingSubscription: Subscription | null = null;
  private destroy$ = new Subject<void>();

  // In TransferMoneyService
  transactionStatus: number = 0; // 0-4 representing different stages
  transactionHash: string = '';
  confirmations: number = 0;
  requiredConfirmations: number = 6; // Adjust based on crypto type
  expectedCryptoAmount: string = '0';
  networkFee: string = '0';
  paymentTimer: string = '30:00';

  constructor(
    private fb: FormBuilder,
    private store: Store,
    private moneyTransferService: MoneyTransferService,
    private http: HttpClient
  ) {
    // this.initializeForms();
    this.activeTab = 'send'; // Set default tab
    this.initializeForms();
    this.fetchBanks();
  }

  private initializeForms() {
    this.sendMoneyForm = this.fb.group({
      transferType: ['momo', Validators.required],
      account_issuer: ['', Validators.required],
      account_number: ['', [Validators.required]],
      account_name: ['', Validators.required],
      amount: ['', [Validators.required, Validators.min(1)]],
      description: ['', Validators.required],
      otp: [''],
      serviceType: ['GIP'],
      // cryptoType: [''],
    });

    this.fundWalletForm = this.fb.group({
      account_issuer: ['mtn', Validators.required],
      account_number: ['', [Validators.required, Validators.minLength(10)]],
      amount: ['', [Validators.required, Validators.min(1)]],
      otp: [''],
    });

    this.cryptoForm = this.fb.group({
      cryptoType: ['usdt', Validators.required],
      walletAddress: ['', [Validators.required, Validators.minLength(26)]],
      amount: ['', [Validators.required, Validators.min(10)]],
      accountName: ['', Validators.required],
      description: ['', Validators.required],
      otp: ['']
    });

    this.withdrawForm = this.fb.group({
      withdrawalMethod: ['bank', Validators.required],
      cryptoType: ['usdt', Validators.required],
      account_issuer: ['', Validators.required],
      account_number: ['', [Validators.required, Validators.minLength(10)]],
      account_name: ['', Validators.required],
      amount: ['', [Validators.required, Validators.min(1)]],
      description: ['', Validators.required],
      otp: ['']
    });

    this.depositForm = this.fb.group({
      cryptoType: ['usdt', Validators.required],
      network: ['trc20', Validators.required],
      amount: ['', Validators.required],
    });

    this.depositForm = this.fb.group({
      cryptoType: ['usdt', Validators.required],
      network: ['trc20', Validators.required],
      amount: ['', Validators.required],
      walletAddress: ['', []],
    });

    this.cryptoform$ =
      combineLatest([
        this.cryptoForm.get('amount')?.valueChanges ?? EMPTY,
        this.cryptoForm.get('cryptoType')?.valueChanges ?? EMPTY,
      ])
        .pipe(
          filter(([amount]) => amount !== null),
          debounceTime(200),
          distinctUntilChanged(),
          map(([amount]) => amount)
        )
        .subscribe({
          next: (value) => {
            const amount = Number(value);
            if (amount >= 10) {
              this.moneyTransferService
                .calculateCryptoSend({
                  cryptoType: this.cryptoForm.get('cryptoType')?.value ?? 'btc',
                  amount: value,
                })
                .subscribe({
                  next: (data) => (this.sendCryptoDetails = data),
                  error: (err) =>
                    console.error('Failed to calculate crypto send:', err),
                });
            }
          },
          error: (err) => console.error('Form value change error:', err),
        }) ?? new Subscription();

    this.withdrawform$ =
      combineLatest([
        this.withdrawForm.get('amount')?.valueChanges ?? EMPTY,
        this.withdrawForm.get('withdrawalMethod')?.valueChanges ?? EMPTY,
        this.withdrawForm.get('cryptoType')?.valueChanges ?? EMPTY, // Add cryptoType here
      ])
        .pipe(
          filter(
            ([amount, withdrawalMethod]) =>
              amount !== null && withdrawalMethod !== null
          ),
          debounceTime(200),
          distinctUntilChanged(),
          map(([amount, method, cryptoType]) => ({
            amount,
            method,
            cryptoType,
          }))
        )
        .subscribe({
          next: ({ amount: value, method, cryptoType }) => {
            const amount = Number(value);
            if (amount >= 10) {
              this.moneyTransferService
                .calculateCryptoWithdrawal({
                  cryptoType: cryptoType ?? 'btc',
                  accountType: method === 'bank' ? 'banktrfnrt' : 'momo',
                  amount,
                })
                .subscribe({
                  next: (data) => {
                    this.withdrawCryptoDetails = data;
                  },
                  error: (err) =>
                    console.error('Failed to calculate withdrawal:', err),
                });
            }
          },
          error: (err) => console.error('Form value change error:', err),
        }) ?? new Subscription();
  }

  private paymentTimerSubscription: Subscription | undefined;

// startPaymentTimer() {
//   // Example: Start a 10-minute timer
//   const timerDuration = 600; // 10 minutes in seconds
//   this.paymentTimer = this.formatTime(timerDuration);

//   this.paymentTimerSubscription = interval(1000).subscribe(() => {
//     timerDuration--;
//     this.paymentTimer = this.formatTime(timerDuration);

//     if (timerDuration <= 0) {
//       this.stopPaymentTimer();
//       this.transactionStatus = -1; // Mark as expired
//     }
//   });
// }

stopPaymentTimer() {
  if (this.paymentTimerSubscription) {
    this.paymentTimerSubscription.unsubscribe();
    this.paymentTimerSubscription = undefined;
  }
}

private formatTime(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${minutes}:${secs < 10 ? '0' : ''}${secs}`;
}

  getDepositAddress(): string {
    const type = this.depositForm.get('cryptoType')?.value;
    const network = this.depositForm.get('network')?.value;
    return type === 'btc'
      ? 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh'
      : 'TEpnJcLDRbkwq5oQpjVBWn8GjTNi4BhYNA';
  }

  getMinDeposit(): string {
    return this.depositForm.get('cryptoType')?.value === 'btc'
      ? '0.001 BTC'
      : '50 USDT';
  }

  getProcessingTime(): string {
    const type = this.depositForm.get('cryptoType')?.value;
    const network = this.depositForm.get('network')?.value;
    return type === 'btc'
      ? '1 block confirmation'
      : network === 'trc20'
      ? '1-5 minutes'
      : '10-30 minutes';
  }

  copyAddress(address: string): void {
    navigator.clipboard.writeText(address);
    // Show success toast
  }

  setActiveTab(tab: Tab) {
    this.activeTab = tab;
    this.resetForms();
    if (tab === 'send') {
      this.fetchBanks();
    }
    if (tab === 'withdraw') {
      this.fetchWallets();
    }
  }

  ngOnInit() {
    if (this.activeTab === 'send') {
      this.fetchBanks();
    }
    if (this.activeTab === 'withdraw') {
      this.fetchWallets();
    }
  }

  fetchWallets(): void {
    const user = this.store.selectSnapshot(AuthState.user);
    const merchantId = user.merchantId?._id;
    this.moneyTransferService.fetchWallets(merchantId).subscribe({
      next: (data) => {
        const btcWallet = data.find((d: any) => d.walletType === 'BTC');
        const usdtWallet = data.find((d: any) => d.walletType === 'USDT');
        this.withdrawalBalance['usdt'] = usdtWallet;
        this.withdrawalBalance['btc'] = btcWallet;
      },
      error: (err) => {
        console.log(err);
      },
    });
  }

  ngOnDestroys() {
    this.stopPolling$.next(); // Stop polling when the component is destroyed
    this.stopPolling$.complete();
  }

  private setupWithdrawFormSubscriptions() {
    // Monitor form changes for real-time calculations
    this.withdrawform$ = combineLatest([
      this.withdrawForm.get('amount')?.valueChanges ?? EMPTY,
      this.withdrawForm.get('withdrawalMethod')?.valueChanges ?? EMPTY,
      this.withdrawForm.get('cryptoType')?.valueChanges ?? EMPTY,
    ]).pipe(
      filter(([amount, method, type]) => 
        amount !== null && method !== null && type !== null
      ),
      debounceTime(300),
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    ).subscribe({
      next: ([amount, method, cryptoType]) => {
        if (amount >= 10) {
          this.calculateWithdrawalDetails(amount, method, cryptoType);
        }
      }
    });
  }


  private calculateWithdrawalDetails(amount: number, method: string, cryptoType: any) {
    this.moneyTransferService.calculateCryptoWithdrawal({
      cryptoType,
      accountType: method === 'bank' ? 'banktrfnrt' : 'momo',
      amount
    }).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (data) => {
        this.withdrawCryptoDetails = data;
      },
      error: (err) => {
        console.error('Failed to calculate withdrawal:', err);
      }
    });
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

  resetForms() {
    this.sendMoneyForm.reset({ transferType: 'momo', serviceType: 'GIP', });
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
      account_name: '',
    });
    this.isAccountVerified = false;
    this.showOtpSection = false;
    if (transferType === 'bank') {
      this.sendMoneyForm.get('serviceType')?.setValue('GIP');
    }
  }

  get canVerify(): boolean {
    if (this.activeTab === 'send') {
      const form = this.sendMoneyForm;
      return form.get('account_number')!.valid && form.get('account_issuer')!.valid;
    } else if (this.activeTab === 'withdraw') {
      const form = this.withdrawForm;
      return form.get('account_number')!.valid && form.get('account_issuer')!.valid;
    }
    return false;
  }

  async verifyAccount() {
    if (this.activeTab == 'send') {
      const form = this.sendMoneyForm;
    const number = form.get('account_number')?.value;
    const bankCode = form.get('account_issuer')?.value;
    const accountType = form.get('transferType')?.value;
    this.isVerifyingAccount = true;
    try {
      const response = await this.moneyTransferService.verifyAccount(
        number,
        bankCode,
        accountType
      );
      if (response?.success && response.data.success) {
        this.isVerifyingAccount = true;
        form.patchValue({ account_name: response.data.data });
        this.isAccountVerified = true;
      } else {
        this.showError(
          'Account verification failed. Please check the details and try again.'
        );
      }
    } catch (error) {
      this.showError('Failed to verify account. Please try again.');
    } finally {
      this.isVerifyingAccount = false; // Stop the loader
    }
    } else if (this.activeTab == 'withdraw') {
      const form = this.withdrawForm;
    const number = form.get('account_number')?.value;
    const bankCode = form.get('account_issuer')?.value;
    const accountType = form.get('withdrawalMethod')?.value;
    this.isVerifyingAccount = true;
    try {
      const response = await this.moneyTransferService.verifyAccount(
        number,
        bankCode,
        accountType
      );
      if (response?.success && response.data.success) {
        this.isVerifyingAccount = true;
        form.patchValue({ account_name: response.data.data });
        this.isAccountVerified = true;
      } else {
        this.showError(
          'Account verification failed. Please check the details and try again.'
        );
      }
    } catch (error) {
      this.showError('Failed to verify account. Please try again.');
    } finally {
      this.isVerifyingAccount = false; // Stop the loader
    }
      
    }
    
  }

  async requestOtp() {
    if (this.isSendingOtp) return;
  
    const userEmail = this.store.selectSnapshot((state) => state.auth.user?.email);
    const userPhone = this.store.selectSnapshot((state) => state.auth.user?.phone);
  
    try {
      this.isSendingOtp = true;
      const response = await this.moneyTransferService.sendOtp(userEmail, userPhone);
      
      if (response?.success) {
        this.showOtpSection = true;
        this.showSuccess('OTP sent successfully');
      } else {
        this.showError('Failed to send OTP. Please try again.');
      }
    } catch (error) {
      this.showError('Failed to send OTP. Please try again.');
    } finally {
      this.isSendingOtp = false;
    }
  }

  async resendOtp() {
    await this.requestOtp();
  }

  async processWithdrawal() {
    if (!this.sendMoneyForm.valid) return;
    this.isSubmitting = true;
  
    try {
      const payload = this.buildWithdrawPayload();
      const response = await this.moneyTransferService.sendMoney(payload);
  
      if (response?.success) {
        this.showSuccess('Withdrawal initiated successfully!');
        this.transactionStatus = 1;
        this.startPaymentTimer();
        this.initializeTransactionTracking(response.transactionId);
      } else {
        this.showError(response?.message || 'Failed to initiate withdrawal.');
      }
    } catch (error: any) {
      this.showError(error?.message || 'Withdrawal failed. Please try again.');
    } finally {
      this.isSubmitting = false;
    }
  }
  
  private buildWithdrawPayload(): any {
    const user = this.store.selectSnapshot((state) => state.auth.user);
    
    // Get merchantId handling both string and object formats
    let merchantId;
    if (typeof user?.merchantId === 'string') {
      // If merchantId is a string, use it directly
      merchantId = user.merchantId;
      console.log('Merchant ID found (string):', merchantId);
    } else if (user?.merchantId?._id) {
      // If merchantId is an object with _id, use that
      merchantId = user.merchantId._id;
      console.log('Merchant ID found (object):', merchantId);
    }
    const form = this.sendMoneyForm.value;
  
    return {
      merchantId,
      account_type: form.cryptoType,
      transferMethod: form.transferMethod,
      account_issuer: form.account_issuer,
      account_number: form.account_number,
      account_name: form.account_name,
      amount: form.amount.toString(),
      description: form.description,
      otp: form.otp
    };
  }

  async onSendMoney() {
    if (!this.sendMoneyForm.valid) return;

    this.isSubmitting = true;
    const form = this.sendMoneyForm.value;
    // const userId = this.store.selectSnapshot(
    //   (state) => state.auth.user?.merchantId._id
    // );
    const user = this.store.selectSnapshot((state) => state.auth.user);
    
    // Get merchantId handling both string and object formats
    let merchantId;
    if (typeof user?.merchantId === 'string') {
      // If merchantId is a string, use it directly
      merchantId = user.merchantId;
      console.log('Merchant ID found (string):', merchantId);
    } else if (user?.merchantId?._id) {
      // If merchantId is an object with _id, use that
      merchantId = user.merchantId._id;
      console.log('Merchant ID found (object):', merchantId);
    }
    const initateId = this.store.selectSnapshot(
      (state) => state.auth.user?._id
    );
    try {
      const payload: SendMoneyPayload = {
        account_issuer: form.account_issuer,
        account_name: form.account_name,
        account_number: form.account_number,
        account_type: form.transferType,
        amount: form.amount.toString(),
        merchantId,
        description: form.description,
        initiatedBy: initateId,
        otp: form.otp,
      };
  
      // Add serviceType to payload if bank transfer
      if (form.transferType === 'bank') {
        payload.serviceType = form.serviceType;
      }

      const response = await this.moneyTransferService.sendMoney(payload);
      if (response?.success) {
        this.showSuccess('Money sent successfully!');
        this.resetForms();
      } else {
        this.showError(
          response?.message || 'Failed to send money. Please try again.'
        );
      }
    } catch (error: any) {
      this.showError(
        error?.error?.message || 'Failed to send money. Please try again.'
      );
    } finally {
      this.isSubmitting = false;
    }
  }

  async requestFundWalletOtp() {
    const userEmail = this.store.selectSnapshot(
      (state) => state.auth.user?.email
    );
    const userPhone = this.fundWalletForm.get('account_number')?.value;

    try {
      const response = await this.moneyTransferService.sendOtp(
        userEmail,
        userPhone
      );
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
    if (!this.fundWalletForm.valid) {
      return;
    }

    this.isSubmitting = true;
    const form = this.fundWalletForm.value;
    // const userId = this.store.selectSnapshot(
    //   (state) => state.auth.user?.merchantId._id
    // );
    const user = this.store.selectSnapshot((state) => state.auth.user);
    
    // Get merchantId handling both string and object formats
    let merchantId;
    if (typeof user?.merchantId === 'string') {
      // If merchantId is a string, use it directly
      merchantId = user.merchantId;
      console.log('Merchant ID found (string):', merchantId);
    } else if (user?.merchantId?._id) {
      // If merchantId is an object with _id, use that
      merchantId = user.merchantId._id;
      console.log('Merchant ID found (object):', merchantId);
    }

    // if (!merchantId) {
    //   this.error = 'Merchant ID not found';
    //   this.isSubmitting = false;
    //   return;
    // }

    try {
      const payload = {
        account_issuer: form.account_issuer,
        account_number: form.account_number,
        amount: form.amount.toString(),
        merchantId: merchantId,
        // customerType: 'merchants',
        otp: form.otp,
      };

      const response = await this.moneyTransferService.fundWallet(payload);
      if (response?.success) {
        this.showSuccess('Wallet funded successfully!');
        this.resetForms();
      } else {
        this.showError(
          response?.message || 'Failed to fund wallet. Please try again.'
        );
      }
    } catch (error: any) {
      this.showError(
        error?.error?.message || 'Failed to fund wallet. Please try again.'
      );
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

  getNetworkFee(): string {
    const type = this.cryptoForm.get('cryptoType')?.value;
    return type === 'btc' ? '0.0001 BTC' : '1 USDT';
  }

  getTotalAmount(): string {
    const amount = parseFloat(this.cryptoForm.get('amount')?.value || '0');
    const type = this.cryptoForm.get('cryptoType')?.value;
    const fee = type === 'btc' ? 0.0001 : 1;
    return `${(amount + fee).toFixed(
      type === 'btc' ? 8 : 2
    )} ${type.toUpperCase()}`;
  }

  getExchangeRate(): string {
    const type = this.withdrawForm.get('cryptoType')?.value;
    return type === 'btc' ? '1 BTC = GHS 210,000' : '1 USDT = GHS 12.5';
  }

  getLocalAmount(): string {
    const amount = parseFloat(this.withdrawForm.get('amount')?.value || '0');
    const type = this.withdrawForm.get('cryptoType')?.value;
    const rate = type === 'btc' ? 210000 : 12.5;
    return `GHS ${(amount * rate).toFixed(2)}`;
  }

  async onCryptoTransfer() {
    // If OTP is needed but not shown yet, request it
    if (!this.showOtpSection) {
      await this.requestOtp();
      this.showOtpSection = true;
      return;
    }
  
    if (!this.cryptoForm.valid) return;
    this.isSubmitting = true;
  
    try {
      const payload = this.buildSendCryptoPayload();
      const response = await this.moneyTransferService.sendMoney(payload);
  
      if (response?.success) {
        this.showSuccess('Crypto transfer initiated successfully!');
        this.transactionStatus = 1;
        this.startPaymentTimer();
        this.initializeTransactionTracking(response.transactionId);
        this.showOtpSection = false;  // Reset OTP section
      } else {
        this.showError(response?.message || 'Failed to initiate transfer.');
      }
    } catch (error: any) {
      this.showError(error?.message || 'Transfer failed. Please try again.');
    } finally {
      this.isSubmitting = false;
    }
  }
  
  private buildSendCryptoPayload(): any {
    // const user = this.store.selectSnapshot(AuthState.user);
    const user = this.store.selectSnapshot((state) => state.auth.user);
    
    // Get merchantId handling both string and object formats
    let merchantId;
    if (typeof user?.merchantId === 'string') {
      // If merchantId is a string, use it directly
      merchantId = user.merchantId;
      console.log('Merchant ID found (string):', merchantId);
    } else if (user?.merchantId?._id) {
      // If merchantId is an object with _id, use that
      merchantId = user.merchantId._id;
      console.log('Merchant ID found (object):', merchantId);
    }

    // if (!merchantId) {
    //   this.error = 'Merchant ID not found';
    //   this.isSubmitting = false;
    //   return;
    // }
    const { cryptoType, walletAddress, amount, accountName, description, otp } = this.cryptoForm.value;
  
    return {
      merchantId,
      account_type: cryptoType,
      amount: amount,
      account_number: walletAddress,
      account_name: accountName,
      description: description,
      otp: otp,
      // Add other required fields based on your API
    };
  }

  private cryptoSendPayload(): any {
    const user = this.store.selectSnapshot((state) => state.auth.user);
    
    // Get merchantId handling both string and object formats
    let merchantId;
    if (typeof user?.merchantId === 'string') {
      // If merchantId is a string, use it directly
      merchantId = user.merchantId;
      console.log('Merchant ID found (string):', merchantId);
    } else if (user?.merchantId?._id) {
      // If merchantId is an object with _id, use that
      merchantId = user.merchantId._id;
      console.log('Merchant ID found (object):', merchantId);
    }
    const { withdrawalMethod, account_issuer, account_number, amount, account_name, description, otp } = this.withdrawForm.value;
  
    return {
      merchantId,
      account_type: withdrawalMethod,
      amount: amount,
      account_issuer: account_issuer,
      account_number: account_number,
      account_name: account_name,
      description: description,
      otp: otp,
      // Add other required fields based on your API
    };
  }

  async onWithdraw(): Promise<void> {
    if (!this.withdrawForm.valid || this.isSubmitting) return;
  
    this.isSubmitting = true;
    const form = this.withdrawForm.value;
    // const user = this.store.selectSnapshot(AuthState.user);

    const user = this.store.selectSnapshot((state) => state.auth.user);
    
    // Get merchantId handling both string and object formats
    let merchantId;
    if (typeof user?.merchantId === 'string') {
      // If merchantId is a string, use it directly
      merchantId = user.merchantId;
      console.log('Merchant ID found (string):', merchantId);
    } else if (user?.merchantId?._id) {
      // If merchantId is an object with _id, use that
      merchantId = user.merchantId._id;
      console.log('Merchant ID found (object):', merchantId);
    }

    // if (!merchantId) {
    //   this.error = 'Merchant ID not found';
    //   this.isSubmitting = false;
    //   return;
    // }  
    try {
      const payload = this.cryptoSendPayload();
    
      const response = await this.moneyTransferService.sendMoney(payload);
  
      if (response?.success) {
        this.showSuccess('Withdrawal initiated successfully!');
        this.transactionStatus = 1; // Processing
        this.startPaymentTimer();
        this.initializeTransactionTracking(response.transactionId);
      } else {
        this.showError(response?.message || 'Withdrawal failed. Please try again.');
      }
    } catch (error) {
      console.error('Withdrawal failed:', error);
      this.transactionStatus = -1; // Failed
      this.showError('Withdrawal failed. Please try again.');
    } finally {
      this.isSubmitting = false;
    }
  }

  async generateWallet() {
    this.isGenerating = true;
    try {
      const user = this.store.selectSnapshot((state) => state.auth.user);
    
      // Get merchantId handling both string and object formats
      let merchantId;
      if (typeof user?.merchantId === 'string') {
        // If merchantId is a string, use it directly
        merchantId = user.merchantId;
        console.log('Merchant ID found (string):', merchantId);
      } else if (user?.merchantId?._id) {
        // If merchantId is an object with _id, use that
        merchantId = user.merchantId._id;
        console.log('Merchant ID found (object):', merchantId);
      }
  
      // if (!merchantId) {
      //   this.error = 'Merchant ID not found';
      //   this.isSubmitting = false;
      //   return;
      // }
            const { amount, cryptoType } = this.depositForm.value;
      let depositPayload = {
        merchantId,
        account_type: cryptoType,
        amount: amount,
      };
  
      this.moneyTransferService.deposit(depositPayload).subscribe({
        next: (response) => {
          if (response.success) {
            this.walletGenerated = true;
            this.depositResponse = response;
  
            this.expectedCryptoAmount = this.depositResponse.amount;
            this.networkFee = this.depositResponse.networkFee;
            this.transactionStatus = 1; // Set to "Waiting for Payment"
  
            // Start payment timer
            this.startPaymentTimer();
  
            // Start polling for transaction status
            this.initializeTransactionTracking(response.transactionId);
          } else {
            console.log(response.message);
          }
        },
        error: (err) => {
          console.log(err);
          this.isGenerating = false;
        },
        complete: () => {
          this.isGenerating = false;
        },
      });
    } catch (error) {
      this.isGenerating = false;
      console.log(error);
    }
  }

  initializeTransactionTracking(transactionId: string) {
    if (!transactionId) {
      console.error('Transaction ID is required for tracking.');
      return;
    }
  
    // Start polling for transaction status
    this.pollTransactionStatus(transactionId).subscribe({
      next: (status) => {
        console.log('Transaction status update:', status);
  
        if (status.success) {
          switch (status.status) {
            case 'INITIATED':
              this.transactionStatus = 1; // Waiting for Payment
              break;
            case 'PAID':
              this.transactionStatus = 4; // Payment Completed
              this.stopPaymentTimer(); // Stop the payment timer
              this.stopPolling$.next(); // Stop polling
              break;
            case 'FAILED':
              this.transactionStatus = -1; // Error state
              this.stopPaymentTimer(); // Stop the payment timer
              this.stopPolling$.next(); // Stop polling
              break;
            default:
              console.warn('Unknown transaction status:', status.status);
          }
        } else {
          console.error('Transaction failed:', status.message);
          this.transactionStatus = -1; // Error state
          this.stopPaymentTimer(); // Stop the payment timer
          this.stopPolling$.next(); // Stop polling
        }
      },
      error: (err) => {
        console.error('Error polling transaction status:', err);
        this.transactionStatus = -1; // Error state
        this.stopPaymentTimer(); // Stop the payment timer
        this.stopPolling$.next(); // Stop polling
      },
    });
  }

  
  verifyBitcoinPayment(id: string): Observable<any> {
    return this.http.get(`${API}/transactions/status/${id}`).pipe(
      catchError((err) => throwError(() => err)),
      map((res: any) => {
        if (!res.success) {
          throw new Error(res.message);
        }
        return res;
      })
    );
  }

  pollTransactionStatus(id: string, intervalTime: number = 5000): Observable<any> {
    return interval(intervalTime).pipe(
      switchMap(() => this.verifyBitcoinPayment(id)),
      takeUntil(this.stopPolling$) // Stop polling when stopPolling$ emits
    );
  }

  cleanupTransactionTracking() {
    // Clean up subscriptions
    if (this.trackingSubscription) {
      this.trackingSubscription.unsubscribe();
      this.trackingSubscription = null;
    }

    if (this.timerSubscription) {
      this.timerSubscription.unsubscribe();
      this.timerSubscription = null;
    }
  }

  private updateTransactionStatus(update: any) {
    this.transactionStatus = update.status;
    if (update.hash) {
      this.transactionHash = update.hash;
    }
    if (update.confirmations !== undefined) {
      this.confirmations = update.confirmations;
    }

    // If transaction is complete, clean up
    if (this.transactionStatus === 4) {
      this.cleanupTransactionTracking();
    }
  }

  private handlePaymentTimeout() {
    // Reset the form and clean up
    this.depositResponse = null;
    this.transactionStatus = 0;
    this.cleanupTransactionTracking();
    // Show timeout message to user
    // You might want to implement a notification service for this
  }


  startPaymentTimer() {
    let timeLeft = 30 * 60; // 30 minutes in seconds
    this.timerSubscription = interval(1000)
      .pipe(
        takeWhile(() => timeLeft > 0),
        takeUntil(this.destroy$)
      )
      .subscribe(() => {
        timeLeft--;
        const minutes = Math.floor(timeLeft / 60);
        const seconds = timeLeft % 60;
        this.paymentTimer = `${minutes.toString().padStart(2, '0')}:${seconds
          .toString()
          .padStart(2, '0')}`;

        if (timeLeft === 0) {
          // Handle payment timeout
          this.handlePaymentTimeout();
        }
      });
  }

  ngOnDestroy(): void {
    this.cryptoform$.unsubscribe();
    this.withdrawform$.unsubscribe();
    this.stopPolling$.next(); // Stop polling
    this.stopPolling$.complete(); // Clean up the subject
  }
}
