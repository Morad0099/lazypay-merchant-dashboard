export interface Bank {
  BankCode: string;
  BankName: string;
  NrtActive: string;
  IsActive: string;
}

export interface VerifyAccountResponse {
  success: boolean;
  message: string;
  data: {
    success: boolean;
    code: string;
    message: string;
    data: string;
  };
}

export interface OtpResponse {
  success: boolean;
  message: string;
}

export interface TransactionResponse {
  success: boolean;
  message: string;
  data?: any;
  transactionId: string;
}

export interface SendMoneyPayload {
  account_issuer: string;
  account_name: string;
  account_number: string;
  account_type: 'momo' | 'bank';
  amount: string;
  merchantId: string;
  // customerType: string;
  description: string;
  initiatedBy: string;
  otp: string;
  // serviceName: string;
}

export interface CalculateSendPayload {
  cryptoType: 'btc' | 'usdt';
  amount: number;
}

export interface CalculateWithdrawPayload {
  cryptoType: 'btc' | 'usdt';
  amount: number;
  accountType: string;
}

export interface FundWalletPayload {
  account_issuer: string;
  account_number: string;
  amount: string;
  merchantId: string;
  // customerType: string;
  otp: string;
}

export interface SendCryptoDetails {
  platformTransactionFee: string;
  transactionCharge: number;
  networkFee: number;
  totalAmount: number;
  cryptoAmount: string;
}

export interface WithdrawCryptoDetails {
  platformTransactionFee: string;
  totalAmount: number;
  amountToRecieve: number;
  cryptoAmount: string;
}
