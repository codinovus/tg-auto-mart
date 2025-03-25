import { Component, OnDestroy, OnInit } from '@angular/core';
import { Table } from 'primeng/table';
import { HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { PaymentService } from '../../../shared/service/payment.service'; // Adjust the import path as necessary
import { PaymentResponseDto, GetAllPaymentsResponseDto } from '../model/payment.dto'; // Adjust the import path as necessary
import { Router } from '@angular/router';
import { PaginatorModule } from 'primeng/paginator';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import { Subject, takeUntil } from 'rxjs';

@Component({
    selector: 'app-list-payment',
    templateUrl: './listpayment.component.html',
    styleUrls: ['./listpayment.component.scss'],
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
    providers: [PaymentService, ConfirmationService, MessageService]
})
export class ListPaymentComponent implements OnInit, OnDestroy {
    private unsubscribe$ = new Subject<void>();
    payments!: PaymentResponseDto[];
    loading: boolean = true;
    first: number = 0; // First row offset
    rows: number = 10; // Number of rows per page
    totalRecords: number = 0; // Total number of

    constructor(
        private paymentService: PaymentService,
        private router: Router,
        private confirmationService: ConfirmationService,
        private messageService: MessageService
    ) {}

    ngOnInit() {
        this.loadPayments();
    }

    loadPayments(page: number = 1, limit: number = this.rows) {
        this.loading = true;
        this.paymentService.getAllPayments(page, limit)
            .pipe(takeUntil(this.unsubscribe$))
            .subscribe((response: GetAllPaymentsResponseDto) => {
                this.payments = response.data;
                this.totalRecords = response.pagination?.totalItems || 0;
                this.loading = false;
            }, error => {
                this.loading = false;
                this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to load payments', life: 3000 });
                console.error('Error loading payments:', error);
            });
    }

    onSearch(event: Event) {
        const searchValue = (event.target as HTMLInputElement).value;
        console.log('Search Value:', searchValue);
        // Implement search functionality if needed
    }

    onEdit(paymentId: string | number) {
        console.log('Edit button clicked for payment ID:', paymentId);
        this.router.navigate(['pages/payment/edit', paymentId]);
    }

    confirmDelete(event: Event, paymentId: string | number) {
        this.confirmationService.confirm({
            target: event.target as EventTarget,
            message: 'Do you want to delete this payment?',
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
                this.onDelete(paymentId);
            },
            reject: () => {
                this.messageService.add({ severity: 'error', summary: 'Rejected', detail: 'You have rejected', life: 3000 });
            }
        });
    }

    onDelete(paymentId: string | number) {
        this.paymentService.deletePaymentById(String(paymentId)).subscribe({
            next: () => {
                this.messageService.add({ severity: 'info', summary: 'Confirmed', detail: 'Payment deleted', life: 3000 });
                this.loadPayments();
            },
            error: (error) => {
                this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to delete payment', life: 3000 });
                console.error('Error deleting payment:', error);
            }
        });
    }

    onView(paymentId: string | number) {
        console.log('View button clicked for payment ID:', paymentId);
        // Implement view functionality if needed
    }

    onPageChange(event: any) {
        this.first = event.first;
        this.rows = event.rows;
        const page = event.first / event.rows + 1;
        this.loadPayments(page, event.rows);
    }

    navigateToCreatePayment() {
        this.router.navigate(['/pages/payment/create']);
    }

    ngOnDestroy() {
        this.unsubscribe$.next();
        this.unsubscribe$.complete();
    }
}
