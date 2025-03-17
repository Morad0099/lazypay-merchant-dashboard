// recipient-list.component.ts
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RecipientService } from '../../service/recipient.service';
import { Recipient, PaymentAccountType } from '../../models/recipient.model';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-recipient-list',
  templateUrl: './recipient-list.component.html',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    RouterModule
  ],
  styleUrls: ['./recipient-list.component.scss']
})
export class RecipientListComponent implements OnInit {
  recipients: Recipient[] = [];
  loading = false;
  error = '';
  
  // Pagination
  currentPage = 1;
  pageSize = 20;
  totalItems = 0;
  totalPages = 0;
  
  // Filters
  filterForm: FormGroup;
  departments: string[] = []; // Will be populated from unique departments
  
  // Getting merchantId from localStorage
  merchantId: string = '';
  
  constructor(
    private recipientService: RecipientService,
    private fb: FormBuilder,
    private router: Router
  ) {
    this.filterForm = this.fb.group({
      isActive: [''],
      department: ['']
    });
    
    // Get merchantId from localStorage
    this.getMerchantIdFromLocalStorage();
  }

  ngOnInit(): void {
    if (this.merchantId) {
      this.loadRecipients();
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

  loadRecipients(): void {
    if (!this.merchantId) {
      this.error = 'Merchant ID is required';
      return;
    }
    
    this.loading = true;
    const filters = this.filterForm.value;
    
    this.recipientService.getRecipients(
      this.merchantId,
      this.currentPage,
      this.pageSize,
      filters.isActive === 'true' ? true : 
      filters.isActive === 'false' ? false : undefined,
      filters.department
    ).subscribe({
      next: (response) => {
        this.recipients = response.data;
        this.totalItems = response.meta.total;
        this.totalPages = response.meta.pages;
        this.loading = false;
        
        // Extract unique departments for filter dropdown
        this.extractDepartments();
      },
      error: (error) => {
        this.error = error.error?.message || 'Failed to load recipients';
        this.loading = false;
      }
    });
  }

  extractDepartments(): void {
    const departmentSet = new Set<string>();
    
    this.recipients.forEach(recipient => {
      if (recipient.department) {
        departmentSet.add(recipient.department);
      }
    });
    
    this.departments = Array.from(departmentSet).sort();
  }

  applyFilters(): void {
    this.currentPage = 1;
    this.loadRecipients();
  }

  resetFilters(): void {
    this.filterForm.reset({
      isActive: '',
      department: ''
    });
    this.currentPage = 1;
    this.loadRecipients();
  }

  changePage(page: number): void {
    this.currentPage = page;
    this.loadRecipients();
  }

  createRecipient(): void {
    this.router.navigate(['/recipient/create']);
  }

  editRecipient(id: string): void {
    this.router.navigate(['/recipient/edit', id]);
  }

  getAccountTypeLabel(type: PaymentAccountType): string {
    switch (type) {
      case PaymentAccountType.BANK:
        return 'Bank Account';
      case PaymentAccountType.MOMO:
        return 'Mobile Money';
      // case PaymentAccountType.CARD:
      //   return 'Card';
      default:
        return type;
    }
  }
}