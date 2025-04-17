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

import { TransactionType, PaymentStatus } from '../../../shared/enums/app-enums';
import { TransactionResponseDto, CreateTransactionDto, UpdateTransactionDto } from '../model/transaction.dto';
import { TransactionService } from '../../../shared/service/transaction.service';
import { WalletService } from '../../../shared/service/wallet.service';
import { UserService } from '../../../shared/service/user.service';
import { OrderService } from '../../../shared/service/order.service';
import { DepositRequestService } from '../../../shared/service/deposit-request.service';
import { MessageService } from '../../../shared/service/message.service';
import { TextareaModule } from 'primeng/textarea';

@Component({
  selector: 'app-createupdatetransaction',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ButtonModule,
    InputTextModule,
    InputNumberModule,
    SelectModule,
    CardModule,
    MessageModule,
    TextareaModule
  ],
  templateUrl: './createupdatetransaction.component.html',
  styleUrl: './createupdatetransaction.component.scss'
})
export class CreateupdatetransactionComponent implements OnInit, OnDestroy {
  @Input() transaction?: TransactionResponseDto;

  transactionForm!: FormGroup;
  transactionTypes: any[] = [];
  paymentStatuses: any[] = [];
  wallets: any[] = [];
  users: any[] = [];
  orders: any[] = [];
  depositRequests: any[] = [];
  isUpdateMode = false;
  submitted = false;
  loading = false;
  transactionId = '';

  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private transactionService: TransactionService,
    private walletService: WalletService,
    private userService: UserService,
    private orderService: OrderService,
    private depositRequestService: DepositRequestService,
    private messageService: MessageService,
    private router: Router,
    private route: ActivatedRoute
  ) { }

  ngOnInit(): void {
    this.initEnums();
    this.loadWallets();
    this.loadUsers();
    this.loadOrders();
    this.loadDepositRequests();
    this.handleRouteParams();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initEnums(): void {
    this.transactionTypes = Object.values(TransactionType).map(type => ({
      label: type.replace('_', ' '),
      value: type
    }));

    this.paymentStatuses = Object.values(PaymentStatus).map(status => ({
      label: status.replace('_', ' '),
      value: status
    }));
  }

  private loadWallets(): void {
    this.walletService.getAllWallets()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.wallets = response.data.map(wallet => ({label: wallet.id,
            value: wallet.id
          }));
        },
        error: (error) => {
          this.messageService.showError('Error', 'Failed to load wallets');
          console.error('Error loading wallets:', error);
        }
      });
  }

  private loadUsers(): void {
    this.userService.getAllUsers()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.users = response.data.map(user => ({
            label: user.username,
            value: user.id
          }));
        },
        error: (error) => {
          this.messageService.showError('Error', 'Failed to load users');
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
            label: order.id,
            value: order.id
          }));
        },
        error: (error) => {
          this.messageService.showError('Error', 'Failed to load orders');
          console.error('Error loading orders:', error);
        }
      });
  }

  private loadDepositRequests(): void {
    this.depositRequestService.getAllDepositRequests()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.depositRequests = response.data.map(request => ({
            label: request.id,
            value: request.id
          }));
        },
        error: (error) => {
          this.messageService.showError('Error', 'Failed to load deposit requests');
          console.error('Error loading deposit requests:', error);
        }
      });
  }

  private handleRouteParams(): void {
    this.route.params
      .pipe(takeUntil(this.destroy$))
      .subscribe(params => {
        if (params['id']) {
          this.transactionId = params['id'];
          this.isUpdateMode = true;
          this.loadTransaction();
        } else {
          this.isUpdateMode = false;
          this.initForm();
        }
      });
  }

  private loadTransaction(): void {
    this.transactionService.getTransactionById(this.transactionId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.transaction = response.data;
          this.initForm();
        },
        error: (error) => {
          this.messageService.showError('Error', 'Failed to load transaction');
          console.error('Error loading transaction:', error);
        }
      });
  }

  private initForm(): void {
    this.transactionForm = this.fb.group({
      walletId: [this.transaction?.walletId || '', Validators.required],
      userId: [this.transaction?.userId || '', Validators.required],
      amount: [this.transaction?.amount || null, [Validators.required, Validators.min(0)]],
      type: [this.transaction?.type || '', Validators.required],
      status: [this.transaction?.status || '', Validators.required],
      description: [this.transaction?.description || ''],
      orderId: [this.transaction?.orderId || ''],
      depositRequestId: [this.transaction?.depositRequestId || ''],
      referenceId: [this.transaction?.referenceId || '']
    });
  }

  onSubmit(): void {
    this.submitted = true;

    if (this.transactionForm.invalid) {
      this.messageService.showWarning('Validation Error', 'Please fill in all required fields correctly.');
      return;
    }

    this.loading = true;

    if (this.isUpdateMode) {
      const updateData: UpdateTransactionDto = {
        status: this.transactionForm.get('status')?.value,
        description: this.transactionForm.get('description')?.value,
        referenceId: this.transactionForm.get('referenceId')?.value
      };

      this.transactionService.updateTransactionById(this.transactionId, updateData)
        .pipe(finalize(() => this.loading = false))
        .subscribe({
          next: () => {
            this.messageService.showSuccess('Success', 'Transaction updated successfully!');
            // this.router.navigate(['/transactions']);
          },
          error: (error) => {
            const errorMsg = error.error?.message || error.message || 'Failed to update transaction';
            this.messageService.showError('Error', errorMsg);
            console.error('Error updating transaction:', error);
          }
        });
    } else {
      const createData: CreateTransactionDto = {
        walletId: this.transactionForm.get('walletId')?.value,
        userId: this.transactionForm.get('userId')?.value,
        amount: this.transactionForm.get('amount')?.value,
        type: this.transactionForm.get('type')?.value,
        status: this.transactionForm.get('status')?.value,
        description: this.transactionForm.get('description')?.value,
        orderId: this.transactionForm.get('orderId')?.value,
        depositRequestId: this.transactionForm.get('depositRequestId')?.value,
        referenceId: this.transactionForm.get('referenceId')?.value
        };

        this.transactionService.createTransaction(createData)
          .pipe(finalize(() => this.loading = false))
          .subscribe({
            next: () => {
              this.messageService.showSuccess('Success', 'Transaction created successfully!');
            //   this.router.navigate(['/transactions']);
            },
            error: (error) => {
              const errorMsg = error.error?.message || error.message || 'Failed to create transaction';
              this.messageService.showError('Error', errorMsg);
              console.error('Error creating transaction:', error);
            }
          });
        }
    }
}
