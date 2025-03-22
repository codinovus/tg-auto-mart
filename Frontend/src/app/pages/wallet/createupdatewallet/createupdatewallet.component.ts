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

import { WalletResponseDto, CreateWalletDto, UpdateWalletDto } from '../model/wallet.dto';
import { WalletService } from '../../../shared/service/wallet.service';
import { MessageService } from '../../../shared/service/message.service';
import { UserService } from '../../../shared/service/user.service';

@Component({
  selector: 'app-createupdatewallet',
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
  templateUrl: './createupdatewallet.component.html',
  styleUrl: './createupdatewallet.component.scss'
})
export class CreateupdatewalletComponent implements OnInit, OnDestroy {
  @Input() wallet?: WalletResponseDto;

  walletForm!: FormGroup;
  users: any[] = [];
  isUpdateMode = false;
  submitted = false;
  loading = false;
  walletId = '';

  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private walletService: WalletService,
    private userService: UserService,
    private messageService: MessageService,
    private router: Router,
    private route: ActivatedRoute
  ) { }

  ngOnInit(): void {
    this.loadUsers();
    this.handleRouteParams();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
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

  private handleRouteParams(): void {
    this.route.params
      .pipe(takeUntil(this.destroy$))
      .subscribe(params => {
        if (params['id']) {
          this.walletId = String(params['id']);
          this.loadWalletData(this.walletId);
        } else if (this.wallet) {
          this.isUpdateMode = true;
          this.walletId = String(this.wallet.id);
          this.initForm();
        } else {
          this.initForm();
        }
      });
  }

  loadWalletData(walletId: string): void {
    this.loading = true;
    this.walletService.getWalletById(walletId)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.loading = false)
      )
      .subscribe({
        next: (response) => {
          this.wallet = response;
          this.isUpdateMode = true;
          this.initForm();
        },
        error: (error: any) => {
          const errorMsg = error.error?.message || error.message || 'Failed to load wallet data';
          this.messageService.showError('Error', errorMsg);
          console.error('Error loading wallet:', error);
        }
      });
  }

  private initForm(): void {
    this.walletForm = this.fb.group({
      userId: [this.wallet?.userId || '', Validators.required],
      balance: [this.wallet?.balance || 0, [Validators.required, Validators.min(0)]]
    });
  }

  onSubmit(): void {
    this.submitted = true;

    if (this.walletForm.invalid) {
      this.messageService.showWarning('Validation Error', 'Please fill in all required fields correctly.');
      return;
    }

    this.loading = true;

    if (this.isUpdateMode) {
      const updateData: UpdateWalletDto = {
        balance: this.walletForm.get('balance')?.value
      };

      this.walletService.updateWalletById(this.walletId, updateData)
        .pipe(finalize(() => this.loading = false))
        .subscribe({
          next: (response: any) => {
            this.messageService.showSuccess('Success', 'Wallet updated successfully!');
            this.router.navigate(['/wallets']);
          },
          error: (error: any) => {
            const errorMsg = error.error?.message || error.message || 'Failed to update wallet';
            this.messageService.showError('Error', errorMsg);
            console.error('Error updating wallet:', error);
          }
        });
    } else {
      const createData: CreateWalletDto = {
        userId: this.walletForm.get('userId')?.value
      };

      this.walletService.createWallet(createData)
        .pipe(finalize(() => this.loading = false))
        .subscribe({
          next: (response: any) => {
            this.messageService.showSuccess('Success', 'Wallet created successfully!');
            this.walletForm.reset();
            this.submitted = false;
            this.initForm(); // Reset with default values
          },
          error: (error: any) => {
            const errorMsg = error.error?.message || error.message || 'Failed to create wallet';
            this.messageService.showError('Error', errorMsg);
            console.error('Error creating wallet:', error);
          }
        });
    }
  }

  get formControls(): { [key: string]: AbstractControl } {
    return this.walletForm.controls;
  }
}
