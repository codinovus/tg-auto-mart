import { Component, OnDestroy, OnInit } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { ProductKeyService } from '../../../shared/service/product-key.service';
import { ProductKeyResponseDto, GetAllProductKeysResponseDto } from '../model/product-key.dto';
import { Router } from '@angular/router';
import { PaginatorModule } from 'primeng/paginator';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import { Subject, debounceTime, distinctUntilChanged, takeUntil } from 'rxjs';

@Component({
    selector: 'app-list-product-key',
    templateUrl: './listproduct-key.component.html',
    styleUrls: ['./listproduct-key.component.scss'],
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
    providers: [ProductKeyService, ConfirmationService, MessageService]
})
export class ListProductKeyComponent implements OnInit, OnDestroy {
    private unsubscribe$ = new Subject<void>();
    private searchSubject = new Subject<string>();
    productKeys!: ProductKeyResponseDto[];
    loading: boolean = true;
    first: number = 0;
    rows: number = 10;
    totalRecords: number = 0;
    searchTerm: string = '';

    constructor(
        private productKeyService: ProductKeyService,
        private router: Router,
        private confirmationService: ConfirmationService,
        private messageService: MessageService
    ) {}

    ngOnInit() {
        this.loadProductKeys(); // Load product keys only once on initialization

        this.searchSubject.pipe(
            debounceTime(500),
            distinctUntilChanged(),
            takeUntil(this.unsubscribe$)
        ).subscribe(searchValue => {
            this.searchTerm = searchValue;
            this.loadProductKeys(1, this.rows, searchValue); // Load product keys based on search input
        });
    }

    loadProductKeys(page: number = 1, limit: number = this.rows, search: string = '') {
        this.loading = true;
        this.productKeyService.getAllProductKeys(page, limit, search)
            .pipe(takeUntil(this.unsubscribe$))
            .subscribe((response: GetAllProductKeysResponseDto) => {
                this.productKeys = response.data;
                this.totalRecords = response.pagination?.totalItems || 0;
                this.loading = false;
            }, error => {
                this.loading = false;
                this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to load product keys', life: 3000 });
                console.error('Error loading product keys:', error);
            });
    }

    onSearch(event: Event) {
        const searchValue = (event.target as HTMLInputElement).value.trim();
        this.searchSubject.next(searchValue); // Trigger search
    }

    onEdit(productKeyId: string | number) {
        this.router.navigate(['pages/product-key/edit', productKeyId]);
    }

    confirmDelete(event: Event, productKeyId: string | number) {
        this.confirmationService.confirm({
            target: event.target as EventTarget,
            message: 'Do you want to delete this product key?',
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
                this.onDelete(productKeyId);
            },
            reject: () => {
                this.messageService.add({ severity: 'error', summary                : 'Rejected', detail: 'You have rejected', life: 3000 });
            }
        });
    }

    onDelete(productKeyId: string | number) {
        this.productKeyService.deleteProductKeyById(String(productKeyId)).subscribe({
            next: () => {
                this.messageService.add({ severity: 'info', summary: 'Confirmed', detail: 'Product key deleted', life: 3000 });
                this.loadProductKeys(1, this.rows, this.searchTerm); // Reload product keys after deletion
            },
            error: (error) => {
                this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to delete product key', life: 3000 });
                console.error('Error deleting product key:', error);
            }
        });
    }

    onView(productKeyId: string | number) {
        console.log('View button clicked for product key ID:', productKeyId);
        // Implement view functionality if needed
    }

    onPageChange(event: any) {
        this.first = event.first;
        this.rows = event.rows;
        const page = event.first / event.rows + 1; // Calculate the current page
        this.loadProductKeys(page, event.rows, this.searchTerm); // Load product keys for the new page
    }

    navigateToCreateProductKey() {
        this.router.navigate(['/pages/product-key/create']);
    }

    ngOnDestroy() {
        this.unsubscribe$.next();
        this.unsubscribe$.complete();
    }
}
