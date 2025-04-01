import { Component, OnDestroy, OnInit } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { ProductService } from '../../../shared/service/product.service'; // Adjust the import path as necessary
import { ProductResponseDto, GetAllProductsResponseDto } from '../model/product.dto'; // Adjust the import path as necessary
import { Router } from '@angular/router';
import { PaginatorModule } from 'primeng/paginator';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import { Subject, BehaviorSubject, debounceTime, takeUntil } from 'rxjs';

@Component({
    selector: 'app-list-product',
    templateUrl: './listproduct.component.html',
    styleUrls: ['./listproduct.component.scss'],
    standalone: true,
    imports: [
        TableModule,
        HttpClientModule,
        CommonModule,
        InputTextModule,
        ButtonModule,
        IconFieldModule,
        InputIconModule,
        PaginatorModule,
        ConfirmDialogModule,
        ToastModule
    ],
    providers: [ProductService, ConfirmationService, MessageService]
})
export class ListProductComponent implements OnInit, OnDestroy {
    private unsubscribe$ = new Subject<void>();
    private searchQuery$ = new BehaviorSubject<string>(''); // BehaviorSubject for search input
    products!: ProductResponseDto[];
    loading: boolean = true;
    first: number = 0; // First row offset
    rows: number = 10; // Number of rows per page
    totalRecords: number = 0; // Total number of records

    constructor(
        private productService: ProductService,
        private router: Router,
        private confirmationService: ConfirmationService,
        private messageService: MessageService
    ) {}

    ngOnInit() {
        this.loadProducts();
        this.setupSearchListener(); // Set up the search listener
    }

    setupSearchListener() {
        this.searchQuery$
            .pipe(debounceTime(500), takeUntil(this.unsubscribe$))
            .subscribe(searchValue => {
                this.loadProducts(1, this.rows, searchValue); // Load products with the search value
            });
    }

    loadProducts(page: number = 1, limit: number = this.rows, search: string = '') {
        this.loading = true;
        this.productService.getAllProducts(page, limit, search) // Pass the search parameter
            .pipe(takeUntil(this.unsubscribe$))
            .subscribe((response: GetAllProductsResponseDto) => {
                this.products = response.data;
                this.totalRecords = response.pagination?.totalItems || 0;
                this.loading = false;
            }, error => {
                this.loading = false;
                this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to load products', life: 3000 });
                console.error('Error loading products:', error);
            });
    }

    onSearch(event: Event) {
        const searchValue = (event.target as HTMLInputElement).value;
        this.searchQuery$.next(searchValue); // Update the search query
    }

    onEdit(productId: string | number) {
        this.router.navigate(['pages/product/edit', productId]);
    }

    confirmDelete(event: Event, productId: string | number) {
        this.confirmationService.confirm({
            target: event.target as EventTarget,
            message: 'Do you want to delete this product?',
            header: 'Danger Zone',
            icon: 'pi pi-info-circle',
            rejectButtonProps: {
                label: 'Cancel',
                severity: 'secondary',
                outlined: true
            },
            acceptButtonProps: {
                label: 'Delete',
                severity: 'danger'
            },
            accept: () => {
                this.onDelete(productId);
            },
            reject: () => {
                this.messageService.add({ severity: 'error', summary: 'Rejected', detail: 'You have rejected', life: 3000 });
            }
        });
    }

    onDelete(productId: string | number) {
        this.productService.deleteProductById(String(productId)).subscribe({
            next: () => {
                this.messageService.add({ severity: 'info', summary: 'Confirmed', detail: 'Product deleted', life: 3000 });
                this.loadProducts(1, this.rows, this.searchQuery$.getValue()); // Reload products after deletion
            },
            error: (error) => {
                this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to delete product', life: 3000 });
                console.error('Error deleting product:', error);
            }
        });
    }

    onView(productId: string | number) {
        console.log('View button clicked for product ID:', productId);
        // Implement view functionality if needed
    }

    onPageChange(event: any) {
        this.first = event.first;
        this.rows = event.rows;
        const page = event.first / event.rows + 1; // Calculate page number
        this.loadProducts(page, event.rows, this.searchQuery$.getValue()); // Load products for the new page
    }

    navigateToCreateProduct() {
        this.router.navigate(['/pages/product/create']);
    }

    ngOnDestroy() {
        this.unsubscribe$.next();
        this.unsubscribe$.complete();
    }
}
