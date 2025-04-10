// ticket.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import API from '../../constants/api.constant';

export enum TicketCategory {
  PAYMENT = "Payment",
  VERIFICATION = "Verification",
  TECHNICAL = "Technical",
  OTHER = "Other",
}

export enum TicketPriority {
  LOW = "Low",
  MEDIUM = "Medium",
  HIGH = "High",
}

export enum TicketStatus {
  OPEN = "Open",
  IN_PROGRESS = "In Progress",
  RESOLVED = "Resolved",
  CLOSED = "Closed",
}

export interface Ticket {
  _id: string;
  merchantId: string;
  transactionRef?: string;
  category: TicketCategory;
  priority: TicketPriority;
  subject: string;
  description: string;
  status: TicketStatus;
  assignedTo?: string;
  comments?: Array<{
    text: string;
    createdBy: string;
    creatorType: string;
    createdAt: Date;
  }>;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateTicketDto {
  merchantId: string;
  transactionRef?: string;
  category: TicketCategory;
  priority: TicketPriority;
  subject: string;
  description: string;
}

export interface CommentDto {
  text: string;
  createdBy: string;
  creatorType: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface PaginatedApiResponse<T> {
    data: T;
    pagination: {
      total: number;
      limit: number;
      skip: number;
      pages: number;
    };
  }

@Injectable({
  providedIn: 'root'
})
export class TicketService {
  constructor(private http: HttpClient) { }

  private getHeaders(): HttpHeaders {
    const token = this.getAuthToken();
    return new HttpHeaders().set('Authorization', `Bearer ${token}`);
  }

  private getAuthToken(): string {
    const loginData = localStorage.getItem('PLOGIN');
    if (loginData) {
      try {
        const parsedData = JSON.parse(loginData);
        return parsedData.token || '';
      } catch (error) {
        console.error('Error parsing auth token', error);
        return '';
      }
    }
    return '';
  }

  getUserInfo(): any {
    const loginData = localStorage.getItem('PLOGIN');
    if (loginData) {
      try {
        const parsedData = JSON.parse(loginData);
        return parsedData.user || null;
      } catch (error) {
        console.error('Error parsing user info', error);
        return null;
      }
    }
    return null;
  }

  getAllTickets(): Observable<ApiResponse<Ticket[]>> {
    return this.http.get<PaginatedApiResponse<Ticket[]>>(`${API}/tickets/get`, {
      headers: this.getHeaders()
    }).pipe(
      // Transform the paginated response to match our ApiResponse interface
      map(response => ({
        success: true,
        message: 'Tickets retrieved successfully',
        data: response.data
      })),
      catchError(this.handleError<Ticket[]>('getAllTickets'))
    );
  }

  getTicketById(id: string): Observable<ApiResponse<Ticket>> {
    return this.http.get<any>(`${API}/tickets/${id}`, {
      headers: this.getHeaders()
    }).pipe(
      tap(response => console.log('Raw ticket detail response:', response)),
      map(response => {
        // The API returns { success, message, data } where data is the ticket
        return {
          success: response.success || true,
          message: response.message || 'Ticket retrieved successfully',
          data: response.data
        };
      }),
      catchError(this.handleError<Ticket>('getTicketById'))
    );
  }

  getTicketsByTransactionRef(transactionRef: string): Observable<ApiResponse<Ticket[]>> {
    return this.http.get<PaginatedApiResponse<Ticket[]>>(`${API}/tickets/transaction/${transactionRef}`, {
      headers: this.getHeaders()
    }).pipe(
      // Transform the paginated response to match our ApiResponse interface
      map(response => ({
        success: true,
        message: 'Transaction tickets retrieved successfully',
        data: response.data
      })),
      catchError(this.handleError<Ticket[]>('getTicketsByTransactionRef'))
    );
  }

  createTicket(ticketData: CreateTicketDto): Observable<ApiResponse<Ticket>> {
    return this.http.post<ApiResponse<Ticket>>(`${API}/tickets/new`, ticketData, {
      headers: this.getHeaders()
    }).pipe(
      catchError(this.handleError<Ticket>('createTicket'))
    );
  }

  addComment(ticketId: string, commentData: CommentDto): Observable<ApiResponse<Ticket>> {
    return this.http.post<ApiResponse<Ticket>>(
      `${API}/tickets/${ticketId}/comments`, 
      commentData, 
      { headers: this.getHeaders() }
    ).pipe(
      catchError(this.handleError<Ticket>('addComment'))
    );
  }

  private handleError<T>(operation = 'operation') {
    return (error: any): Observable<ApiResponse<T>> => {
      console.error(`${operation} failed:`, error);
      
      // Create a user-friendly error message
      let errorMessage = 'An error occurred';
      if (error.error?.message) {
        errorMessage = error.error.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      // Return an observable with a user-facing error message
      return of({
        success: false,
        message: errorMessage,
        data: {} as T
      });
    };
  }
}