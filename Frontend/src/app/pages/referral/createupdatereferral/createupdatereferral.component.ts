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

import { ReferralResponseDto, CreateReferralDto, UpdateReferralDto } from '../model/referral.dto';
import { ReferralService } from '../../../shared/service/referral.service';
import { MessageService } from '../../../shared/service/message.service';
import { UserService } from '../../../shared/service/user.service';

@Component({
  selector: 'app-createupdatereferral',
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
  templateUrl: './createupdatereferral.component.html',
  styleUrl: './createupdatereferral.component.scss'
})
export class CreateupdatereferralComponent implements OnInit, OnDestroy {
  @Input() referral?: ReferralResponseDto;

  referralForm!: FormGroup;
  users: any[] = [];
  isUpdateMode = false;
  submitted = false;
  loading = false;
  referralId = '';

  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private referralService: ReferralService,
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
          this.referralId = String(params['id']);
          this.loadReferralData(this.referralId);
        } else if (this.referral) {
          this.isUpdateMode = true;
          this.referralId = String(this.referral.id);
          this.initForm();
        } else {
          this.initForm();
        }
      });
  }

  loadReferralData(referralId: string): void {
    this.loading = true;
    this.referralService.getReferralById(referralId)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.loading = false)
      )
      .subscribe({
        next: (response) => {
          this.isUpdateMode = true;
          this.referral = response;
          this.initForm();
        },
        error: (error: any) => {
          const errorMsg = error.error?.message || error.message || 'Failed to load referral data';
          this.messageService.showError('Error', errorMsg);
          console.error('Error loading referral:', error);
        }
      });
  }

  private initForm(): void {
    this.referralForm = this.fb.group({
      referredById: [this.referral?.referredById || '', Validators.required],
      referredUserId: [this.referral?.referredUserId || '', Validators.required],
      rewardAmount: [this.referral?.rewardAmount || null, [Validators.min(0)]]
    });
  }

  onSubmit(): void {
    this.submitted = true;

    if (this.referralForm.invalid) {
      this.messageService.showWarning('Validation Error', 'Please fill in all required fields correctly.');
      return;
    }

    this.loading = true;

    if (this.isUpdateMode) {
      const updateData: UpdateReferralDto = {
        rewardAmount: this.referralForm.get('rewardAmount')?.value
      };

      this.referralService.updateReferralById(this.referralId, updateData)
        .pipe(finalize(() => this.loading = false))
        .subscribe({
          next: () => {
            this.messageService.showSuccess('Success', 'Referral updated successfully!');
            // this.router.navigate(['/referrals']);
          },
          error: (error: any) => {
            const errorMsg = error.error?.message || error.message || 'Failed to update referral';
            this.messageService.showError('Error', errorMsg);
            console.error('Error updating referral:', error);
          }
        });
    } else {
      const createData: CreateReferralDto = {
        referredById: this.referralForm.get('referredById')?.value,
        referredUserId: this.referralForm.get('referredUserId')?.value,
        rewardAmount: this.referralForm.get('rewardAmount')?.value
      };

      this.referralService.createReferral(createData)
        .pipe(finalize(() => this.loading = false))
        .subscribe({
          next: () => {
            this.messageService.showSuccess('Success', 'Referral created successfully!');
            // this.router.navigate(['/referrals']);
          },
          error: (error: any) => {
            const errorMsg = error.error?.message || error.message || 'Failed to create referral';
            this.messageService.showError('Error', errorMsg);
            console.error('Error creating referral:', error);
          }
        });
    }
  }
}
