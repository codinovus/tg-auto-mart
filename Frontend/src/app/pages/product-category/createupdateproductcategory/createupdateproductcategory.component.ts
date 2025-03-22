// createupdateproductcategory.component.ts
import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { CardModule } from 'primeng/card';
import { MessageModule } from 'primeng/message';
import { Router, ActivatedRoute } from '@angular/router';
import { finalize, takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';

import { ProductCategoryResponseDto, CreateProductCategoryDto, UpdateProductCategoryDto } from '../model/product-category.dto';

import { MessageService } from '../../../shared/service/message.service';
import { ProductCategoryService } from '../../../shared/service/product-category.service';

@Component({
  selector: 'app-createupdateproductcategory',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ButtonModule,
    InputTextModule,
    CardModule,
    MessageModule
  ],
  templateUrl: './createupdateproductcategory.component.html',
  styleUrl: './createupdateproductcategory.component.scss'
})
export class CreateupdateproductcategoryComponent implements OnInit, OnDestroy {
  @Input() productCategory?: ProductCategoryResponseDto;

  productCategoryForm!: FormGroup;
  isUpdateMode = false;
  submitted = false;
  loading = false;
  productCategoryId = '';

  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private productCategoryService: ProductCategoryService,
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
          this.productCategoryId = String(params['id']);
          this.loadProductCategoryData(this.productCategoryId);
        } else if (this.productCategory) {
          this.isUpdateMode = true;
          this.productCategoryId = String(this.productCategory.id);
          this.initForm();
        } else {
          this.initForm();
        }
      });
  }

  loadProductCategoryData(productCategoryId: string): void {
    this.loading = true;
    this.productCategoryService.getProductCategoryById(productCategoryId)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.loading = false)
      )
      .subscribe({
        next: (response) => {
          this.productCategory = response;
          this.isUpdateMode = true;
          this.initForm();
          this.messageService.showInfo('Category Data Loaded', 'Product category information has been successfully loaded.');
        },
        error: (error: any) => {
          const errorMsg = error.error?.message || error.message || 'Failed to load product category data';
          this.messageService.showError('Error', errorMsg);
          console.error('Error loading product category:', error);
        }
      });
  }

  initForm(): void {
    this.productCategoryForm = this.fb.group({
      name: [this.productCategory?.name || '', [Validators.required]]
    });
  }

 // Continuing the createupdateproductcategory.component.ts file

 onSubmit(): void {
    this.submitted = true;

    if (this.productCategoryForm.invalid) {
      this.messageService.showWarning('Validation Error', 'Please fill in all required fields correctly.');
      return;
    }

    this.loading = true;

    if (this.isUpdateMode) {
      const updateData: UpdateProductCategoryDto = {
        name: this.productCategoryForm.get('name')?.value
      };

      this.productCategoryService.updateProductCategoryById(this.productCategoryId, updateData)
        .pipe(finalize(() => this.loading = false))
        .subscribe({
          next: () => {
            this.messageService.showSuccess('Success', 'Product category updated successfully!');
            this.router.navigate(['/product-categories']);
          },
          error: (error: any) => {
            const errorMsg = error.error?.message || error.message || 'Failed to update product category';
            this.messageService.showError('Error', errorMsg);
            console.error('Error updating product category:', error);
          }
        });
    } else {
      const createData: CreateProductCategoryDto = {
        name: this.productCategoryForm.get('name')?.value
      };

      this.productCategoryService.createProductCategory(createData)
        .pipe(finalize(() => this.loading = false))
        .subscribe({
          next: () => {
            this.messageService.showSuccess('Success', 'Product category created successfully!');
            this.productCategoryForm.reset();
            this.submitted = false;
            this.initForm(); // Reset with default values
            this.router.navigate(['/product-categories']);
          },
          error: (error: any) => {
            const errorMsg = error.error?.message || error.message || 'Failed to create product category';
            this.messageService.showError('Error', errorMsg);
            console.error('Error creating product category:', error);
          }
        });
    }
  }

  get nameControl(): AbstractControl | null {
    return this.productCategoryForm.get('name');
  }
}
