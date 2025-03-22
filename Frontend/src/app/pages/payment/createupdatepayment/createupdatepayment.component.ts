import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { SelectModule } from 'primeng/select';
import { CardModule } from 'primeng/card';
import { MessageModule } from 'primeng/message';
import { Router, ActivatedRoute } from '@angular/router';
import { finalize, takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';

import { PaymentService } from '../../../shared/service/payment.service';
import { MessageService } from '../../../shared/service/message.service';
import { PaymentResponseDto, CreatePaymentDto, UpdatePaymentDto } from '../model/payment.dto';
import { PaymentMethod, PaymentStatus } from '../../../shared/enums/app-enums';

@Component({
  selector: 'app-create-update-payment',
  standalone: true,
  imports: [
    CommonModule,
    ButtonModule,
    FormsModule,
    InputTextModule,
    InputNumberModule,
    SelectModule,
    CardModule,
    MessageModule,
    ReactiveFormsModule
  ],
  templateUrl: './createupdatepayment.component.html',
  styleUrls: ['./createupdatepayment.component.scss']
})
export class CreateUpdatePaymentComponent implements OnInit, OnDestroy {
  @Input() payment?: PaymentResponseDto;

  paymentForm!: FormGroup;
  isUpdateMode = false;
  loading = false;
  paymentId = '';
  methods = Object.values(PaymentMethod).map(method => ({
    label: method.replace('_', ' '),
    value: method
  }));
  statuses = Object.values(PaymentStatus).map(status => ({
    label: status.replace('_', ' '),
    value: status
  }));

  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private paymentService: PaymentService,
    private messageService: MessageService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.handleRouteParams();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private handleRouteParams(): void {
    this.route.params
      .pipe(takeUntil(this.destroy$))
      .subscribe(params => {
        if (params['id']) {
          this.paymentId = String(params['id']);
          this.loadPaymentData(this.paymentId);
        } else if (this.payment) {
          this.isUpdateMode = true;
          this.initForm();
        } else {
          this.initForm();
        }
      });
  }

  private loadPaymentData(paymentId: string): void {
    this.loading = true;
    this.paymentService.getPaymentById(paymentId)
      .pipe(takeUntil(this.destroy$), finalize(() => this.loading = false))
      .subscribe({
        next: (response) => {
          this.payment = response.data;
          this.isUpdateMode = true;
          this.initForm();
          this.messageService.showInfo('Payment Data Loaded', 'Payment information has been successfully loaded.');
        },
        error: (error: any) => {
          const errorMsg = error.error?.message || error.message || 'Failed to load payment data';
          this.messageService.showError('Error', errorMsg);
          console.error('Error loading payment:', error);
        }
      });
  }

  initForm(): void {
    this.paymentForm = this.fb.group({
      orderId: [this.payment?.orderId || '', Validators.required],
      amount: [this.payment?.amount || 0, [Validators.required, Validators.min(0)]],
      method: [this.payment?.method || '', Validators.required],
      status: [this.payment?.status || PaymentStatus.PENDING] // Default status
    });
  }

  onSubmit(): void {
    if (this.paymentForm.invalid) {
        this.messageService.showWarning('Validation Error', 'Please fill in all required fields correctly.');
        return;
      }

      this.loading = true;

      if (this.isUpdateMode) {
        const updateData: UpdatePaymentDto = {
          status: this.paymentForm.get('status')?.value
        };

        this.paymentService.updatePaymentById(this.paymentId, updateData)
          .pipe(finalize(() => this.loading = false))
          .subscribe({
            next: () => {
              this.messageService.showSuccess('Success', 'Payment updated successfully!');
              this.router.navigate(['/payments']); // Redirect to payments list
            },
            error: (error: any) => {
              const errorMsg = error.error?.message || error.message || 'Failed to update payment';
              this.messageService.showError('Error', errorMsg);
              console.error('Error updating payment:', error);
            }
          });
      } else {
        const createData: CreatePaymentDto = {
          orderId: this.paymentForm.get('orderId')?.value,
          amount: this.paymentForm.get('amount')?.value,
          method: this.paymentForm.get('method')?.value
        };

        this.paymentService.createPayment(createData)
          .pipe(finalize(() => this.loading = false))
          .subscribe({
            next: () => {
              this.messageService.showSuccess('Success', 'Payment created successfully!');
              this.paymentForm.reset();
              this.initForm(); // Reset with default values
              this.router.navigate(['/payments']); // Redirect to payments list
            },
            error: (error: any) => {
              const errorMsg = error.error?.message || error.message || 'Failed to create payment';
              this.messageService.showError('Error', errorMsg);
              console.error('Error creating payment:', error);
            }
          });
      }
    }
  }
