import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { SendCryptoComponent } from './send-cryto.component';
import { TransferMoneyService } from './transfer-money.service';
import { WithdrawCryptoComponent } from './withdraw-crypto.component';
import { SendFiatComponent } from './send-fiat.component';
import { DepositCryptoComponent } from './deposit-crypto.component';


@Component({
  selector: 'app-money-transfer',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    SendCryptoComponent,
    WithdrawCryptoComponent,
    SendFiatComponent,
    DepositCryptoComponent
  ],
  templateUrl: './money-transfer.component.html',
  styleUrls: ['./money-transfer.component.scss'],
})
export class MoneyTransferComponent implements OnInit {

  constructor(public $service: TransferMoneyService) {}

  ngOnInit(): void {};

}
