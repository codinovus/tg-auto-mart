import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { InputNumberModule } from 'primeng/inputnumber';
import { SelectModule } from 'primeng/select';
import { CheckboxModule } from 'primeng/checkbox';
import { CardModule } from 'primeng/card';
import { MessageModule } from 'primeng/message';
import { Router, ActivatedRoute } from '@angular/router';
import { finalize, takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';

import { ProductResponseDto, CreateProductDto, UpdateProductDto } from '../model/product.dto';
import { ProductService } from '../../../shared/service/product.service';
import { ProductCategoryService } from '../../../shared/service/product-category.service';
import { StoreService } from '../../../shared/service/store.service';
import { MessageService } from '../../../shared/service/message.service';

@Component({
  selector: 'app-createupdateproduct',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ButtonModule,
    InputTextModule,
    TextareaModule ,
    InputNumberModule,
    SelectModule,
    CheckboxModule,
    CardModule,
    MessageModule
  ],
  templateUrl: './createupdateproduct.component.html',
  styleUrl: './createupdateproduct.component.scss'
})
export class CreateupdateproductComponent implements OnInit, OnDestroy {
  @Input() product?: ProductResponseDto;

  productForm!: FormGroup;
  categories: any[] = [];
  stores: any[] = [];
  isUpdateMode = false;
  submitted = false;
  loading = false;
  productId = '';

  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private productService: ProductService,
    private categoryService: ProductCategoryService,
    private storeService: StoreService,
    private messageService: MessageService,
    private router: Router,
    private route: ActivatedRoute
  ) { }

  ngOnInit(): void {
    this.loadCategories();
    this.loadStores();
    this.handleRouteParams();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadCategories(): void {
    this.categoryService.getAllProductCategories()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.categories = response.data.map(category => ({
            label: category.name,
            value: category.id
          }));
        },
        error: (error: any) => {
          const errorMsg = error.error?.message || error.message || 'Failed to load categories';
          this.messageService.showError('Error', errorMsg);
          console.error('Error loading categories:', error);
        }
      });
  }

  private loadStores(): void {
    this.storeService.getAllStores()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.stores = response.data.map(store => ({
            label: store.name,
            value: store.id
          }));
        },
        error: (error: any) => {
          const errorMsg = error.error?.message || error.message || 'Failed to load stores';
          this.messageService.showError('Error', errorMsg);
          console.error('Error loading stores:', error);
        } });
  }

  private handleRouteParams(): void {
    this.route.params
      .pipe(takeUntil(this.destroy$))
      .subscribe(params => {
        if (params['id']) {
          this.productId = String(params['id']);
          this.loadProductData(this.productId);
        } else if (this.product) {
          this.isUpdateMode = true;
          this.productId = String(this.product.id);
          this.initForm();
        } else {
          this.initForm();
        }
      });
  }

  loadProductData(productId: string): void {
    this.loading = true;
    this.productService.getProductById(productId)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.loading = false)
      )
      .subscribe({
        next: (response) => {
          this.product = response;
          this.isUpdateMode = true;
          this.initForm();
          this.messageService.showInfo('Product Data Loaded', 'Product information has been successfully loaded.');
        },
        error: (error: any) => {
          const errorMsg = error.error?.message || error.message || 'Failed to load product data';
          this.messageService.showError('Error', errorMsg);
          console.error('Error loading product:', error);
        }
      });
  }

  initForm(): void {
    this.productForm = this.fb.group({
      name: [this.product?.name || '', [Validators.required]],
      description: [this.product?.description || ''],
      price: [this.product?.price || 0, [Validators.required]],
      stock: [this.product?.stock || 0, [Validators.required]],
      storeId: [this.product?.storeId || '', [Validators.required]],
      categoryId: [this.product?.categoryId || '', [Validators.required]],
      autoDeliver: [this.product?.autoDeliver || false]
    });
  }

  onSubmit(): void {
    this.submitted = true;

    if (this.productForm.invalid) {
      this.messageService.showWarning('Validation Error', 'Please fill in all required fields correctly.');
      return;
    }

    this.loading = true;

    if (this.isUpdateMode) {
      const updateData: UpdateProductDto = this.prepareUpdateData();

      this.productService.updateProductById(this.productId, updateData)
        .pipe(finalize(() => this.loading = false))
        .subscribe({
          next: () => {
            this.messageService.showSuccess('Success', 'Product updated successfully!');
          },
          error: (error: any) => {
            const errorMsg = error.error?.message || error.message || 'Failed to update product';
            this.messageService.showError('Error', errorMsg);
            console.error('Error updating product:', error);
          }
        });
    } else {
      const createData: CreateProductDto = this.productForm.value;

      this.productService.createProduct(createData)
        .pipe(finalize(() => this.loading = false))
        .subscribe({
          next: () => {
            this.messageService.showSuccess('Success', 'Product created successfully!');
            this.productForm.reset();
            this.submitted = false;
            this.initForm();
          },
          error: (error: any) => {
            const errorMsg = error.error?.message || error.message || 'Failed to create product';
            this.messageService.showError('Error', errorMsg);
            console.error('Error creating product:', error);
          }
        });
    }
  }

  private prepareUpdateData(): UpdateProductDto {
    const updateData: UpdateProductDto = {};
    if (this.productForm.get('name')?.dirty) {
      updateData.name = this.productForm.get('name')?.value;
    }
    if (this.productForm.get('description')?.dirty) {
      updateData.description = this.productForm.get('description')?.value;
    }
    if (this.productForm.get('price')?.dirty) {
      updateData.price = this.productForm.get('price')?.value;
    }
    if (this.productForm.get('stock')?.dirty) {
      updateData.stock = this.productForm.get('stock')?.value;
    }
    if (this.productForm.get('storeId')?.dirty) {
      updateData.storeId = this.productForm.get('storeId')?.value;
    }
    if (this.productForm.get('categoryId')?.dirty) {
      updateData.categoryId = this.productForm.get('categoryId')?.value;
    }
    if (this.productForm.get('autoDeliver')?.dirty) {
      updateData.autoDeliver = this.productForm.get('autoDeliver')?.value;
    }
    return updateData;
  }

  get nameControl(): AbstractControl | null {
    return this.productForm.get('name');
  }

  get descriptionControl(): AbstractControl | null {
    return this.productForm.get('description');
  }

  get priceControl(): AbstractControl | null {
    return this.productForm.get ('price');
  }

  get stockControl(): AbstractControl | null {
    return this.productForm.get('stock');
  }

  get storeIdControl(): AbstractControl | null {
    return this.productForm.get('storeId');
  }

  get categoryIdControl(): AbstractControl | null {
    return this.productForm.get('categoryId');
  }

  get autoDeliverControl(): AbstractControl | null {
    return this.productForm.get('autoDeliver');
  }
}
