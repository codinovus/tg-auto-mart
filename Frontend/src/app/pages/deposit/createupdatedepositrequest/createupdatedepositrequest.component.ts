import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl } from '@angular/forms';
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

import { PaymentStatus } from '../../../shared/enums/app-enums';
import { DepositRequestResponseDto, CreateDepositRequestDto, UpdateDepositRequestDto } from '../model/deposit-request.dto';
import { DepositRequestService } from '../../../shared/service/deposit-request.service';
import { MessageService } from '../../../shared/service/message.service';
import { UserService } from '../../../shared/service/user.service';

@Component({
  selector: 'app-createupdatedepositrequest',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ButtonModule,
    InputTextModule,
    InputNumberModule,
    SelectModule,
    CardModule,
    MessageModule
  ],
  templateUrl: './createupdatedepositrequest.component.html',
  styleUrl: './createupdatedepositrequest.component.scss'
})
export class CreateupdatedepositrequestComponent implements OnInit, OnDestroy {
  @Input() depositRequest?: DepositRequestResponseDto;

  depositRequestForm!: FormGroup;
  users: any[] = [];
  statuses: any[] = [];
  isUpdateMode = false;
  submitted = false;
  loading = false;
  depositRequestId = '';

  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private depositRequestService: DepositRequestService,
    private userService: UserService,
    private messageService: MessageService,
    private router: Router,
    private route: ActivatedRoute
  ) { }

  ngOnInit(): void {
    this.initStatusOptions();
    this.loadUsers();
    this.handleRouteParams();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initStatusOptions(): void {
    this.statuses = Object.values(PaymentStatus).map(status => ({
      label: status.replace('_', ' '),
      value: status
    }));
  }

  private loadUsers(): void {
    this.userService.getAllUsers()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.users = response.data.map(user => ({
            label: user.username || user.id,
            value: user.id
          }));
        },
        error: (error: any) => {
          const errorMsg = error.error?.message || error.message || 'Failed to load users';
          this.messageService.showError('Error', errorMsg);
          console.error('Error loading users:', error);
        }
      });
  }

  private handleRouteParams(): void {
    this.route.params
      .pipe(takeUntil(this.destroy$))
      .subscribe(params => {
        if (params['id']) {
          this.depositRequestId = String(params['id']);
          this.loadDepositRequestData(this.depositRequestId);
        } else if (this.depositRequest) {
          this.isUpdateMode = true;
          this.depositRequestId = String(this.depositRequest.id);
          this.initForm();
        } else {
          this.initForm();
        }
      });
  }

  loadDepositRequestData(depositRequestId: string): void {
    this.loading = true;
    this.depositRequestService.getDepositRequestById(depositRequestId)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.loading = false)
      )
      .subscribe({
        next: (response) => {
          this.depositRequest = response;
          this.isUpdateMode = true;
          this.initForm();
          this.messageService.showInfo('Deposit Request Data Loaded', 'Deposit request information has been successfully loaded.');
        },
        error: (error: any) => {
          const errorMsg = error.error?.message || error.message || 'Failed to load deposit request data';
          this.messageService.showError('Error', errorMsg);
          console.error('Error loading deposit request:', error);
        }
      });
  }

  initForm(): void {
    this.depositRequestForm = this.fb.group({
      userId: [this.depositRequest?.userId || '', this.isUpdateMode ? { disabled: true } : [Validators.required]],
      amount: [this.depositRequest?.amount || 0, [Validators.required, Validators.min(1)]],
      paymentLink: [this.depositRequest?.paymentLink || '', [Validators.required]],
      status: [this.depositRequest?.status || PaymentStatus.PENDING, this.isUpdateMode ? [Validators.required] : { disabled: true }]
    });

    // In update mode, only status can be modified
    if (this.isUpdateMode) {
      this.depositRequestForm.get('amount')?.disable();
      this.depositRequestForm.get('paymentLink')?.disable();
    }
  }

  onSubmit(): void {
    this.submitted = true;

    if (this.depositRequestForm.invalid) {
      this.messageService.showWarning('Validation Error', 'Please fill in all required fields correctly.');
      return;
    }

    this.loading = true;

    if (this.isUpdateMode) {
      const updateData: UpdateDepositRequestDto = {
        status: this.depositRequestForm.get('status')?.value
      };

      this.depositRequestService.updateDepositRequestById(this.depositRequestId, updateData)
        .pipe(finalize(() => this.loading = false))
        .subscribe({
          next: () => {
            this.messageService.showSuccess('Success', 'Deposit request updated successfully!');
          },
          error: (error: any) => {
            const errorMsg = error.error?.message || error.message || 'Failed to update deposit request';
            this.messageService.showError('Error', errorMsg);
            console.error('Error updating deposit request:', error);
          }
        });
    } else {
      const createData: CreateDepositRequestDto = {
        userId: this.depositRequestForm.get('userId')?.value,
        amount: this.depositRequestForm.get('amount')?.value,
        paymentLink: this.depositRequestForm.get('paymentLink')?.value
      };

      this.depositRequestService.createDepositRequest(createData)
        .pipe(finalize(() => this.loading = false))
        .subscribe({
          next: () => {
            this.messageService.showSuccess('Success', 'Deposit request created successfully!');
            this.depositRequestForm.reset();
            this.submitted = false;
            this.initForm(); // Reset with default values
          },
          error: (error: any) => {
            const errorMsg = error.error?.message || error.message || 'Failed to create deposit request';
            this.messageService.showError('Error', errorMsg);
            console.error('Error creating deposit request:', error);
          }
        });
    }
  }

  get userIdControl(): AbstractControl | null {
    return this.depositRequestForm.get('userId');
  }

  get amountControl(): AbstractControl | null {
    return this.depositRequestForm.get('amount');
  }

  get paymentLinkControl(): AbstractControl | null {
    return this.depositRequestForm.get('paymentLink');
  }

  get statusControl(): AbstractControl | null {
    return this.depositRequestForm.get('status');
  }
}
