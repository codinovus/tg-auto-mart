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

import { OrderStatus } from '../../../shared/enums/app-enums';
import { OrderResponseDto, CreateOrderDto, UpdateOrderDto } from '../model/order.dto';
import { OrderService } from '../../../shared/service/order.service';
import { MessageService } from '../../../shared/service/message.service';
import { UserService } from '../../../shared/service/user.service';

import { PromoCodeService } from '../../../shared/service/promo-code.service';

import { GetAllProductsResponseDto, ProductResponseDto } from '../../product/model/product.dto';
import { ProductService } from '../../../shared/service/product.service';

@Component({
  selector: 'app-createupdateorder',
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
  templateUrl: './createupdateorder.component.html',
  styleUrl: './createupdateorder.component.scss'
})
export class CreateupdateorderComponent implements OnInit, OnDestroy {
  @Input() order?: OrderResponseDto;

  orderForm!: FormGroup;
  users: any[] = [];
  products: any[] = [];
  promoCodes: any[] = [];
  statuses: any[] = [];
  isUpdateMode = false;
  submitted = false;
  loading = false;
  orderId = '';

  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private orderService: OrderService,
    private userService: UserService,
    private productService: ProductService,
    private promoCodeService: PromoCodeService,
    private messageService: MessageService,
    private router: Router,
    private route: ActivatedRoute
  ) { }

  ngOnInit(): void {
    this.initStatusOptions();
    this.loadUsers();
    this.loadProducts();
    this.loadPromoCodes();
    this.handleRouteParams();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initStatusOptions(): void {
    this.statuses = Object.values(OrderStatus).map(status => ({
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

  private loadProducts(page: number = 1, limit: number = 10): void {
    this.productService.getAllProducts(page, limit) // Call the correct method
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: GetAllProductsResponseDto) => { // Specify the type of response
          this.products = response.data.map((product: ProductResponseDto) => ({ // Specify the type of product
            label: `${product.name} - $${product.price}`,
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

  private loadPromoCodes(): void {
    this.promoCodeService.getAllPromoCodes()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.promoCodes = response.data.map(promoCode => ({
            label: `${promoCode.code} (${promoCode.discount}% off)`,
            value: promoCode.id
          }));
        },
        error: (error: any) => {
          const errorMsg = error.error?.message || error.message || 'Failed to load promo codes';
          this.messageService.showError('Error', errorMsg);
          console.error('Error loading promo codes:', error);
        }
      });
  }

  private handleRouteParams(): void {
    this.route.params
      .pipe(takeUntil(this.destroy$))
      .subscribe(params => {
        if (params['id']) {
          this.orderId = String(params['id']);
          this.loadOrderData(this.orderId);
        } else if (this.order) {
          this.isUpdateMode = true;
          this.orderId = String(this.order.id);
          this.initForm();
        } else {
          this.initForm();
        }
      });
  }

  loadOrderData(orderId: string): void {
    this.loading = true;
    this.orderService.getOrderById(orderId)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.loading = false)
      )
      .subscribe({
        next: (response) => {
          this.order = response.data;
          this.isUpdateMode = true;
          this.initForm();
          this.messageService.showInfo('Order Data Loaded', 'Order information has been successfully loaded.');
        },
        error: (error: any) => {
          const errorMsg = error.error?.message || error.message || 'Failed to load order data';
          this.messageService.showError('Error', errorMsg);
          console.error('Error loading order:', error);
        }
      });
  }

  initForm(): void {
    this.orderForm = this.fb.group({
      userId: [this.order?.userId || '', this.isUpdateMode ? { disabled: true } : [Validators.required]],
      productId: [this.order?.productId || '', this.isUpdateMode ? { disabled: true } : [Validators.required]],
      quantity: [this.order?.quantity || 1, [Validators.required, Validators.min(1)]],
      promoCodeId: [this.order?.promoCode?.id || ''],
      status: [this.order?.status || OrderStatus.PENDING, this.isUpdateMode ? [Validators.required] : { disabled: true }]
    });
  }

  onSubmit(): void {
    this.submitted = true;

    if (this.orderForm.invalid) {
      this.messageService.showWarning('Validation Error', 'Please fill in all required fields correctly.');
      return;
    }

    this.loading = true;

    if (this.isUpdateMode) {
        const updateData: UpdateOrderDto = {
          quantity: this.orderForm.get('quantity')?.value,
          status: this.orderForm.get('status')?.value,
          promoCodeId: this.orderForm.get('promoCodeId')?.value || undefined
        };

        this.orderService.updateOrderById(this.orderId, updateData)
          .pipe(finalize(() => this.loading = false))
          .subscribe({
            next: () => {
              this.messageService.showSuccess('Success', 'Order updated successfully!');
            },
            error: (error: any) => {
              const errorMsg = error.error?.message || error.message || 'Failed to update order';
              this.messageService.showError('Error', errorMsg);
              console.error('Error updating order:', error);
            }
          });
      } else {
        const createData: CreateOrderDto = {
          userId: this.orderForm.get('userId')?.value,
          productId: this.orderForm.get('productId')?.value,
          quantity: this.orderForm.get('quantity')?.value,
          promoCodeId: this.orderForm.get('promoCodeId')?.value || undefined
        };

        this.orderService.createOrder(createData)
          .pipe(finalize(() => this.loading = false))
          .subscribe({
            next: () => {
              this.messageService.showSuccess('Success', 'Order created successfully!');
              this.orderForm.reset();
              this.submitted = false;
              this.initForm(); // Reset with default values
            },
            error: (error: any) => {
              const errorMsg = error.error?.message || error.message || 'Failed to create order';
              this.messageService.showError('Error', errorMsg);
              console.error('Error creating order:', error);
            }
          });
      }
    }

    get userIdControl(): AbstractControl | null {
      return this.orderForm.get('userId');
    }

    get productIdControl(): AbstractControl | null {
      return this.orderForm.get('productId');
    }

    get quantityControl(): AbstractControl | null {
      return this.orderForm.get('quantity');
    }

    get promoCodeIdControl(): AbstractControl | null {
      return this.orderForm.get('promoCodeId');
    }

    get statusControl(): AbstractControl | null {
      return this.orderForm.get('status');
    }

    getStatusSeverity(status: string): string {
      switch (status) {
        case OrderStatus.PENDING:
          return 'warning';
        case OrderStatus.COMPLETED:
          return 'success';
        case OrderStatus.CANCELLED:
          return 'danger';
        default:
          return 'secondary';
      }
    }

    calculateTotal(): number {
      // This is a simplified example - in a real app, you would get product price dynamically
      // and calculate discounts based on promo code
      return 0;
    }
  }
