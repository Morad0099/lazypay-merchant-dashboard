import { Routes } from '@angular/router';
import { PaymentReconciliationComponent } from './payment-reconcilation/payment-reconciliation.component';

export const mainRoutes: Routes = [
  { path: 'payment-reconciliation', component: PaymentReconciliationComponent },
  // { path: 'other', component: OtherComponent },
  { path: '', redirectTo: '/payment-reconciliation', pathMatch: 'full' },
  { path: '**', redirectTo: '/payment-reconciliation' },
];
