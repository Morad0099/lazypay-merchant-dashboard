import { CommonModule } from "@angular/common";
import { HttpClient } from "@angular/common/http";
import { Component } from "@angular/core";
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from "@angular/forms";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import { Router, RouterModule } from "@angular/router";
import { AdminService } from "../../../service/admin.service";

@Component({
    selector: 'app-register',
    templateUrl: './register.component.html',
    styleUrls: ['./register.component.css'],
      standalone: true,
      imports: [
        CommonModule,
        ReactiveFormsModule,
        MatFormFieldModule,
        MatInputModule,
        RouterModule
      ],
})

export class RegisterComponent {
    signupForm: FormGroup;
    showPassword = false;
    loading = false;
  
    constructor(
      private fb: FormBuilder,
      private http: HttpClient,
      private router: Router,
      private adminService: AdminService
    ) {
      this.signupForm = this.fb.group({
        name: ['', Validators.required],
        phone: ['', Validators.required],
        email: ['', [Validators.required, Validators.email]],
        password: ['', Validators.required],
        address: ['', Validators.required],
      });
    }
  
    togglePasswordVisibility(event: Event) {
      event.preventDefault();
      this.showPassword = !this.showPassword;
    }
  
    signup() {
      if (this.signupForm.invalid) {
        return;
      }
  
      this.loading = true;
      const payload = this.signupForm.value;
  
      this.adminService.signup(payload).subscribe({
        next: (response) => {
          this.loading = false;
          this.router.navigate(['/auth/login']); 
        },
        error: (error) => {
          this.loading = false;
          console.error('Signup failed:', error);
        },
      });
    }
}