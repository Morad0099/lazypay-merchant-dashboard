import { Component, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from "@angular/forms";
import { AdminService } from "../../service/admin.service";
import { CommonModule } from "@angular/common";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import { Store } from "@ngxs/store";

@Component({
  selector: 'app-kyc',
  templateUrl: './kyc.component.html',
  styleUrls: ['./kyc.component.scss'],
  standalone: true,
  imports: [CommonModule, MatFormFieldModule, MatInputModule, FormsModule, ReactiveFormsModule]
})
export class KycComponent implements OnInit {
  activeTab: 'business' | 'contact' | 'documents' = 'business';
  merchantForm!: FormGroup;
  loading = false;
  uploadedDocuments: any[] = [];
  tabs: ('business' | 'contact' | 'documents')[] = ['business', 'contact', 'documents'];
    user: any;
  businessFields = [
    { label: 'Business Name', control: 'businessName' },
    { label: 'Email', control: 'email' },
    { label: 'Line of Business', control: 'lineOfBusiness' },
    { label: 'Registration Number', control: 'registrationNumber' },
    { label: 'Location', control: 'location' },
    { label: 'Telephone', control: 'telephone' }
  ];

  contactFields = [
    { label: 'Name', control: 'name' },
    { label: 'Email', control: 'email' },
    { label: 'Designation', control: 'designation' },
    { label: 'Telephone', control: 'telephone' }
  ];

  constructor(
    private fb: FormBuilder,
    private merchantService: AdminService,
    private store: Store
  ) {
    this.initForm();

    this.store.select(state => state.auth.user).subscribe(user => {
        this.user = user;
      });
  }

  ngOnInit() {
    this.loadLocalStorage();
  }

  initForm() {
    this.merchantForm = this.fb.group({
      businessInfo: this.fb.group({
        businessName: ['', Validators.required],
        lineOfBusiness: ['', Validators.required],
        location: ['', Validators.required],
        email: ['', [Validators.required, Validators.email]],
        registrationNumber: ['', Validators.required],
        telephone: ['', Validators.required]
      }),
      primaryContact: this.fb.group({
        name: ['', Validators.required],
        designation: ['', Validators.required],
        email: ['', [Validators.required, Validators.email]],
        telephone: ['', Validators.required]
      })
    });
  }

  setActiveTab(tab: 'business' | 'contact' | 'documents') {
    // Save current tab data before switching
    this.saveToLocalStorage();
    this.activeTab = tab;
  }

  saveToLocalStorage() {
    localStorage.setItem('kycData', JSON.stringify(this.merchantForm.value));
  }

  loadLocalStorage() {
    const savedData = localStorage.getItem('kycData');
    if (savedData) {
      this.merchantForm.patchValue(JSON.parse(savedData));
    }
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.uploadedDocuments.push({
          type: file.name,
          image: e.target.result
        });
      };
      reader.readAsDataURL(file);
    }
  }

  isAllTabsFilled(): boolean {
    return this.merchantForm.valid && this.uploadedDocuments.length > 0;
  }

  updateProfile() {
    if (this.isAllTabsFilled()) {
      this.loading = true;
      const formData = {
        ...this.merchantForm.value,
        documents: this.uploadedDocuments
      };

      this.merchantService.updateMerchant(this.user.merchantId._id, formData)
        .subscribe({
          next: () => {
            alert('Profile updated successfully');
            this.loading = false;
            localStorage.removeItem('kycData'); // Clear local storage on success
          },
          error: (error) => {
            console.error('Update error:', error);
            alert('Failed to update profile');
            this.loading = false;
          }
        });
    } else {
      alert('Please fill all fields in each tab before submitting.');
    }
  }
}
