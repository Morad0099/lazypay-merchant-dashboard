import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { LoginComponent } from './pages/auth-layout.ts/login/login.component';
import { PaymentReconciliationComponent } from './pages/payment-reconcilation/payment-reconciliation.component';
import { Store } from '@ngxs/store';
import { AutoLogin } from './auth/auth.action';
import { ModalComponent } from './components/app-modal/app-modal.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    MatCardModule,
    LoginComponent,
    RouterOutlet,
    PaymentReconciliationComponent,
    ModalComponent
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent implements OnInit {
  constructor(private store: Store) {}

  ngOnInit() {
    this.store.dispatch(new AutoLogin());
  }
}
