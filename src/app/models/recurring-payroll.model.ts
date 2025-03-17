// models/recurring-payroll.model.ts
export enum RecurringFrequency {
    DAILY = 'DAILY',
    WEEKLY = 'WEEKLY',
    BIWEEKLY = 'BIWEEKLY',
    MONTHLY = 'MONTHLY'
  }
  
  export enum RecurringStatus {
    ACTIVE = 'ACTIVE',
    PAUSED = 'PAUSED',
    CANCELLED = 'CANCELLED'
  }
  
  export interface RecurringPayroll {
    _id?: string;
    merchantId: string;
    name: string;
    description?: string;
    frequency: RecurringFrequency;
    dayOfMonth?: number; // For MONTHLY frequency
    dayOfWeek?: number; // For WEEKLY/BIWEEKLY frequency
    timeOfDay: string; // Format: HH:MM (24-hour)
    requiresApproval: boolean;
    status: RecurringStatus;
    nextExecutionDate?: Date;
    lastExecutionDate?: Date;
    initiatedBy: string;
    createdAt?: Date;
    updatedAt?: Date;
    recurringId?: string;
    nextRunDate?: Date;
    lastRunDate?: Date;
  }
  
  export interface RecipientConfiguration {
    _id?: string;
    recurringPayrollId: string;
    recipientId: string;
    recipientName: string;
    accountName: string;
    accountNumber: string;
    accountIssuer: string;
    accountType: string;
    amount: number;
    narration: string;
    sendSms: boolean;
    isActive: boolean;
    createdAt?: Date;
    updatedAt?: Date;
  }
  
  
export interface UpcomingPayrollRun {
  _id: string;
  recurringId: string;
  merchantId: string;
  name: string;
  description: string;
  frequency: string;
  dayOfMonth?: number;
  dayOfWeek?: number;
  timeOfDay: string;
  nextRunDate: Date;
  status: string;
  requiresApproval: boolean;
  recipientIds: string[];
  totalAmount: number;
  createdAt: Date;
  updatedAt: Date;
}
  
  export interface RecurringPayrollListResponse {
    success: boolean;
    message: string;
    data: RecurringPayroll[];
    meta: {
      total: number;
      page: number;
      limit: number;
      pages: number;
    };
  }
  
  export interface RecurringPayrollResponse {
    success: boolean;
    message: string;
    data: RecurringPayroll;
  }
  
  export interface RecipientConfigurationListResponse {
    success: boolean;
    message: string;
    data: RecipientConfiguration[];
    meta: {
      total: number;
      page: number;
      limit: number;
      pages: number;
    };
  }
  
  export interface UpcomingPayrollRunsResponse {
    success: boolean;
    message: string;
    data: UpcomingPayrollRun[];
  }