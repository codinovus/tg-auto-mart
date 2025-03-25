import { Component, OnDestroy, OnInit } from '@angular/core';
import { Table } from 'primeng/table';
import { HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { OrderService } from '../../../shared/service/order.service'; // Adjust the import path as necessary
import { OrderResponseDto, GetAllOrdersResponseDto } from '../model/order.dto'; // Adjust the import path as necessary
import { Router } from '@angular/router';
import { PaginatorModule } from 'primeng/paginator';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import { Subject, takeUntil } from 'rxjs';

@Component({
    selector: 'app-list-order',
    templateUrl: './listorder.component.html',
    styleUrls: ['./listorder.component.scss'],
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
    providers: [OrderService, ConfirmationService, MessageService]
})
export class ListOrderComponent implements OnInit, OnDestroy {
    private unsubscribe$ = new Subject<void>();
    orders!: OrderResponseDto[];
    loading: boolean = true;
    first: number = 0; // First row offset
    rows: number = 10; // Number of rows per page
    totalRecords: number = 0; // Total number of records

    constructor(
        private orderService: OrderService,
        private router: Router,
        private confirmationService: ConfirmationService,
        private messageService: MessageService
    ) {}

    ngOnInit() {
        this.loadOrders();
    }

    loadOrders(page: number = 1, limit: number = this.rows) {
        this.loading = true;
        this.orderService.getAllOrders(page, limit)
            .pipe(takeUntil(this.unsubscribe$))
            .subscribe((response: GetAllOrdersResponseDto) => {
                this.orders = response.data;
                this.totalRecords = response.pagination?.totalItems || 0;
                this.loading = false;
            }, error => {
                this.loading = false;
                this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to load orders', life: 3000 });
                console.error('Error loading orders:', error);
            });
    }

    onSearch(event: Event) {
        const searchValue = (event.target as HTMLInputElement).value;
        console.log('Search Value:', searchValue);
        // Implement search functionality if needed
    }

    onEdit(orderId: string | number) {
        console.log('Edit button clicked for order ID:', orderId);
        this.router.navigate(['pages/order/edit', orderId]);
    }

    confirmDelete(event: Event, orderId: string | number) {
        this.confirmationService.confirm({
            target: event.target as EventTarget,
            message: 'Do you want to delete this order?',
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
                this.onDelete(orderId);
            },
            reject: () => {
                this.messageService.add({ severity: 'error', summary: 'Rejected', detail: 'You have rejected', life: 3000 });
            }
        });
    }

    onDelete(orderId: string | number) {
        this.orderService.deleteOrderById(String(orderId)).subscribe({
            next: () => {
                this.messageService.add({ severity: 'info', summary: 'Confirmed', detail: 'Order deleted', life: 3000 });
                this.loadOrders(); // Reload orders after deletion
            },
            error: (error) => {
                this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to delete order', life: 3000 });
                console.error('Error deleting order:', error);
            }
        });
    }

    onView(orderId: string | number) {
        console.log('View button clicked for order ID:', orderId);
        // Implement view functionality if needed
    }

    onPageChange(event: any) {
        this.first = event.first;
        this.rows = event.rows;
        const page = event.first / event.rows + 1; // Calculate page number
        this.loadOrders(page, event.rows); // Load orders for the new page
    }

    navigateToCreateOrder() {
        this.router.navigate(['/pages/order/create']);
    }

    ngOnDestroy() {
        this.unsubscribe$.next();
        this.unsubscribe$.complete();
    }
}
