import { Injectable } from '@angular/core';
import {
  HttpClient,
  HttpErrorResponse,
  HttpHeaders,
} from '@angular/common/http';
import { Store } from '@ngxs/store';
import { AuthState } from '../../state/apps/app.states';
import {
  Bank,
  VerifyAccountResponse,
  OtpResponse,
  TransactionResponse,
  SendMoneyPayload,
  FundWalletPayload,
  CalculateSendPayload,
  CalculateWithdrawPayload,
  SendCryptoDetails,
} from './money-transfer.types';
import url from '../../constants/api.constant';
import { catchError, map, Observable, take } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class MoneyTransferService {
  private readonly API_BASE = url;

  constructor(private http: HttpClient, private store: Store) {}

  private getHeaders(): HttpHeaders {
    const token = this.store.selectSnapshot(AuthState.token);
    return new HttpHeaders().set('Authorization', `Bearer ${token}`);
  }

  getBanks() {
    return this.http
      .get<{ success: boolean; message: string; data: Bank[] }>(
        `${this.API_BASE}/hub/banks/get`,
        { headers: this.getHeaders() }
      )
      .toPromise();
  }

  verifyAccount(number: string, bankCode: string, accountType: string) {
    return this.http
      .get<VerifyAccountResponse>(
        `${this.API_BASE}/transactions/nec?number=${number}&bankCode=${bankCode}&account_type=${accountType}`,
        { headers: this.getHeaders() }
      )
      .toPromise();
  }

  sendOtp(email: string, phoneNumber: string) {
    return this.http
      .post<OtpResponse>(
        `${this.API_BASE}/otp/sendotp`,
        { email, phoneNumber },
        { headers: this.getHeaders() }
      )
      .toPromise();
  }

  deposit(payload: any): Observable<any> {
    return this.http
      .post<TransactionResponse>(
        `${this.API_BASE}/transactions/fundwallet`,
        payload,
        { headers: this.getHeaders() }
      )
      .pipe(
        take(1),
        catchError((err) => {
          throw new Error(err.message);
        })
      );
  }

  sendMoney(payload: SendMoneyPayload) {
    return this.http
      .post<TransactionResponse>(
        `${this.API_BASE}/transactions/credit`,
        payload,
        { headers: this.getHeaders() }
      )
      .toPromise();
  }

  fetchWallets(merchantId: string): Observable<any> {
    return this.http
      .get<any>(`https://doronpay.com/api/accounts/merchant/${merchantId}`, {
        headers: this.getHeaders(),
      })
      .pipe(
        take(1),
        catchError((err: HttpErrorResponse) => {
          throw new Error(err.message);
        }),
        map((res) => res.data)
      );
  }

  calculateCryptoSend(
    payload: CalculateSendPayload
  ): Observable<SendCryptoDetails> {
    return this.http
      .post<TransactionResponse>(
        `${this.API_BASE}/transactions/crypto/calculate-send`,
        payload,
        { headers: this.getHeaders() }
      )
      .pipe(
        take(1),
        catchError((error: HttpErrorResponse) => {
          throw new Error(`Failed to calculate crypto send: ${error.message}`);
        }),
        map((res) => res.data)
      );
  }

  calculateCryptoWithdrawal(
    payload: CalculateWithdrawPayload
  ): Observable<any> {
    return this.http
      .post<TransactionResponse>(
        `${this.API_BASE}/transactions/crypto/calculate-withdraw`,
        payload,
        { headers: this.getHeaders() }
      )
      .pipe(
        take(1),
        catchError((error: HttpErrorResponse) => {
          throw new Error(`Failed to calculate crypto send: ${error.message}`);
        }),
        map((res) => res.data)
      );
  }

  fundWallet(payload: FundWalletPayload) {
    return this.http
      .post<TransactionResponse>(
        `${this.API_BASE}/transactions/fundwallet`,
        payload,
        { headers: this.getHeaders() }
      )
      .toPromise();
  }
}
