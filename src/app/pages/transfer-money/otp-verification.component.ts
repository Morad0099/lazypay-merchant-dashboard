// otp-verification.component.ts
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

export interface OtpVerificationOutput {
    otp: string;
    type: 'verify' | 'resend';
  }
@Component({
  selector: 'app-otp-verification',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="p-4">
      <!-- OTP Input -->
      <form [formGroup]="otpForm" (ngSubmit)="onSubmit()">
        <div class="form-group">
          <label class="block text-sm font-semibold text-gray-700 mb-2">Enter OTP</label>
          <input
            type="text"
            formControlName="otp"
            maxlength="6"
            class="w-full h-14 px-4 text-center text-lg tracking-widest border-2 border-gray-200 rounded-xl focus:outline-none focus:border-purple-500"
            placeholder="Enter OTP"
          />
        </div>

        <!-- Submit Button -->
        <!-- <button
          type="submit"
          [disabled]="!otpForm.valid || isSubmitting"
          class="w-full h-14 mt-4 bg-purple-600 text-white rounded-xl hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {{ isSubmitting ? 'Verifying...' : 'Verify OTP' }}
        </button> -->

        <!-- Resend Timer -->
        <div class="mt-4 text-center">
          <ng-container *ngIf="timer > 0; else resendButton">
            <span class="text-sm text-gray-500">
              <i class="material-icons align-middle text-sm">timer</i>
              Resend in {{timer}}s
            </span>
          </ng-container>
          <ng-template #resendButton>
            <button
              type="button"
              (click)="resendOtp()"
              class="text-purple-600 hover:text-purple-700 text-sm"
            >
              Resend OTP
            </button>
          </ng-template>
        </div>
      </form>
    </div>
  `
})
export class OtpVerificationComponent {
  @Output() verify = new EventEmitter<string>();
  @Output() resend = new EventEmitter<void>();
  @Output() action = new EventEmitter<OtpVerificationOutput>();


  otpForm: FormGroup;
  isSubmitting = false;
  timer = 30;
  private timerInterval: any;

  constructor(private fb: FormBuilder) {
    this.otpForm = this.fb.group({
      otp: ['', [Validators.required, Validators.minLength(6)]]
    });
    this.startTimer();
  }

  @Input() set otpValue(value: string) {
    if (this.otpForm) {
      this.otpForm.get('otp')?.patchValue(value, { emitEvent: false });
    }
  }

  @Output() otpChange = new EventEmitter<string>();

  ngOnInit() {
    this.otpForm.get('otp')?.valueChanges.subscribe(value => {
      if (value?.length === 6) {
        this.otpChange.emit(value);
      }
    });
  }


  // Get the current OTP value
  get otpValue(): string {
    return this.otpForm.get('otp')?.value || '';
  }

  onSubmit() {
    if (this.otpForm.valid) {
      this.isSubmitting = true;
      this.verify.emit(this.otpForm.get('otp')?.value);
    }
  }

  resendOtp() {
    this.resend.emit();
    this.timer = 30;
    this.startTimer();
  }

  private startTimer() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }
    
    this.timerInterval = setInterval(() => {
      if (this.timer > 0) {
        this.timer--;
      } else {
        clearInterval(this.timerInterval);
      }
    }, 1000);
  }

  ngOnDestroy() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }
  }
}