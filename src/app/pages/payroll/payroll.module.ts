// payroll.module.ts
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

// Components
import { PayrollListComponent } from './payroll-list.component';

// Services
import { PayrollService } from '../../service/payroll.service';

@NgModule({
  declarations: [
    // PayrollListComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    RouterModule
  ],
  providers: [
    PayrollService
  ]
})
export class PayrollModule { }