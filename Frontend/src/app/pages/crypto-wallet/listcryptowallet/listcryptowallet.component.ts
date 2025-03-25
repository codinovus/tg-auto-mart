import { Component, OnDestroy, OnInit } from '@angular/core';
import { Table } from 'primeng/table';
import { HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { CryptoWalletResponseDto, GetAllCryptoWalletsResponseDto } from '../model/crypto-wallet.dto';
import { Router } from '@angular/router';
import { PaginatorModule } from 'primeng/paginator';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import { Subject, takeUntil } from 'rxjs';
import { CryptoWalletService } from '../../../shared/service/crypto-wallet.service';

@Component({
    selector: 'app-list-cryptowallet',
    templateUrl: './listcryptowallet.component.html',
    styleUrls: ['./listcryptowallet.component.scss'],
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
    providers: [CryptoWalletService, ConfirmationService, MessageService]
})
export class ListCryptowalletComponent implements OnInit, OnDestroy {
    private unsubscribe$ = new Subject<void>();
    wallets!: CryptoWalletResponseDto[];
    loading: boolean = true;
    first: number = 0; // First row offset
    rows: number = 10; // Number of rows per page
    totalRecords: number = 0; // Total number of records

    constructor(
        private walletService: CryptoWalletService,
        private router: Router,
        private confirmationService: ConfirmationService,
        private messageService: MessageService
    ) {}

    ngOnInit() {
        this.loadWallets();
    }

    loadWallets(page: number = 1, limit: number = this.rows) {
        this.loading = true;
        this.walletService.getAllCryptoWallets(page, limit)
            .pipe(takeUntil(this.unsubscribe$))
            .subscribe((response: GetAllCryptoWalletsResponseDto) => {
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
        const searchValue = (event.target as HTMLInputElement).value;
        console.log('Search Value:', searchValue);
        // Implement search functionality if needed
    }

    onEdit(walletId: string | number) {
        console.log('Edit button clicked for wallet ID:', walletId);
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
        this.walletService.deleteCryptoWalletById(String(walletId)).subscribe({
            next: () => {
                this.messageService.add({ severity: 'info', summary: 'Confirmed', detail: 'Wallet deleted', life: 3000 });
                this.loadWallets(); // Reload wallets after deletion
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
        const page = event.first / event.rows + 1; // Calculate page number
        this.loadWallets(page, event.rows); // Load wallets for the new page
    }

    navigateToCreateWallet() {
        this.router.navigate(['/pages/wallet/create']);
    }

    copyToClipboard(address: string) {
        navigator.clipboard.writeText(address).then(() => {
            this.messageService.add({ severity: 'success', summary: 'Copied', detail: 'Wallet address copied to clipboard', life: 3000 });
        }).catch(err => {
            console.error('Failed to copy: ', err);
            this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to copy wallet address', life: 3000 });
        });
    }

    ngOnDestroy() {
        this.unsubscribe$.next();
        this.unsubscribe$.complete();
    }
}
