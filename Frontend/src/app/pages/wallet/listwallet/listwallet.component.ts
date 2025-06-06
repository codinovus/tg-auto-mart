import { Component, OnDestroy, OnInit } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { WalletService } from '../../../shared/service/wallet.service';
import { WalletResponseDto, GetAllWalletsResponseDto } from '../model/wallet.dto';
import { Router } from '@angular/router';
import { PaginatorModule } from 'primeng/paginator';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import { Subject, debounceTime, distinctUntilChanged, takeUntil } from 'rxjs';

@Component({
    selector: 'app-list-wallet',
    templateUrl: './listwallet.component.html',
    styleUrls: ['./listwallet.component.scss'],
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
    providers: [WalletService, ConfirmationService, MessageService]
})
export class ListWalletComponent implements OnInit, OnDestroy {
    private unsubscribe$ = new Subject<void>();
    private searchSubject = new Subject<string>();
    wallets!: WalletResponseDto[];
    loading: boolean = true;
    first: number = 0;
    rows: number = 10;
    totalRecords: number = 0;
    searchTerm: string = '';

    constructor(
        private walletService: WalletService,
        private router: Router,
        private confirmationService: ConfirmationService,
        private messageService: MessageService
    ) {}

    ngOnInit() {
        this.loadWallets(); // Load wallets only once on initialization

        this.searchSubject.pipe(
            debounceTime(500),
            distinctUntilChanged(),
            takeUntil(this.unsubscribe$)
        ).subscribe(searchValue => {
            this.searchTerm = searchValue;
            this.loadWallets(1, this.rows, searchValue); // Load wallets based on search input
        });
    }

    loadWallets(page: number = 1, limit: number = this.rows, search: string = '') {
        this.loading = true;
        this.walletService.getAllWallets(page, limit, search)
            .pipe(takeUntil(this.unsubscribe$))
            .subscribe((response: GetAllWalletsResponseDto) => {
                this.wallets = response.data;
                this.totalRecords = response.pagination?.totalItems || 0;
                this.loading = false;
            }, error => {
                this.loading = false;
                this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to load wallets', life: 3000 });
                console.error('Error loading wallets:', error);
            });
    }

    onSearch(event: Event) {
        const searchValue = (event.target as HTMLInputElement).value.trim();
        this.searchSubject.next(searchValue); // Trigger search
    }

    onEdit(walletId: string | number) {
        this.router.navigate(['pages/wallet/edit', walletId]);
    }

    confirmDelete(event: Event, walletId: string | number) {
        this.confirmationService.confirm({
            target: event.target as EventTarget,
            message: 'Do you want to delete this wallet?',
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
                this.onDelete(walletId);
            },
            reject: () => {
                this.messageService.add({ severity: 'error', summary: 'Rejected', detail: 'You have rejected', life: 3000 });
            }
        });
    }
    onDelete(walletId: string | number) {
        this.walletService.deleteWalletById(String(walletId)).subscribe({
            next: () => {
                this.messageService.add({ severity: 'info', summary: 'Confirmed', detail: 'Wallet deleted', life: 3000 });
                this.loadWallets(1, this.rows, this.searchTerm); // Reload wallets after deletion
            },
            error: (error) => {
                this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to delete wallet', life: 3000 });
                console.error('Error deleting wallet:', error);
            }
        });
    }

    onView(walletId: string | number) {
        console.log('View button clicked for wallet ID:', walletId);
        // Implement view functionality if needed
    }

    onPageChange(event: any) {
        this.first = event.first;
        this.rows = event.rows;
        const page = event.first / event.rows + 1; // Calculate the current page
        this.loadWallets(page, event.rows, this.searchTerm); // Load wallets for the new page
    }

    navigateToCreateWallet() {
        this.router.navigate(['/pages/wallet/create']);
    }

    ngOnDestroy() {
        this.unsubscribe$.next();
        this.unsubscribe$.complete();
    }
}
