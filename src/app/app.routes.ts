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
import { RegisterComponent } from './pages/auth-layout.ts/register/register.component';
import { KycComponent } from './pages/kyc/kyc.component';
import { KycGuard } from './guard/kyc.guard';
import { PayrollListComponent } from './pages/payroll/payroll-list.component';
import { CreatePayrollComponent } from './pages/payroll/create-payroll.component';
import { PayrollDetailComponent } from './pages/payroll/payroll-detail.component';
import { RecipientListComponent } from './pages/payroll/recipient-list.component';
import { RecipientFormComponent } from './pages/payroll/recipient-form.component';
import { RecurringPayrollListComponent } from './pages/payroll/recurring-payroll-list.component';
import { CreateRecurringPayrollComponent } from './pages/payroll/create-recurring-payroll.component';
import { RecurringPayrollDetailComponent } from './pages/payroll/recurring-payroll-detail.component';
import { UpcomingPayrollRunsComponent } from './pages/payroll/upcoming-payroll-runs.component';
import { PaymentLinkGeneratorComponent } from './pages/payment-link-generator/payment-link-generator.component';
import { PaymentLinksPageComponent } from './pages/payment-links-page/payment-links-page.component';
import { DocumentationComponent } from './pages/documentation/documentation.component';
import { HelpComponent } from './pages/help/help.component';
import { AuthorizersListComponent } from './pages/authorizers-list/authorizers-list.component';
import { PaymentTerminalsComponent } from './pages/payment-terminals/payment-terminals.component';
import { TicketManagementComponent } from './pages/ticket-management/ticket-management.component';

export const routes: Routes = [
  {
    path: 'auth/login',
    loadComponent: () =>
      import('../../src/app/pages/auth-layout.ts/login/login.component').then(
        (m) => m.LoginComponent
      ),
  },
  {
    path: 'auth/register',
    component: RegisterComponent,
  },
  {
    path: '',
    loadComponent: () =>
      import('../app/pages/main-layout/main-layout.component').then(
        (m) => m.MainLayoutComponent
      ),
    canActivate: [AuthGuard,KycGuard],
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
        path: 'terminals',
        component: PaymentTerminalsComponent,
      },
      {
        path: 'wallets',
        component: MerchantWalletsComponent,
      },
      {
        path: 'kyc',
        component: KycComponent,
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
      {
        path: 'tickets',
        component: TicketManagementComponent,
      },
      { 
        path: 'payroll', 
        component: PayrollListComponent
      },
      {
        path: 'payroll/create',
        component: CreatePayrollComponent
      },
      {
        path: 'payroll/:id',
        component: PayrollDetailComponent
      },
      {
        path: 'payroll/:id/approve',
        component: PayrollDetailComponent
      },
      {
        path: 'recipients',
        component: RecipientListComponent
      },
      { 
        path: 'payment-links', 
        component: PaymentLinkGeneratorComponent 
      },
      {
        path: 'payment-links-list',
        component: PaymentLinksPageComponent,
      },

      {
        path: 'recipient/create',
        component: RecipientFormComponent
      },
      {
        path: 'recipient/edit/:id',
        component: RecipientFormComponent
      },
      {
        path: 'authorizers',
        component: AuthorizersListComponent,
      },
      {
        path: 'documentation',
        component: DocumentationComponent,
      },
      {
        path: 'help',
        component: HelpComponent,
      },
      {
        path: 'recurring',
        component: RecurringPayrollListComponent
      },
      {
        path: 'recurring/create',
        component: CreateRecurringPayrollComponent
      },
      {
        path: 'recurring/:id',
        component: RecurringPayrollDetailComponent
      },
      {
        path: 'upcoming',
        component: UpcomingPayrollRunsComponent
      },
      // Add other child routes here
      { path: '', redirectTo: 'wallets', pathMatch: 'full' },
    ],
  },
  { path: '**', redirectTo: 'wallets' },
];
