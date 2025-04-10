import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Store } from '@ngxs/store';
import { AdminService } from '../../../service/admin.service';
import { AdminLogin } from '../../../auth/auth.action';
import { MatDialog } from '@angular/material/dialog';
import { AlertComponent } from '../../../components/alert/alert.component';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    RouterModule
  ],
})
export class LoginComponent implements OnInit {
  formGroup: FormGroup;
  loading: boolean = false;
  triggerOtp: boolean = false;
  validatedEmail: string = '';
  buttonOperation: string = 'Send Otp';
  showPassword: boolean = false;

  constructor(
    private service: AdminService,
    private store: Store,
    private fb: FormBuilder,
    private dialog: MatDialog,
    private router: Router
  ) {
    this.formGroup = this.fb.group({
      email: [null, [Validators.required, Validators.email]],
      password: [null, Validators.required],
      otp: [null, Validators.required],
    });
  }
  ngOnInit(): void {
    // Initialize any necessary data or state here
    this.formGroup.reset();
  }

  login() {
    const form = this.formGroup;
    if (!form.get('email')?.valid || !form.get('password')?.valid) return;

    const { email, password } = form.value;
    this.loading = true;

    this.service.sendotp({ email }).subscribe({
      next: () => {
        this.validatedEmail = email;
        this.buttonOperation = 'Log In';
        this.triggerOtp = true;
      },
      error: (err) => {
        this.showError('Failed to send OTP: ' + err.message);
      },
      complete: () => {
        this.loading = false;
      },
    });
  }

  togglePasswordVisibility(event: Event): void {
    // Prevent form submission if button is inside form
    event.preventDefault();

    // Toggle password visibility
    this.showPassword = !this.showPassword;

    // Get the password input element
    const passwordInput = document.getElementById(
      'password'
    ) as HTMLInputElement;

    // Maintain focus on the input field for better UX
    if (passwordInput) {
      const cursorPosition = passwordInput.selectionStart;
      passwordInput.focus();
      // Wait for next tick to set cursor position
      setTimeout(() => {
        passwordInput.setSelectionRange(cursorPosition, cursorPosition);
      }, 0);
    }
  }

  confirmOtp() {
    const form = this.formGroup;
    if (!form.get('otp')?.valid) return;
  
    const { email, password, otp } = form.value;
    this.loading = true;
  
    this.service.login({ email, password, otp }).subscribe({
      next: (response) => {
        if (!response.success) {
          this.showError(response.message || 'Login failed');
          this.loading = false;
          return;
        }
  
        // Handle store dispatch with proper error catching
        try {
          const merchant = response.data?.merchantId;
          this.store.dispatch(new AdminLogin({
            user: response.data,
            token: response.token,
            refreshToken: response.refreshToken
          })).subscribe({
            next: () => {
              this.loading = false;
              
              if (!merchant || !merchant.active || !merchant.submitted) {
                setTimeout(() => {
                  this.router.navigate(['/kyc']);
                  console.log('Navigation success:');
                }, 0);
              } else {
                this.router.navigate(['/payment-reconciliation']);
              }
            },
            error: (err) => {
              console.error('Store dispatch error:', err);
              this.showError('Failed to save login state');
              this.loading = false;
            }
          });
          
        } catch (error) {
          console.error('Login error:', error);
          this.showError('An unexpected error occurred');
          this.loading = false;
        }
      },
      error: (err) => {
        console.error('Login request error:', err);
        this.showError('Login failed: ' + (err.message || 'Unknown error'));
        this.loading = false;
      }
    });
  }

  private showError(message: string): void {
    this.dialog.open(AlertComponent, {
      data: { title: 'Error', message },
    });
    this.loading = false;
  }
}
