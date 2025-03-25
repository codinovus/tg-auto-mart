import { Component, OnDestroy, OnInit } from '@angular/core';
import { Table } from 'primeng/table';
import { HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { PromoCodeService } from '../../../shared/service/promo-code.service'; // Adjust the import path as necessary
import { PromoCodeResponseDto, GetAllPromoCodesResponseDto } from '../model/promo-code.dto'; // Adjust the import path as necessary
import { Router } from '@angular/router';
import { PaginatorModule } from 'primeng/paginator';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import { Subject, takeUntil } from 'rxjs';
import { TagModule } from 'primeng/tag';

@Component({
    selector: 'app-list-promo-code',
    templateUrl: './listpromo-code.component.html',
    styleUrls: ['./listpromo-code.component.scss'],
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
        ToastModule,
        TagModule
    ],
    providers: [PromoCodeService, ConfirmationService, MessageService]
})
export class ListPromoCodeComponent implements OnInit, OnDestroy {
    private unsubscribe$ = new Subject<void>();
    promoCodes!: PromoCodeResponseDto[];
    loading: boolean = true;
    first: number = 0; // First row offset
    rows: number = 10; // Number of rows per page
    totalRecords: number = 0; // Total number of records

    constructor(
        private promoCodeService: PromoCodeService,
        private router: Router,
        private confirmationService: ConfirmationService,
        private messageService: MessageService
    ) {}

    ngOnInit() {
        this.loadPromoCodes();
    }

    loadPromoCodes(page: number = 1, limit: number = this.rows) {
        this.loading = true;
        this.promoCodeService.getAllPromoCodes(page, limit)
            .pipe(takeUntil(this.unsubscribe$))
            .subscribe((response: GetAllPromoCodesResponseDto) => {
                this.promoCodes = response.data;
                this.totalRecords = response.pagination?.totalItems || 0;
                this.loading = false;
            }, error => {
                this.loading = false;
                this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to load promo codes', life: 3000 });
                console.error('Error loading promo codes:', error);
            });
    }

    onSearch(event: Event) {
        const searchValue = (event.target as HTMLInputElement).value;
        console.log('Search Value:', searchValue);
        // Implement search functionality if needed
    }

    onEdit(promoCodeId: string | number) {
        console.log('Edit button clicked for promo code ID:', promoCodeId);
        this.router.navigate(['pages/promo-code/edit', promoCodeId]);
    }

    confirmDelete(event: Event, promoCodeId: string | number) {
        this.confirmationService.confirm({
            target: event.target as EventTarget,
            message: 'Do you want to delete this promo code?',
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
                this.onDelete(promoCodeId);
            },
            reject: () => {
                this.messageService.add({ severity: 'error', summary: 'Rejected', detail: 'You have rejected', life: 3000 });
            }
        });
    }

    onDelete(promoCodeId: string | number) {
        this.promoCodeService.deletePromoCodeById(String(promoCodeId)).subscribe({
            next: () => {
                this.messageService.add({ severity: 'info', summary: 'Confirmed', detail: 'Promo code deleted', life: 3000 });
                this.loadPromoCodes(); // Reload promo codes after deletion
            },
            error: (error) => {
                this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to delete promo code', life: 3000 });
                console.error('Error deleting promo code:', error);
            }
        });
    }

    onView(promoCodeId: string | number) {
        console.log('View button clicked for promo code ID:', promoCodeId);
        // Implement view functionality if needed
    }

    onPageChange(event: any) {
        this.first = event.first;
        this.rows = event.rows;
        const page = event.first / event.rows + 1; // Calculate page number
        this.loadPromoCodes(page, event.rows); // Load promo codes for the new page
    }

    navigateToCreatePromoCode() {
        this.router.navigate(['/pages/promo-code/create']);
    }

    ngOnDestroy() {
        this.unsubscribe$.next();
        this.unsubscribe$.complete();
    }
}
