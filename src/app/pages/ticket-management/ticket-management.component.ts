// ticket-management.component.ts (updated to use TicketService)
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { finalize } from 'rxjs';
import { 
  TicketService, 
  Ticket, 
  TicketCategory, 
  TicketPriority, 
  TicketStatus 
} from '../../pages/ticket-management/ticket-management.service';

@Component({
  selector: 'app-ticket-management',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, HttpClientModule],
  templateUrl: './ticket-management.component.html',
  styleUrls: ['./ticket-management.component.css']
})
export class TicketManagementComponent implements OnInit {
  tickets: Ticket[] = [];
  filteredTickets: Ticket[] = [];
  selectedTicket: Ticket | null = null;
  
  ticketForm: FormGroup;
  commentForm: FormGroup;
  
  showNewTicketModal = false;
  showTicketDetailModal = false;
  
  isLoading = false;
  isSubmitting = false;
  error: string | null = null;
  success: string | null = null;
  
  searchTerm = '';
  statusFilter = 'all';
  
  ticketCategories = Object.values(TicketCategory);
  ticketPriorities = Object.values(TicketPriority);
  ticketStatuses = Object.values(TicketStatus);

  constructor(
    private fb: FormBuilder,
    private ticketService: TicketService
  ) {
    this.ticketForm = this.fb.group({
      category: [TicketCategory.PAYMENT, Validators.required],
      priority: [TicketPriority.MEDIUM, Validators.required],
      subject: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(100)]],
      description: ['', [Validators.required, Validators.minLength(10)]],
      transactionRef: ['']
    });

    this.commentForm = this.fb.group({
      text: ['', [Validators.required, Validators.minLength(1)]]
    });
  }

  ngOnInit(): void {
    this.loadTickets();
  }

  loadTickets(): void {
    this.isLoading = true;
    this.error = null;

    this.ticketService.getAllTickets().pipe(
      finalize(() => {
        this.isLoading = false;
      })
    ).subscribe(response => {
      if (response.success) {
        this.tickets = response.data;
        this.applyFilters();
      } else {
        this.error = response.message || 'Failed to load tickets';
      }
    });
  }

  openTicketDetail(ticket: Ticket): void {
    this.isLoading = true;
    this.error = null;
  
    this.ticketService.getTicketById(ticket._id).pipe(
      finalize(() => {
        this.isLoading = false;
      })
    ).subscribe({
      next: (response) => {
        if (response.success) {
          console.log('Ticket detail response:', response); // For debugging
          this.selectedTicket = response.data;
          this.showTicketDetailModal = true;
        } else {
          this.error = response.message || 'Failed to load ticket details';
        }
      },
      error: (error) => {
        console.error('Error loading ticket details:', error);
        this.error = 'Failed to load ticket details. Please try again.';
      }
    });
  }

  submitTicket(): void {
    if (this.ticketForm.invalid) return;

    this.isSubmitting = true;
    this.error = null;

    const userInfo = this.ticketService.getUserInfo();
    if (!userInfo) {
      this.error = 'User information not found. Please log in again.';
      this.isSubmitting = false;
      return;
    }

    const ticketData = {
      ...this.ticketForm.value,
      merchantId: userInfo.merchantId._id || userInfo.merchantId  // Handle both object and string formats
    };

    this.ticketService.createTicket(ticketData).pipe(
      finalize(() => {
        this.isSubmitting = false;
      })
    ).subscribe(response => {
      if (response.success) {
        this.success = 'Ticket created successfully';
        // Auto-hide success message after 5 seconds
        setTimeout(() => this.success = null, 5000);
        
        this.closeNewTicketModal();
        this.loadTickets();
      } else {
        this.error = response.message || 'Failed to create ticket';
      }
    });
  }

  addComment(): void {
    if (this.commentForm.invalid || !this.selectedTicket) return;

    this.isSubmitting = true;
    this.error = null;

    const userInfo = this.ticketService.getUserInfo();
    if (!userInfo) {
      this.error = 'User information not found. Please log in again.';
      this.isSubmitting = false;
      return;
    }

    const commentData = {
      text: this.commentForm.value.text,
      createdBy: userInfo._id,
      creatorType: 'merchants'
    };

    this.ticketService.addComment(this.selectedTicket._id, commentData).pipe(
      finalize(() => {
        this.isSubmitting = false;
      })
    ).subscribe(response => {
      if (response.success) {
        this.success = 'Comment added successfully';
        // Auto-hide success message after 5 seconds
        setTimeout(() => this.success = null, 5000);
        
        this.commentForm.reset();
        // Update the selected ticket with the new comment
        this.selectedTicket = response.data;
      } else {
        this.error = response.message || 'Failed to add comment';
      }
    });
  }

  openNewTicketModal(): void {
    this.ticketForm.reset({
      category: TicketCategory.PAYMENT,
      priority: TicketPriority.MEDIUM
    });
    this.showNewTicketModal = true;
  }

  closeNewTicketModal(): void {
    this.showNewTicketModal = false;
    this.ticketForm.reset({
      category: TicketCategory.PAYMENT,
      priority: TicketPriority.MEDIUM
    });
  }

  closeTicketDetailModal(): void {
    this.showTicketDetailModal = false;
    this.selectedTicket = null;
    this.commentForm.reset();
  }

  search(event: Event): void {
    const term = (event.target as HTMLInputElement).value;
    this.searchTerm = term.toLowerCase();
    this.applyFilters();
  }

  filterByStatus(status: string): void {
    this.statusFilter = status;
    this.applyFilters();
  }

  applyFilters(): void {
    this.filteredTickets = this.tickets.filter(ticket => {
      // Filter by search term
      const matchesSearch = 
        ticket.subject.toLowerCase().includes(this.searchTerm) ||
        ticket.description.toLowerCase().includes(this.searchTerm) ||
        (ticket.transactionRef && ticket.transactionRef.toLowerCase().includes(this.searchTerm));

      // Filter by status
      const matchesStatus = this.statusFilter === 'all' || ticket.status === this.statusFilter;

      return matchesSearch && matchesStatus;
    });
  }

  clearSearch(): void {
    this.searchTerm = '';
    this.applyFilters();
  }

  getStatusClass(status: TicketStatus | undefined): string {
    if (!status) return 'bg-gray-100 text-gray-800';
    
    switch (status) {
      case TicketStatus.OPEN:
        return 'bg-blue-100 text-blue-800';
      case TicketStatus.IN_PROGRESS:
        return 'bg-yellow-100 text-yellow-800';
      case TicketStatus.RESOLVED:
        return 'bg-green-100 text-green-800';
      case TicketStatus.CLOSED:
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

  getPriorityClass(priority: TicketPriority | undefined): string {
    if (!priority) return 'bg-gray-100 text-gray-800';
    
    switch (priority) {
      case TicketPriority.LOW:
        return 'bg-green-100 text-green-800';
      case TicketPriority.MEDIUM:
        return 'bg-yellow-100 text-yellow-800';
      case TicketPriority.HIGH:
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

  getCategoryClass(category: TicketCategory | undefined): string {
    if (!category) return 'bg-gray-100 text-gray-800';
    
    switch (category) {
      case TicketCategory.PAYMENT:
        return 'bg-purple-100 text-purple-800';
      case TicketCategory.VERIFICATION:
        return 'bg-indigo-100 text-indigo-800';
      case TicketCategory.TECHNICAL:
        return 'bg-cyan-100 text-cyan-800';
      case TicketCategory.OTHER:
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

  formatDate(date: Date | undefined): string {
    if (!date) return 'N/A';
    return new Date(date).toLocaleString();
  }
}