// models/payroll.model.ts
export enum PayrollStatus {
    DRAFT = 'DRAFT',
    PENDING_APPROVAL = 'PENDING_APPROVAL',
    APPROVED = 'APPROVED',
    REJECTED = 'REJECTED',
    PROCESSING = 'PROCESSING',
    COMPLETED = 'COMPLETED',
    FAILED = 'FAILED',
    PARTIALLY_COMPLETED = 'PARTIALLY_COMPLETED'
  }
  
  export interface Payroll {
    _id?: string;
    payrollId: string;
    merchantId: string;
    name: string;
    description?: string;
    initiatedBy: string;
    approvedBy?: string[];
    rejectedBy?: string;
    rejectionReason?: string;
    totalAmount: number;
    transactionCount: number;
    status: PayrollStatus;
    processingStartedAt?: Date;
    completedAt?: Date;
    createdAt?: Date;
    updatedAt?: Date;
  }
  
  export interface PayrollListResponse {
    success: boolean;
    message: string;
    data: Payroll[];
    meta: {
      total: number;
      page: number;
      limit: number;
      pages: number;
    };
  }
  
  export interface PayrollResponse {
    success: boolean;
    message: string;
    data: Payroll;
  }

  export interface PayrollTransaction {
    recipientId: string;
    amount: number;
    narration?: string;
    sendSms?: boolean;
  }
  
  export interface CreatePayrollRequest {
    name: string;
    description?: string;
    merchantId: string;
    transactions: PayrollTransaction[];
  }

  export enum PaymentTransactionStatus {
    PENDING = 'PENDING',
    PENDING_APPROVAL = 'PENDING_APPROVAL',
    PROCESSING = 'PROCESSING',
    COMPLETED = 'COMPLETED',
    FAILED = 'FAILED'
  }
  
  export interface PayrollTransaction {
    _id?: string;
    payrollId: string;
    transactionRef?: string;
    merchantId: string;
    recipientId: string;
    recipientName: string;
    accountName: string;
    accountNumber: string;
    accountIssuer: string;
    accountType: string;
    amount: number;
    narration?: string;
    status: PaymentTransactionStatus;
    processedAt?: Date;
    failureReason?: string;
    errorTime?: Date;
    externalReference?: string;
    createdAt?: Date;
    updatedAt?: Date;
  }
  
  export interface PayrollTransactionListResponse {
    success: boolean;
    message: string;
    data: PayrollTransaction[];
    meta: {
      total: number;
      page: number;
      limit: number;
      pages: number;
    };
  }
  
  export interface PayrollStats {
    totalAmount: number;
    transactionCount: number;
    completedTransactions: number;
    pendingTransactions: number;
    failedTransactions: number;
    completedAmount: number;
    pendingAmount: number;
    failedAmount: number;
  }
  
  export interface PayrollStatsResponse {
    success: boolean;
    message: string;
    data: PayrollStats;
  }