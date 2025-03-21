import { Component, OnInit } from '@angular/core';
import { Logout } from '../../auth/auth.action';
import { Store } from '@ngxs/store';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

export interface RouteInfo {
  class:
    | string
    | string[]
    | Set<string>
    | { [klass: string]: any }
    | null
    | undefined;
  path: string;
  title: string;
}

export const Routes: RouteInfo[] = [
  // { path: 'payment-reconciliation', title: 'Payment Reconciliation', class: 'red' },
  { path: 'wallets', title: 'Wallets', class: 'false' },
  { path: 'hub', title: 'Hub', class: 'false' },
  { path: 'profile', title: 'Profile', class: 'false' },
  { path: 'users', title: 'Users', class: 'false' },
  { path: 'reports', title: 'Reports', class: 'false' },
  { path: 'settlements', title: 'Settlements', class: 'false' },
  { path: 'transfer', title: 'Transfer', class: 'false' },
  { path: 'transaction', title: 'Transaction Filters', class: 'false' },
  { path: 'payroll', title: 'Payroll', class: 'false' },
  { path: 'recipients', title: 'Recipients', class: 'false' },
  { path: 'recurring', title: 'Recurring Payroll', class: 'false' },
  { path: 'upcoming', title: 'Upcoming Payroll Runs', class: 'false' },
  // { path: 'payment-links', title: 'Payment Links', class: 'false' },
  { path: 'payment-links-list', title: 'Payment Links List', class: 'false' },
  { path: 'kyc', title: 'KYC', class: 'false' },
];

@Component({
  selector: 'app-side-bar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './side-bar.component.html',
  styleUrls: ['./side-bar.component.css'],
})
export class SidebarComponent implements OnInit {
  menuItems: RouteInfo[] = Routes;
  user_permissions: string[] = ['Admin']; // Example permissions
  user_name: string = 'John Doe'; // Example user name
  isCollapsed: boolean = false;
  isMobile: boolean = false;
  user: any; // To store user data
  isKycOnly: boolean = false;

  constructor(private store: Store, public router: Router) {
    this.checkScreenSize();

    this.store.select(state => state.auth.user).subscribe(user => {
      this.user = user;
      if (user?.merchantId) {
        this.isKycOnly = !user.merchantId.active || !user.merchantId.submitted;
      }
    });
  }

  ngOnInit(): void {
    this.setupEventListeners();
    this.menuItems = this.filterMenuItems(Routes);
  }

  private filterMenuItems(routes: RouteInfo[]): RouteInfo[] {
    if (this.isKycOnly) {
      // Only show KYC menu item if merchant is not active or not submitted
      return routes.filter(item => item.path === 'kyc');
    }
    let filteredItems = [...routes];
    const isAdmin =
      this.user_permissions.includes('Super Admin') ||
      this.user_permissions.includes('Admin');
    const isApprover = this.user_permissions.includes('Approver');

    if (!isAdmin) {
      filteredItems.splice(0, 1);
      if (!isApprover) {
        filteredItems = filteredItems.filter(
          (item) => item.path !== 'authorize'
        );
      } else {
        filteredItems = filteredItems.filter(
          (item) => item.path !== 'single-pay'
        );
      }
    }

    return filteredItems;
  }

  private setupEventListeners(): void {
    window.addEventListener('resize', this.handleResize.bind(this));
  }

  private handleResize(): void {
    this.checkScreenSize();
    if (this.isMobile) {
      this.isCollapsed = true;
    }
  }

  private checkScreenSize(): void {
    this.isMobile = window.innerWidth <= 991.98;
  }

  toggleSidebar(): void {
    this.isCollapsed = !this.isCollapsed;
    localStorage.setItem(
      'sidebarState',
      this.isCollapsed ? 'collapsed' : 'expanded'
    );
  }

  getMenuIcon(path: string): string {
    const iconMap: { [key: string]: string } = {
      // 'mechant': 'bi bi-speedometer2',
      hub: 'bi bi-bar-chart',
      profile: 'bi bi-person',
      users: 'bi bi-people',
      wallets: 'bi bi-wallet',

      // 'mechant': 'bi bi-shop',
      reports: 'bi bi-file-earmark-text',
      settlements: 'bi bi-cash',
      transfer: 'bi bi-currency-exchange',
      transaction: 'bi bi-filter',
      kyc: 'bi bi-person-badge',
      payroll: 'bi bi-file-earmark-text',
      recipients: 'bi bi-person-lines-fill',
      recurring: 'bi bi-calendar-event',
      upcoming: 'bi bi-calendar-event',
      'payment-links': 'bi bi-link-45deg',
      'payment-links-list': 'bi bi-list',
      // 'dashboard': 'bi bi-bar-chart',
    };

    return iconMap[path] || 'bi bi-circle';
  }

  logout(): void {
    if (confirm('Are you sure you want to logout?')) {
      this.store.dispatch(new Logout());
      this.router.navigate(['/login']);
    }
  }
}
