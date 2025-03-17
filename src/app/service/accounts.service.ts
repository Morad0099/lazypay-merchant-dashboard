import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subject, of } from 'rxjs';
import { catchError, map, take, takeUntil, tap } from 'rxjs/operators';
import API from '../constants/api.constant';
import { AccountsInterface } from '../models/accounts.model';

const _DEFAULT = {
  bank_account_issuer: '',
  bank_account_issuer_name: '',
  bank_account_name: '',
  bank_account_number: '',
  momo_account_issuer: '',
  momo_account_issuer_name: '',
  momo_account_name: '',
  momo_account_number: '',
};

@Injectable({
  providedIn: 'root',
})
export class AccountsService {
  loading$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  accounts$: BehaviorSubject<any[]> = new BehaviorSubject<any[]>([]);
  profile$: BehaviorSubject<AccountsInterface> = new BehaviorSubject(_DEFAULT);

  private data: AccountsInterface = _DEFAULT;

  constructor(private http: HttpClient) {}

  addBank(id: string): Promise<any> {
    return this.http.get(`${API}/merchants/get/${id}`).toPromise();
  }

  nec(data: {
    account_number: string;
    account_issuer: string;
    account_type?: string;
  }): Observable<any> {
    return this.http.post(`${API}/hub/enquiry`, data);
  }

  necRevamped(data: {
    number: string;
    bankCode: string;
    account_type: string;
  }): Observable<any> {
    return this.http
      .get(
        `${API}/transactions/nec?number=${data.number}&bankCode=${
          data.bankCode || ''
        }&account_type=${data.account_type || ''}`
      )
      .pipe(
        take(1),
        catchError((err) => of(err)),
        tap((res) => {
          if (!res.success) {
            throw Error(res.message);
          }
        }),
        map((res) => res.data),
        tap(({ code }) => {
          if (code !== '00') {
            throw Error('Name verification failed');
          }
        })
      );
  }

  necReturnPromise(data: {
    number: string;
    bankCode: string;
    account_type: string;
  }): Promise<any> {
    return this.http
      .get(
        `${API}/transactions/nec?number=${data.number}&bankCode=${
          data.bankCode || ''
        }&account_type=${data.account_type || ''}`
      )
      .toPromise();
  }

  getBanks(): void {
    this.loading$.next(true);
    this.http
      .get(`${API}/issuers/get`)
      .pipe(
        take(1),
        catchError((err) => of(err))
      )
      .subscribe((response: any) => {
        this.loading$.next(false);
        if (!response.success) {
          throw Error(response.message);
        }
        this.accounts$.next(response.data);
      });
  }

  updateData(_data: any): void {
    this.data = { ...this.data, ..._data };
  }

  setProfile(data: AccountsInterface) {
    this.profile$.next(data);
  }

  getData(): Array<AccountsInterface> {
    let data: AccountsInterface | any = {};
    Object.keys(this.data).forEach((key: string) => {
      if (this.data[key] !== '') {
        data[key] = this.data[key];
      }
    });
    return data;
  }
}
