import { Component, OnDestroy, OnInit } from '@angular/core';
import { Table } from 'primeng/table';
import { HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { TransactionService } from '../../../shared/service/transaction.service'; // Adjust the import path as necessary
import { TransactionResponseDto, GetAllTransactionsResponseDto } from '../model/transaction.dto'; // Adjust the import path as necessary
import { Router } from '@angular/router';
import { PaginatorModule } from 'primeng/paginator';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import { Subject, takeUntil } from 'rxjs';

@Component({
    selector: 'app-list-transaction',
    templateUrl: './listtransaction.component.html',
    styleUrls: ['./listtransaction.component.scss'],
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
    providers: [TransactionService, ConfirmationService, MessageService]
})
export class ListTransactionComponent implements OnInit, OnDestroy {
    private unsubscribe$ = new Subject<void>();
    transactions!: TransactionResponseDto[];
    loading: boolean = true;
    first: number = 0; // First row offset
    rows: number = 10; // Number of rows per page
    totalRecords: number = 0; // Total number of records

    constructor(
        private transactionService: TransactionService,
        private router: Router,
        private confirmationService: ConfirmationService,
        private messageService: MessageService
    ) {}

    ngOnInit() {
        this.loadTransactions();
    }

    loadTransactions(page: number = 1, limit: number = this.rows) {
        this.loading = true;
        this.transactionService.getAllTransactions(page, limit)
            .pipe(takeUntil(this.unsubscribe$))
            .subscribe((response: GetAllTransactionsResponseDto) => {
                this.transactions = response.data;
                this.totalRecords = response.pagination?.totalItems || 0;
                this.loading = false;
            }, error => {
                this.loading = false;
                this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to load transactions', life: 3000 });
                console.error('Error loading transactions:', error);
            });
    }

    onSearch(event: Event) {
        const searchValue = (event.target as HTMLInputElement).value;
        console.log('Search Value:', searchValue);
        // Implement search functionality if needed
    }

    onEdit(transactionId: string | number) {
        console.log('Edit button clicked for transaction ID:', transactionId);
        this.router.navigate(['pages/transaction/edit', transactionId]);
    }

    confirmDelete(event: Event, transactionId: string | number) {
        this.confirmationService.confirm({
            target: event.target as EventTarget,
            message: 'Do you want to delete this transaction?',
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
                this.onDelete(transactionId);
            },
            reject: () => {
                this.messageService.add({ severity: 'error', summary: 'Rejected', detail: 'You have rejected', life: 3000 });
            }
        });
    }

    onDelete(transactionId: string | number) {
        this.transactionService.deleteTransactionById(String(transactionId)).subscribe({
            next: () => {
                this.messageService.add({ severity: 'info', summary: 'Confirmed', detail: 'Transaction deleted', life: 3000 });
                this.loadTransactions(); // Reload transactions after deletion
            },
 error: (error) => {
                this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to delete transaction', life: 3000 });
                console.error('Error deleting transaction:', error);
            }
        });
    }

    onView(transactionId: string | number) {
        console.log('View button clicked for transaction ID:', transactionId);
        // Implement view functionality if needed
    }

    onPageChange(event: any) {
        this.first = event.first;
        this.rows = event.rows;
        const page = event.first / event.rows + 1; // Calculate page number
        this.loadTransactions(page, event.rows); // Load transactions for the new page
    }

    navigateToCreateTransaction() {
        this.router.navigate(['/pages/transaction/create']);
    }

    ngOnDestroy() {
        this.unsubscribe$.next();
        this.unsubscribe$.complete();
    }
}
