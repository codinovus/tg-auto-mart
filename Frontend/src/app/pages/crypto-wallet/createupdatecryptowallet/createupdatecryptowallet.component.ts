import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { CardModule } from 'primeng/card';
import { MessageModule } from 'primeng/message';
import { Router, ActivatedRoute } from '@angular/router';
import { finalize, takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';

import { CryptoType } from '../../../shared/enums/app-enums';
import { CryptoWalletResponseDto, CreateCryptoWalletDto, UpdateCryptoWalletDto } from '../model/crypto-wallet.dto';
import { CryptoWalletService } from '../../../shared/service/crypto-wallet.service';
import { MessageService } from '../../../shared/service/message.service';
import { UserService } from '../../../shared/service/user.service';

@Component({
  selector: 'app-createupdatecryptowallet',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ButtonModule,
    InputTextModule,
    SelectModule,
    CardModule,
    MessageModule
  ],
  templateUrl: './createupdatecryptowallet.component.html',
  styleUrl: './createupdatecryptowallet.component.scss'
})
export class CreateupdatecryptowalletComponent implements OnInit, OnDestroy {
  @Input() wallet?: CryptoWalletResponseDto;

  walletForm!: FormGroup;
  cryptoTypes: any[] = [];
  users: any[] = [];
  isUpdateMode = false;
  submitted = false;
  loading = false;
  walletId = '';

  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private cryptoWalletService: CryptoWalletService,
    private userService: UserService,
    private messageService: MessageService,
    private router: Router,
    private route: ActivatedRoute
  ) { }

  ngOnInit(): void {
    this.initCryptoTypes();
    this.loadUsers();
    this.handleRouteParams();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initCryptoTypes(): void {
    this.cryptoTypes = Object.values(CryptoType).map(type => ({
      label: type.replace('_', ' '),
      value: type
    }));
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
    this.cryptoWalletService.getCryptoWalletById(walletId)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.loading = false)
      )
      .subscribe({
        next: (response) => {
          this.wallet = response;
          this.isUpdateMode = true;
          this.initForm();
          this.messageService.showInfo('Wallet Data Loaded', 'Crypto wallet information has been successfully loaded.');
        },
        error: (error: any) => {
          const errorMsg = error.error?.message || error.message || 'Failed to load wallet data';
          this.messageService.showError('Error', errorMsg);
          console.error('Error loading wallet:', error);
        }
      });
  }

  initForm(): void {
    this.walletForm = this.fb.group({
      type: [this.wallet?.type || CryptoType.BTC, [Validators.required]],
      address: [this.wallet?.address || '', [Validators.required, Validators.minLength(26)]],
      userId: [this.wallet?.userId || '', this.isUpdateMode ? [] : [Validators.required]]
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
      const updateData: UpdateCryptoWalletDto = this.prepareUpdateData();

      this.cryptoWalletService.updateCryptoWalletById(this.walletId, updateData)
        .pipe(finalize(() => this.loading = false))
        .subscribe({
          next: () => {
            this.messageService.showSuccess('Success', 'Crypto wallet updated successfully!');
          },
          error: (error: any) => {
            const errorMsg = error.error?.message || error.message || 'Failed to update wallet';
            this.messageService.showError('Error', errorMsg);
            console.error('Error updating wallet:', error);
          }
        });
    } else {
      const createData: CreateCryptoWalletDto = this.walletForm.value;

      this.cryptoWalletService.createCryptoWallet(createData)
        .pipe(finalize(() => this.loading = false))
        .subscribe({
          next: () => {
            this.messageService.showSuccess('Success', 'Crypto wallet created successfully!');
            this.walletForm.reset();
            this.submitted = false;
            this.initForm();
          },
          error: (error: any) => {
            const errorMsg = error.error?.message || error.message || 'Failed to create wallet';
            this.messageService.showError('Error', errorMsg);
            console.error('Error creating wallet:', error);
          }
        });
    }
  }

  private prepareUpdateData(): UpdateCryptoWalletDto {
    const updateData: UpdateCryptoWalletDto = {};
    if (this.walletForm.get('type')?.dirty) {
      updateData.type = this.walletForm.get('type')?.value;
    }
    if (this.walletForm.get('address')?.dirty) {
      updateData.address = this.walletForm.get('address')?.value;
    }
    return updateData;
  }

  get typeControl(): AbstractControl | null {
    return this.walletForm.get('type');
  }

  get addressControl(): AbstractControl | null {
    return this.walletForm.get('address');
  }

  get userIdControl(): AbstractControl | null {
    return this.walletForm.get('userId');
  }
}
