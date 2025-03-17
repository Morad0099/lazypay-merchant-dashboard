import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Store } from '@ngxs/store';
import { Observable, Subject } from 'rxjs';
import { catchError, takeUntil, take, tap, map } from 'rxjs/operators';
import { of } from 'rxjs';
import API from '../constants/api.constant';
import { GetBulkBeneficiaries } from '../state/apps/apps.action';
import { AuthState } from '../state/auth/auth.state';
import {
  GetBeneficiaries,
  GetCardCategories,
  GetCards,
  GetSettlement,
  GetTemplates,
  LoadWallets,
} from '../state/profile/profile.action';

@Injectable({
  providedIn: 'root',
})
export class TransactionService {
  constructor(private http: HttpClient, private store: Store) {}

  createTransaction(data: any): Observable<any> {
    return this.http.post(`${API}/transactions/sendmoney`, data);
  }

  sendotp(data: any): Observable<any> {
    return this.http.post(`${API}/otp/sendotp`, data);
  }

  saveWallet(data: any): Observable<any> {
    return this.http.post(`${API}/wallets/new`, data);
  }

  authorizeTransactions(data: any): Observable<any> {
    return this.http.post(`${API}/transactions/pending/authorize`, data);
  }

  fundWallet(data: any): Observable<any> {
    return this.http.post(`${API}/transactions/fundwallet`, data).pipe(
      take(1),
      catchError((err) => of(err)),
      tap((res) => {
        if (!res.success) {
          throw Error(res.message);
        }
      })
    );
  }

  sendMoney(data: any): Observable<any> {
    return this.http.post(`${API}/transactions/credit`, data).pipe(
      take(1),
      catchError((err) => of(err)),
      tap((res) => {
        if (!res.success) {
          throw Error(res.message);
        }
      })
    );
  }

  getBanks(): Observable<any> {
    return this.http.get(`${API}/hub/banks/get`).pipe(
      take(1),
      catchError((err) => of(err)),
      tap((res) => {
        if (!res.success) {
          throw Error(res.message);
        }
      }),
      map((res) => res.data)
    );
  }

  getPendingTransactions(id: string): Observable<any> {
    return this.http.get(`${API}/transactions/pending/get/${id}`);
  }

  getUnconfirmed(id: string): Observable<any> {
    return this.http.get(`${API}/transactions/pending?id=${id}`);
  }

  saveBeneficiaries(data: any): Observable<any> {
    return this.http.put(`${API}/beneficiaries/bulk`, data);
  }

  saveBeneficiary(data: any): Observable<any> {
    return this.http.post(`${API}/beneficiaries/new`, data);
  }

  disburse(data: any): Observable<any> {
    return this.http.post(`${API}/transactions/bulk`, data);
  }

  saveTemplate(data: any): Observable<any> {
    return this.http.post(`${API}/templates/add`, data);
  }

  getSettlements(): void {
    const { _id } = this.store.selectSnapshot(AuthState.user).merchantId;
    this.http
      .get(`${API}/settlements/get/${_id}`)
      .pipe(
        take(1),
        catchError((err) => of(err))
      )
      .subscribe((response: any) => {
        if (response.success) {
          this.store.dispatch(new GetSettlement(response.data));
        }
      });
  }

  loadBulkBeneficiaries(id: string): void {
    this.http
      .get(`${API}/beneficiaries/bulk/${id}`)
      .pipe(
        take(1),
        catchError((err) => of(err))
      )
      .subscribe((response: any) => {
        if (response.success) {
          this.store.dispatch(new GetBulkBeneficiaries(response.data));
        }
      });
  }

  loadTemplates(id: string): void {
    this.http
      .get(`${API}/templates/get/${id}`)
      .pipe(
        take(1),
        catchError((err) => of(err))
      )
      .subscribe((response: any) => {
        if (response.success) {
          this.store.dispatch(new GetTemplates(response.data));
        }
      });
  }

  getcards(id: string): void {
    this.http
      .get(`${API}/giftcards/categories/get/${id}`)
      .pipe(
        take(1),
        catchError((err) => of(err))
      )
      .subscribe((response: any) => {
        if (response.success) {
          this.store.dispatch(new GetCards(response.data));
        }
      });
  }

  getAllCategories(): void {
    this.http
      .get(`${API}/giftcards/categories/get`)
      .pipe(
        take(1),
        catchError((err) => of(err))
      )
      .subscribe((response: any) => {
        if (response.success) {
          this.store.dispatch(new GetCardCategories(response.data));
        }
      });
  }

  loadBeneficiaries(): void {
    const { _id } = this.store.selectSnapshot(AuthState.user).merchantId;
    this.http
      .get(`${API}/beneficiaries/get/customer/${_id}`)
      .pipe(
        take(1),
        catchError((err) => of(err))
      )
      .subscribe((response: any) => {
        if (response.success) {
          this.store.dispatch(new GetBeneficiaries(response.data));
        }
      });
  }

  loadWallets(): void {
    const { _id } = this.store.selectSnapshot(AuthState.user).merchantId;
    this.http
      .post(`${API}/wallets/get/customer`, { customerId: _id })
      .pipe(
        take(1),
        catchError((err) => of(err))
      )
      .subscribe((response: any) => {
        if (response.success) {
          this.store.dispatch(new LoadWallets(response.data));
        }
      });
  }
}
