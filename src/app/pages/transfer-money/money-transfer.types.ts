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
  }
  
  export interface SendMoneyPayload {
    account_issuer: string;
    account_name: string;
    account_number: string;
    account_type: 'momo' | 'bank';
    amount: string;
    customerId: string;
    customerType: string;
    description: string;
    initiatedBy: string;
    otp: string;
    serviceName: string;
  }
  
  export interface FundWalletPayload {
    account_issuer: string;
    account_number: string;
    amount: string;
    customerId: string;
    customerType: string;
    otp: string;
  }