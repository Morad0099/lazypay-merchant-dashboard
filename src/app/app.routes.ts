import { Routes } from '@angular/router';
import { AuthGuard } from './guard/auth.guard';
import { HubDashboardComponent } from './pages/hub/hub-dashboard.component';
import { TransactionsMerchantComponent } from './pages/transactions-merchant/transactions-merchant.component';
import { MerchantProfileComponent } from './pages/merchant-profile/merchant-profile.component';
import { UsersComponent } from './pages/merchant-users/merchant-users.component';
import { UserMerchantsComponent } from './pages/merchant-users/user-merchants.component';
import { ReportsComponent } from './pages/merchants-reports/merchants-reports.component';
import { SettlementsComponent } from './pages/merchant-settlements/merchant-settlements.component';
import { MoneyTransferComponent } from './pages/transfer-money/money-transfer.component';
import { TransactionDetailsComponent } from './pages/transactions/transaction-details.component';
import { MerchantWalletsComponent } from './pages/merchant-wallets/merchant-wallets.component';

export const routes: Routes = [
  {
    path: 'auth/login',
    loadComponent: () =>
      import('../../src/app/pages/auth-layout.ts/login/login.component').then(
        (m) => m.LoginComponent
      ),
  },
  {
    path: '',
    loadComponent: () =>
      import('../app/pages/main-layout/main-layout.component').then(
        (m) => m.MainLayoutComponent
      ),
    canActivate: [AuthGuard],
    children: [
      // {
      //   path: 'payment-reconciliation',
      //   loadComponent: () =>
      //     import(
      //       '../../src/app/pages/payment-reconcilation/payment-reconciliation.component'
      //     ).then((m) => m.PaymentReconciliationComponent),
      // },
      {
        path: 'mechant',
        component: UserMerchantsComponent,
      },
      {
        path: 'reports',
        component: ReportsComponent,
      },
      {
        path: 'settlements',
        component: SettlementsComponent,
      },
      {
        path: 'transfer',
        component: MoneyTransferComponent,
      },
      {
        path: 'wallets',
        component: MerchantWalletsComponent,
      },
      {
        path: 'admins',
        loadComponent: () =>
          import('./pages/admin-management/admin-management.component').then(
            (m) => m.AdminManagementComponent
          ),
      },
      {
        path: 'profile',
        component: MerchantProfileComponent,
      },
      {
        path: 'users',
        component: UsersComponent,
      },
      {
        path: 'transactions/:id',
        component: TransactionsMerchantComponent,
      },
      {
        path: 'hub',
        component: HubDashboardComponent,
      },
      {
        path: 'transaction',
        component: TransactionDetailsComponent,
      },
      // Add other child routes here
      { path: '', redirectTo: 'wallets', pathMatch: 'full' },
    ],
  },
  { path: '**', redirectTo: 'wallets' },
];
