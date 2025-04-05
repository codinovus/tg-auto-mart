import { Component, OnDestroy, OnInit } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { ProductCategoryService } from '../../../shared/service/product-category.service';
import { ProductCategoryResponseDto, GetAllProductCategoriesResponseDto } from '../model/product-category.dto';
import { Router } from '@angular/router';
import { PaginatorModule } from 'primeng/paginator';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import { Subject, debounceTime, distinctUntilChanged, takeUntil } from 'rxjs';

@Component({
    selector: 'app-list-product-category',
    templateUrl: './listproduct-category.component.html',
    styleUrls: ['./listproduct-category.component.scss'],
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
    providers: [ProductCategoryService, ConfirmationService, MessageService]
})
export class ListProductCategoryComponent implements OnInit, OnDestroy {
    private unsubscribe$ = new Subject<void>();
    private searchSubject = new Subject<string>();
    categories!: ProductCategoryResponseDto[];
    loading: boolean = true;
    first: number = 0;
    rows: number = 10;
    totalRecords: number = 0;
    searchTerm: string = '';

    constructor(
        private productCategoryService: ProductCategoryService,
        private router: Router,
        private confirmationService: ConfirmationService,
        private messageService: MessageService
    ) {}

    ngOnInit() {
        this.loadProductCategories(); // Load product categories only once on initialization

        this.searchSubject.pipe(
            debounceTime(500),
            distinctUntilChanged(),
            takeUntil(this.unsubscribe$)
        ).subscribe(searchValue => {
            this.searchTerm = searchValue;
            this.loadProductCategories(1, this.rows, searchValue); // Load product categories based on search input
        });
    }

    loadProductCategories(page: number = 1, limit: number = this.rows, search: string = '') {
        this.loading = true;
        this.productCategoryService.getAllProductCategories(page, limit, search)
            .pipe(takeUntil(this.unsubscribe$))
            .subscribe((response: GetAllProductCategoriesResponseDto) => {
                this.categories = response.data;
                this.totalRecords = response.pagination?.totalItems || 0;
                this.loading = false;
            }, error => {
                this.loading = false;
                this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to load product categories', life: 3000 });
                console.error('Error loading product categories:', error);
            });
    }

    onSearch(event: Event) {
        const searchValue = (event.target as HTMLInputElement).value.trim();
        this.searchSubject.next(searchValue); // Trigger search
    }

    onEdit(categoryId: string | number) {
        this.router.navigate(['pages/product-category/edit', categoryId]);
    }

    confirmDelete(event: Event, categoryId: string | number) {
        this.confirmationService.confirm({
            target: event.target as EventTarget,
            message: 'Do you want to delete this product category?',
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
                this.onDelete(categoryId);
            },
            reject: () => {
                this.messageService.add({ severity: 'error', summary: 'Rejected', detail:                'You have rejected', life: 3000 });
            }
        });
    }

    onDelete(categoryId: string | number) {
        this.productCategoryService.deleteProductCategoryById(String(categoryId)).subscribe({
            next: () => {
                this.messageService.add({ severity: 'info', summary: 'Confirmed', detail: 'Product category deleted', life: 3000 });
                this.loadProductCategories(1, this.rows, this.searchTerm); // Reload product categories after deletion
            },
            error: (error) => {
                this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to delete product category', life: 3000 });
                console.error('Error deleting product category:', error);
            }
        });
    }

    onView(categoryId: string | number) {
        console.log('View button clicked for category ID:', categoryId);
        // Implement view functionality if needed
    }

    onPageChange(event: any) {
        this.first = event.first;
        this.rows = event.rows;
        const page = event.first / event.rows + 1; // Calculate the current page
        this.loadProductCategories(page, event.rows, this.searchTerm); // Load product categories for the new page
    }

    navigateToCreateProductCategory() {
        this.router.navigate(['/pages/product-category/create']);
    }

    ngOnDestroy() {
        this.unsubscribe$.next();
        this.unsubscribe$.complete();
    }
}
