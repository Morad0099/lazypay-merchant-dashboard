// service/recurring-payroll.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { 
  RecurringPayroll, 
  RecurringPayrollListResponse, 
  RecurringPayrollResponse,
  RecipientConfigurationListResponse,
  UpcomingPayrollRunsResponse
} from '../models/recurring-payroll.model';
import url from '../../app/constants/api.constant';

@Injectable({
  providedIn: 'root'
})
export class RecurringPayrollService {
  private apiUrl = `${url}/payrolls/recurring`;

  constructor(private http: HttpClient) { }

  // Get list of recurring payrolls
  getRecurringPayrolls(
    merchantId: string,
    page: number = 1,
    limit: number = 20,
    status?: string,
    frequency?: string
  ): Observable<RecurringPayrollListResponse> {
    let params = new HttpParams()
      .set('merchantId', merchantId)
      .set('page', page.toString())
      .set('limit', limit.toString());
    
    if (status) {
      params = params.set('status', status);
    }
    
    if (frequency) {
      params = params.set('frequency', frequency);
    }
    
    return this.http.get<RecurringPayrollListResponse>(`${this.apiUrl}/get`, { params });
  }

  // Create new recurring payroll
  createRecurringPayroll(data: any): Observable<RecurringPayrollResponse> {
    return this.http.post<RecurringPayrollResponse>(`${this.apiUrl}/new`, data);
  }

  // Update existing recurring payroll
  updateRecurringPayroll(recurringId: string, data: any): Observable<RecurringPayrollResponse> {
    return this.http.put<RecurringPayrollResponse>(`${this.apiUrl}/${recurringId}`, data);
  }

  // Get recipient configurations for a recurring payroll
  getRecipientConfigurations(
    recurringId: string,
    page: number = 1,
    limit: number = 50,
    includeInactive: boolean = false
  ): Observable<RecipientConfigurationListResponse> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString())
      .set('includeInactive', includeInactive.toString());
    
    return this.http.get<RecipientConfigurationListResponse>(
      `${this.apiUrl}/${recurringId}/recipients`,
      { params }
    );
  }

  // Add recipient to recurring payroll
  addRecipient(recurringId: string, data: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/${recurringId}/recipients`, data);
  }

  // Update recipient configuration
  updateRecipientConfig(recurringId: string, recipientId: string, data: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${recurringId}/recipients/${recipientId}`, data);
  }

  // Remove recipient from recurring payroll
  removeRecipient(recurringId: string, recipientId: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${recurringId}/recipients/${recipientId}`);
  }

  // Get upcoming payroll runs
  getUpcomingPayrollRuns(merchantId: string, days: number = 30): Observable<UpcomingPayrollRunsResponse> {
    let params = new HttpParams()
      .set('merchantId', merchantId)
      .set('days', days.toString());
    
    return this.http.get<UpcomingPayrollRunsResponse>(`${this.apiUrl}/upcoming`, { params });
  }

  // Manually execute a recurring payroll
  executeRecurringPayroll(recurringId: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/${recurringId}/execute`, {});
  }
}