// upcoming-payroll-runs.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { RecurringPayrollService } from '../../service/recurring-payroll.service';
import { UpcomingPayrollRun } from '../../models/recurring-payroll.model';

@Component({
  selector: 'app-upcoming-payroll-runs',
  templateUrl: './upcoming-payroll-runs.component.html',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule
  ],
  styleUrls: ['./upcoming-payroll-runs.component.scss']
})
export class UpcomingPayrollRunsComponent implements OnInit {
  upcomingRuns: UpcomingPayrollRun[] = [];
  loading = false;
  error = '';
  days = 30; // Default to next 30 days
  
  // Getting merchantId from localStorage
  merchantId: string = '';
  
  constructor(
    private recurringPayrollService: RecurringPayrollService
  ) {}

  ngOnInit(): void {
    this.getMerchantIdFromLocalStorage();
    if (this.merchantId) {
      this.loadUpcomingRuns();
    }
  }
  
  getMerchantIdFromLocalStorage(): void {
    const loginStr = localStorage.getItem('PLOGIN');
    if (loginStr) {
      try {
        const login = JSON.parse(loginStr);
        if (login && login.user && login.user.merchantId && login.user.merchantId._id) {
          this.merchantId = login.user.merchantId._id;
          console.log("Merchant ID retrieved from localStorage:", this.merchantId);
        } else {
          this.error = 'Merchant ID not found in user data';
          console.error("Failed to find merchantId in login object:", login);
        }
      } catch (e) {
        this.error = 'Failed to parse login data from localStorage';
        console.error("Error parsing localStorage login data:", e);
      }
    } else {
      this.error = 'Login data not found in localStorage';
      console.error("No PLOGIN data in localStorage");
    }
  }
  
  loadUpcomingRuns(): void {
    this.loading = true;
    
    this.recurringPayrollService.getUpcomingPayrollRuns(this.merchantId, this.days)
      .subscribe({
        next: (response) => {
          this.upcomingRuns = response.data;
          this.loading = false;
        },
        error: (error) => {
          this.error = error.error?.message || 'Failed to load upcoming payroll runs';
          this.loading = false;
        }
      });
  }
  
  changeDays(event: Event): void {
    const target = event.target as HTMLSelectElement;
    this.days = parseInt(target.value);
    this.loadUpcomingRuns();
  }
  
  calculateDaysFromNow(date: string | Date): number {
    const now = new Date();
    const scheduledDate = new Date(date);
    const diffTime = scheduledDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0; // Ensure we don't return negative days
  }
  
  getFrequencyLabel(frequency: string): string {
    switch (frequency) {
      case 'DAILY':
        return 'Daily';
      case 'WEEKLY':
        return 'Weekly';
      case 'BIWEEKLY':
        return 'Bi-weekly';
      case 'MONTHLY':
        return 'Monthly';
      case 'QUARTERLY':
        return 'Quarterly';
      case 'ANNUALLY':
        return 'Annually';
      default:
        return frequency;
    }
  }
}