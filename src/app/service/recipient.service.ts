// service/recipient.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Recipient, RecipientListResponse, RecipientResponse } from '../models/recipient.model';
import url from '../../app/constants/api.constant';

@Injectable({
  providedIn: 'root'
})
export class RecipientService {
  private apiUrl = `${url}/payrolls/recipients`;

  constructor(private http: HttpClient) { }

  getRecipients(
    merchantId: string, 
    page: number = 1, 
    limit: number = 50, 
    isActive?: boolean, 
    department?: string
  ): Observable<RecipientListResponse> {
    let params = new HttpParams()
      .set('merchantId', merchantId)
      .set('page', page.toString())
      .set('limit', limit.toString());
    
    if (isActive !== undefined) {
      params = params.set('isActive', isActive.toString());
    }
    
    if (department) {
      params = params.set('department', department);
    }

    console.log('Params:', params.toString());

    
    return this.http.get<RecipientListResponse>(this.apiUrl, { params });
  }

  createRecipient(recipient: Recipient): Observable<RecipientResponse> {
    return this.http.post<RecipientResponse>(this.apiUrl, recipient);
  }

  getRecipientById(recipientId: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${recipientId}`, {
      params: { recipientId }
    });
  }

  updateRecipient(recipientId: string, recipientData: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/update`, {id: recipientId, data: recipientData});
  }
}