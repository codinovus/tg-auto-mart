import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { CalendarModule } from 'primeng/calendar';
import { CheckboxModule } from 'primeng/checkbox';
import { CardModule } from 'primeng/card';
import { MessageModule } from 'primeng/message';
import { Router, ActivatedRoute } from '@angular/router';
import { finalize, takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';

import { PromoCodeResponseDto, CreatePromoCodeDto, UpdatePromoCodeDto } from '../model/promo-code.dto';
import { PromoCodeService } from '../../../shared/service/promo-code.service';
import { MessageService } from '../../../shared/service/message.service';

@Component({
  selector: 'app-createupdatepromocode',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ButtonModule,
    InputTextModule,
    InputNumberModule,
    CalendarModule,
    CheckboxModule,
    CardModule,
    MessageModule
  ],
  templateUrl: './createupdatepromocode.component.html',
  styleUrl: './createupdatepromocode.component.scss'
})
export class CreateupdatepromocodeComponent implements OnInit, OnDestroy {
  @Input() promoCode?: PromoCodeResponseDto;

  promoCodeForm!: FormGroup;
  isUpdateMode = false;
  submitted = false;
  loading = false;
  promoCodeId = '';
  minDate: Date = new Date();

  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private promoCodeService: PromoCodeService,
    private messageService: MessageService,
    private router: Router,
    private route: ActivatedRoute
  ) { }

  ngOnInit(): void {
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
          this.promoCodeId = String(params['id']);
          this.loadPromoCodeData(this.promoCodeId);
        } else if (this.promoCode) {
          this.isUpdateMode = true;
          this.promoCodeId = String(this.promoCode.id);
          this.initForm();
        } else {
          this.initForm();
        }
      });
  }

  loadPromoCodeData(promoCodeId: string): void {
    this.loading = true;
    this.promoCodeService.getPromoCodeById(promoCodeId)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.loading = false)
      )
      .subscribe({
        next: (response) => {
          this.promoCode = response.data;
          this.isUpdateMode = true;
          this.initForm();
          this.messageService.showInfo('Promo Code Data Loaded', 'Promo code information has been successfully loaded.');
        },
        error: (error: any) => {
          const errorMsg = error.error?.message || error.message || 'Failed to load promo code data';
          this.messageService.showError('Error', errorMsg);
          console.error('Error loading promo code:', error);
        }
      });
  }

  initForm(): void {
    this.promoCodeForm = this.fb.group({
      code: [this.promoCode?.code || '', [Validators.required]],
      discount: [this.promoCode?.discount || 0, [Validators.required, Validators.min(0)]],
      expiresAt: [this.promoCode?.expiresAt || null, [Validators.required]],
      isActive: [this.promoCode?.isActive || false]
    });
  }

  onSubmit(): void {
    this.submitted = true;

    if (this.promoCodeForm.invalid) {
      this.messageService.showWarning('Validation Error', 'Please fill in all required fields correctly.');
      return;
    }

    this.loading = true;

    if (this.isUpdateMode) {
      const updateData: UpdatePromoCodeDto = this.prepareUpdateData();

      this.promoCodeService.updatePromoCodeById(this.promoCodeId, updateData)
        .pipe(finalize(() => this.loading = false))
        .subscribe({
          next: () => {
            this.messageService.showSuccess('Success', 'Promo code updated successfully!');
          },
          error: (error: any) => {
            const errorMsg = error.error?.message || error.message || 'Failed to update promo code';
            this.messageService.showError('Error', errorMsg);
            console.error('Error updating promo code:', error);
          }
        });
    } else {
      const createData: CreatePromoCodeDto = this.promoCodeForm.value;

      this.promoCodeService.createPromoCode(createData)
        .pipe(finalize(() => this.loading = false))
        .subscribe({
          next: () => {
            this.messageService.showSuccess('Success', 'Promo code created successfully!');
            this.promoCodeForm.reset();
            this.submitted = false;
            this.initForm();
          },
          error: (error: any) => {
            const errorMsg = error.error?.message || error.message || 'Failed to create promo code';
            this.messageService.showError('Error', errorMsg);
            console.error('Error creating promo code:', error);
          }
        });
    }
  }

  private prepareUpdateData(): UpdatePromoCodeDto {
    const updateData: UpdatePromoCodeDto = {};
    if (this.promoCodeForm.get('code')?.dirty) {
      updateData.code = this.promoCodeForm.get('code')?.value;
    }
    if (this.promoCodeForm.get('discount')?.dirty) {
      updateData.discount = this.promoCodeForm.get('discount')?.value;
    }
    if (this.promoCodeForm.get('expiresAt')?.dirty) {
      updateData.expiresAt = this.promoCodeForm.get('expiresAt')?.value;
    }
    if (this.promoCodeForm.get('isActive')?.dirty) {
      updateData.isActive = this.promoCodeForm.get('isActive')?.value;
    }
    return updateData;
  }

  get codeControl(): AbstractControl | null {
    return this.promoCodeForm.get('code');
  }

  get discountControl(): AbstractControl | null {
    return this.promoCodeForm.get('discount');
  }

  get expiresAtControl(): AbstractControl | null {
    return this.promoCodeForm.get('expiresAt');
  }

  get isActiveControl(): AbstractControl | null {
    return this.promoCodeForm.get('isActive');
  }
}
