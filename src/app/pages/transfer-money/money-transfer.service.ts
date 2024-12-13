import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Store } from '@ngxs/store';
import { AuthState } from '../../state/apps/app.states';
import { 
  Bank, 
  VerifyAccountResponse, 
  OtpResponse, 
  TransactionResponse,
  SendMoneyPayload,
  FundWalletPayload 
} from './money-transfer.types';

@Injectable({
  providedIn: 'root'
})
export class MoneyTransferService {
  private readonly API_BASE = 'https://lazypaygh.com/api';

  constructor(
    private http: HttpClient,
    private store: Store
  ) {}

  private getHeaders(): HttpHeaders {
    const token = this.store.selectSnapshot(AuthState.token);
    return new HttpHeaders().set('Authorization', `Bearer ${token}`);
  }

  getBanks() {
    return this.http.get<{ success: boolean; message: string; data: Bank[] }>(
      `${this.API_BASE}/hub/banks/get`,
      { headers: this.getHeaders() }
    ).toPromise();
  }

  verifyAccount(number: string, bankCode: string, accountType: string) {
    return this.http.get<VerifyAccountResponse>(
      `${this.API_BASE}/transactions/nec?number=${number}&bankCode=${bankCode}&account_type=${accountType}`,
      { headers: this.getHeaders() }
    ).toPromise();
  }

  sendOtp(email: string, phoneNumber: string) {
    return this.http.post<OtpResponse>(
      `${this.API_BASE}/otp/sendotp`,
      { email, phoneNumber },
      { headers: this.getHeaders() }
    ).toPromise();
  }

  sendMoney(payload: SendMoneyPayload) {
    return this.http.post<TransactionResponse>(
      `${this.API_BASE}/transactions/credit`,
      payload,
      { headers: this.getHeaders() }
    ).toPromise();
  }

  fundWallet(payload: FundWalletPayload) {
    return this.http.post<TransactionResponse>(
      `${this.API_BASE}/transactions/fundwallet`,
      payload,
      { headers: this.getHeaders() }
    ).toPromise();
  }
}