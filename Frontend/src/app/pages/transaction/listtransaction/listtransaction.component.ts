import { Component, OnDestroy, OnInit } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { TransactionService } from '../../../shared/service/transaction.service';
import { TransactionResponseDto, GetAllTransactionsResponseDto } from '../model/transaction.dto';
import { Router } from '@angular/router';
import { PaginatorModule } from 'primeng/paginator';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import { Subject, debounceTime, distinctUntilChanged, takeUntil } from 'rxjs';

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
    private searchSubject = new Subject<string>();
    transactions!: TransactionResponseDto[];
    loading: boolean = true;
    first: number = 0;
    rows: number = 10;
    totalRecords: number = 0;
    searchTerm: string = '';

    constructor(
        private transactionService: TransactionService,
        private router: Router,
        private confirmationService: ConfirmationService,
        private messageService: MessageService
    ) {}

    ngOnInit() {
        this.loadTransactions(); // Load transactions only once on initialization

        this.searchSubject.pipe(
            debounceTime(500),
            distinctUntilChanged(),
            takeUntil(this.unsubscribe$)
        ).subscribe(searchValue => {
            this.searchTerm = searchValue;
            this.loadTransactions(1, this.rows, searchValue); // Load transactions based on search input
        });
    }

    loadTransactions(page: number = 1, limit: number = this.rows, search: string = '') {
        this.loading = true;
        this.transactionService.getAllTransactions(page, limit, search)
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
        const searchValue = (event.target as HTMLInputElement).value.trim();
        this.searchSubject.next(searchValue); // Trigger search
    }

    onEdit(transactionId: string | number) {
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
                this.loadTransactions(1, this.rows, this.searchTerm); // Reload transactions after deletion
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
        const page = event.first / event.rows + 1; // Calculate the current page
        this.loadTransactions(page, event.rows, this.searchTerm); // Load transactions for the new page
    }

    navigateToCreateTransaction() {
        this.router.navigate(['/pages/transaction/create']);
    }

    ngOnDestroy() {
        this.unsubscribe$.next();
        this.unsubscribe$.complete();
    }
}
