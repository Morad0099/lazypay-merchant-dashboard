// models/recipient.model.ts
export enum PaymentAccountType {
    BANK = "bank",
    MOMO = "momo",
    // CARD = "card",
    // WALLET = "wallet",
    // TOKEN = "token",
    BTC = "btc",
    TRC20 = "trc20",
    ERC20 = "erc20",
    SOLANA = "solana",
  }
  
  export interface Recipient {
    _id?: string;
    merchantId: string;
    recipientName: string;
    accountName: string;
    accountNumber: string;
    accountIssuer: string;
    accountType: PaymentAccountType;
    phoneNumber?: string;
    email?: string;
    department?: string;
    position?: string;
    isActive: boolean;
    createdBy: string;
    createdAt?: Date;
    updatedAt?: Date;
  }
  
  export interface RecipientListResponse {
    success: boolean;
    message: string;
    data: Recipient[];
    meta: {
      total: number;
      page: number;
      limit: number;
      pages: number;
    };
  }
  
  export interface RecipientResponse {
    success: boolean;
    message: string;
    data: Recipient;
  }