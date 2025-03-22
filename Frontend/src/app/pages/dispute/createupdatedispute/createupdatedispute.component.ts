import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { SelectModule } from 'primeng/select';
import { CardModule } from 'primeng/card';
import { MessageModule } from 'primeng/message';
import { Router, ActivatedRoute } from '@angular/router';
import { finalize, takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';

import { DisputeStatus } from '../../../shared/enums/app-enums';
import { DisputeResponseDto, CreateDisputeDto, UpdateDisputeDto } from '../model/dispute.dto';
import { DisputeService } from '../../../shared/service/dispute.service';
import { MessageService } from '../../../shared/service/message.service';
import { UserService } from '../../../shared/service/user.service';
import { OrderService } from '../../../shared/service/order.service';

@Component({
  selector: 'app-createupdatedispute',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ButtonModule,
    InputTextModule,
    SelectModule,
    CardModule,
    MessageModule,
    TextareaModule
  ],
  templateUrl: './createupdatedispute.component.html',
  styleUrl: './createupdatedispute.component.scss'
})
export class CreateupdatedisputeComponent implements OnInit, OnDestroy {
  @Input() dispute?: DisputeResponseDto;

  disputeForm!: FormGroup;
  users: any[] = [];
  orders: any[] = [];
  statuses: any[] = [];
  isUpdateMode = false;
  submitted = false;
  loading = false;
  disputeId = '';

  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private disputeService: DisputeService,
    private userService: UserService,
    private orderService: OrderService,
    private messageService: MessageService,
    private router: Router,
    private route: ActivatedRoute
  ) { }

  ngOnInit(): void {
    this.initStatusOptions();
    this.loadUsers();
    this.loadOrders();
    this.handleRouteParams();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initStatusOptions(): void {
    this.statuses = Object.values(DisputeStatus).map(status => ({
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
            label: user.username || user.telegramId || user.id,
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

  private loadOrders(): void {
    this.orderService.getAllOrders()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.orders = response.data.map(order => ({
            label: `Order #${order.id.substring(0, 8)}`,
            value: order.id
          }));
        },
        error: (error: any) => {
          const errorMsg = error.error?.message || error.message || 'Failed to load orders';
          this.messageService.showError('Error', errorMsg);
          console.error('Error loading orders:', error);
        }
      });
  }

  private handleRouteParams(): void {
    this.route.params
      .pipe(takeUntil(this.destroy$))
      .subscribe(params => {
        if (params['id']) {
          this.disputeId = String(params['id']);
          this.loadDisputeData(this.disputeId);
        } else if (this.dispute) {
          this.isUpdateMode = true;
          this.disputeId = String(this.dispute.id);
          this.initForm();
        } else {
          this.initForm();
        }
      });
  }

  loadDisputeData(disputeId: string): void {
    this.loading = true;
    this.disputeService.getDisputeById(disputeId)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.loading = false)
      )
      .subscribe({
        next: (response) => {
          this.dispute = response.data;
          this.isUpdateMode = true;
          this.initForm();
          this.messageService.showInfo('Dispute Data Loaded', 'Dispute information has been successfully loaded.');
        },
        error: (error: any) => {
          const errorMsg = error.error?.message || error.message || 'Failed to load dispute data';
          this.messageService.showError('Error', errorMsg);
          console.error('Error loading dispute:', error);
        }
      });
  }

  initForm(): void {
    this.disputeForm = this.fb.group({
      userId: [this.dispute?.userId || '', this.isUpdateMode ? { disabled: true } : [Validators.required]],
      orderId: [this.dispute?.orderId || '', this.isUpdateMode ? { disabled: true } : [Validators.required]],
      reason: [this.dispute?.reason || '', this.isUpdateMode ? { disabled: true } : [Validators.required, Validators.minLength(10)]],
      status: [this.dispute?.status || DisputeStatus.PENDING, this.isUpdateMode ? [Validators.required] : { disabled: true }],
      resolution: [this.dispute?.resolution || '', this.isUpdateMode ? [] : { disabled: true }]
    });
  }

  onSubmit(): void {
    this.submitted = true;

    if (this.disputeForm.invalid) {
      this.messageService.showWarning('Validation Error', 'Please fill in all required fields correctly.');
      return;
    }

    this.loading = true;

    if (this.isUpdateMode) {
      const updateData: UpdateDisputeDto = {
        status: this.disputeForm.get('status')?.value,
        resolution: this.disputeForm.get('resolution')?.value
      };

      this.disputeService.updateDisputeById(this.disputeId, updateData)
        .pipe(finalize(() => this.loading = false))
        .subscribe({
          next: () => {
            this.messageService.showSuccess('Success', 'Dispute updated successfully!');
          },
          error: (error: any) => {
            const errorMsg = error.error?.message || error.message || 'Failed to update dispute';
            this.messageService.showError('Error', errorMsg);
            console.error('Error updating dispute:', error);
          }
        });
    } else {
        const createData: CreateDisputeDto = {
          userId: this.disputeForm.get('userId')?.value,
          orderId: this.disputeForm.get('orderId')?.value,
          reason: this.disputeForm.get('reason')?.value
        };

        this.disputeService.createDispute(createData)
          .pipe(finalize(() => this.loading = false))
          .subscribe({
            next: () => {
              this.messageService.showSuccess('Success', 'Dispute created successfully!');
              this.disputeForm.reset();
              this.submitted = false;
              this.initForm(); // Reset with default values
            },
            error: (error: any) => {
              const errorMsg = error.error?.message || error.message || 'Failed to create dispute';
              this.messageService.showError('Error', errorMsg);
              console.error('Error creating dispute:', error);
            }
          });
      }
    }

    get userIdControl(): AbstractControl | null {
      return this.disputeForm.get('userId');
    }

    get orderIdControl(): AbstractControl | null {
      return this.disputeForm.get('orderId');
    }

    get reasonControl(): AbstractControl | null {
      return this.disputeForm.get('reason');
    }

    get statusControl(): AbstractControl | null {
      return this.disputeForm.get('status');
    }

    get resolutionControl(): AbstractControl | null {
      return this.disputeForm.get('resolution');
    }

    getStatusSeverity(status: string): string {
      switch (status) {
        case DisputeStatus.PENDING:
          return 'warning';
        case DisputeStatus.RESOLVED:
          return 'success';
        case DisputeStatus.REJECTED:
          return 'danger';
        default:
          return 'secondary';
      }
    }
  }
