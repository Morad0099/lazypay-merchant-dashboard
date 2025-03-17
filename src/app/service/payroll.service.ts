import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CreatePayrollRequest, PayrollListResponse, PayrollResponse, PayrollStatsResponse, PayrollTransactionListResponse } from '../models/payroll.model';
import  url  from '../../app/constants/api.constant';

@Injectable({
  providedIn: 'root'
})
export class PayrollService {
  private apiUrl = `${url}/payrolls`;

  constructor(private http: HttpClient) { }

  getPayrolls(
    merchantId: string, 
    page: number = 1, 
    limit: number = 20, 
    status?: string, 
    fromDate?: Date, 
    toDate?: Date
  ): Observable<PayrollListResponse> {
    let params = new HttpParams()
      .set('merchantId', merchantId)
      .set('page', page.toString())
      .set('limit', limit.toString());
    
    if (status) {
      params = params.set('status', status);
    }
    
    if (fromDate) {
      params = params.set('fromDate', fromDate.toISOString());
    }
    
    if (toDate) {
      params = params.set('toDate', toDate.toISOString());
    }
    
    return this.http.get<PayrollListResponse>(`${this.apiUrl}/get`, { params });
  }

  getPayroll(payrollId: string): Observable<PayrollResponse> {
    return this.http.get<PayrollResponse>(`${this.apiUrl}/${payrollId}`);
  }

  createPayroll(payrollData: CreatePayrollRequest): Observable<PayrollResponse> {
    return this.http.post<PayrollResponse>(`${this.apiUrl}/new`, payrollData);
  }

  getPayrollTransactions(
    payrollId: string, 
    page: number = 1, 
    limit: number = 50, 
    status?: string
  ): Observable<PayrollTransactionListResponse> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());
    
    if (status) {
      params = params.set('status', status);
    }
    
    return this.http.get<PayrollTransactionListResponse>(`${this.apiUrl}/${payrollId}/transactions`, { params });
  }
  
  getPayrollStats(payrollId: string): Observable<PayrollStatsResponse> {
    return this.http.get<PayrollStatsResponse>(`${this.apiUrl}/${payrollId}/stats`);
  }

  authorizePayroll(payrollId: string, action: 'approve' | 'reject', comments?: string): Observable<PayrollResponse> {
    return this.http.post<PayrollResponse>(`${this.apiUrl}/${payrollId}/authorize`, { action, comments });
  }
  
  processPayroll(payrollId: string): Observable<PayrollResponse> {
    return this.http.post<PayrollResponse>(`${this.apiUrl}/${payrollId}/process`, {});
  }
}