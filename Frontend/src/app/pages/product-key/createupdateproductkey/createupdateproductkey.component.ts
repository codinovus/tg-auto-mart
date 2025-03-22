import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { CheckboxModule } from 'primeng/checkbox';
import { CardModule } from 'primeng/card';
import { MessageModule } from 'primeng/message';
import { Router, ActivatedRoute } from '@angular/router';
import { finalize, takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';

import { ProductKeyResponseDto, CreateProductKeyDto, UpdateProductKeyDto } from '../model/product-key.dto';
import { ProductKeyService } from '../../../shared/service/product-key.service';
import { ProductService } from '../../../shared/service/product.service';
import { MessageService } from '../../../shared/service/message.service';

@Component({
  selector: 'app-createupdateproductkey',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ButtonModule,
    InputTextModule,
    SelectModule,
    CheckboxModule,
    CardModule,
    MessageModule
  ],
  templateUrl: './createupdateproductkey.component.html',
  styleUrl: './createupdateproductkey.component.scss'
})
export class CreateupdateproductkeyComponent implements OnInit, OnDestroy {
  @Input() productKey?: ProductKeyResponseDto;

  productKeyForm!: FormGroup;
  products: any[] = [];
  isUpdateMode = false;
  submitted = false;
  loading = false;
  productKeyId = '';

  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private productKeyService: ProductKeyService,
    private productService: ProductService,
    private messageService: MessageService,
    private router: Router,
    private route: ActivatedRoute
  ) { }

  ngOnInit(): void {
    this.loadProducts();
    this.handleRouteParams();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadProducts(): void {
    this.productService.getAllProducts()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.products = response.data.map(product => ({
            label: product.name,
            value: product.id
          }));
        },
        error: (error: any) => {
          const errorMsg = error.error?.message || error.message || 'Failed to load products';
          this.messageService.showError('Error', errorMsg);
          console.error('Error loading products:', error);
        }
      });
  }

  private handleRouteParams(): void {
    this.route.params
      .pipe(takeUntil(this.destroy$))
      .subscribe(params => {
        if (params['id']) {
          this.productKeyId = String(params['id']);
          this.loadProductKeyData(this.productKeyId);
        } else if (this.productKey) {
          this.isUpdateMode = true;
          this.productKeyId = String(this.productKey.id);
          this.initForm();
        } else {
          this.initForm();
        }
      });
  }

  loadProductKeyData(productKeyId: string): void {
    this.loading = true;
    this.productKeyService.getProductKeyById(productKeyId)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.loading = false)
      )
      .subscribe({
        next: (response) => {
          this. productKey = response;
          this.isUpdateMode = true;
          this.initForm();
          this.messageService.showInfo('Product Key Data Loaded', 'Product key information has been successfully loaded.');
        },
        error: (error: any) => {
          const errorMsg = error.error?.message || error.message || 'Failed to load product key data';
          this.messageService.showError('Error', errorMsg);
          console.error('Error loading product key:', error);
        }
      });
  }

  initForm(): void {
    this.productKeyForm = this.fb.group({
      key: [this.productKey?.key || '', [Validators.required]],
      productId: [this.productKey?.productId || '', [Validators.required]],
      isSold: [this.productKey?.isSold || false]
    });
  }

  onSubmit(): void {
    this.submitted = true;

    if (this.productKeyForm.invalid) {
      this.messageService.showWarning('Validation Error', 'Please fill in all required fields correctly.');
      return;
    }

    this.loading = true;

    if (this.isUpdateMode) {
      const updateData: UpdateProductKeyDto = this.prepareUpdateData();

      this.productKeyService.updateProductKeyById(this.productKeyId, updateData)
        .pipe(finalize(() => this.loading = false))
        .subscribe({
          next: () => {
            this.messageService.showSuccess('Success', 'Product key updated successfully!');
          },
          error: (error: any) => {
            const errorMsg = error.error?.message || error.message || 'Failed to update product key';
            this.messageService.showError('Error', errorMsg);
            console.error('Error updating product key:', error);
          }
        });
    } else {
      const createData: CreateProductKeyDto = this.productKeyForm.value;

      this.productKeyService.createProductKey(createData)
        .pipe(finalize(() => this.loading = false))
        .subscribe({
          next: () => {
            this.messageService.showSuccess('Success', 'Product key created successfully!');
            this.productKeyForm.reset();
            this.submitted = false;
            this.initForm();
          },
          error: (error: any) => {
            const errorMsg = error.error?.message || error.message || 'Failed to create product key';
            this.messageService.showError('Error', errorMsg);
            console.error('Error creating product key:', error);
          }
        });
    }
  }

  private prepareUpdateData(): UpdateProductKeyDto {
    const updateData: UpdateProductKeyDto = {};
    if (this.productKeyForm.get('isSold')?.dirty) {
      updateData.isSold = this.productKeyForm.get('isSold')?.value;
    }
    return updateData;
  }

  get keyControl(): AbstractControl | null {
    return this.productKeyForm.get('key');
  }

  get productIdControl(): AbstractControl | null {
    return this.productKeyForm.get('productId');
  }

  get isSoldControl(): AbstractControl | null {
    return this.productKeyForm.get('isSold');
  }
}
