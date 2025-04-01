import { Component, OnDestroy, OnInit } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { DisputeService } from '../../../shared/service/dispute.service';
import { DisputeResponseDto, GetAllDisputesResponseDto } from '../model/dispute.dto';
import { Router } from '@angular/router';
import { PaginatorModule } from 'primeng/paginator';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import { Subject, takeUntil, debounceTime, BehaviorSubject } from 'rxjs';

@Component({
    selector: 'app-list-dispute',
    templateUrl: './listdispute.component.html',
    styleUrls: ['./listdispute.component.scss'],
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
    providers: [DisputeService, ConfirmationService, MessageService]
})
export class ListDisputeComponent implements OnInit, OnDestroy {
    private unsubscribe$ = new Subject<void>();
    disputes!: DisputeResponseDto[];
    loading: boolean = true;
    first: number = 0;
    rows: number = 10;
    totalRecords: number = 0;
    searchQuery$ = new BehaviorSubject<string>('');

    constructor(
        private disputeService: DisputeService,
        private router: Router,
        private confirmationService: ConfirmationService,
        private messageService: MessageService
    ) {}

    ngOnInit() {
        this.loadDisputes();
        this.setupSearchListener();
    }

    loadDisputes(page: number = 1, limit: number = this.rows, search: string = '') {
        this.loading = true;
        this.disputeService.getAllDisputes(page, limit, search)
            .pipe(takeUntil(this.unsubscribe$))
            .subscribe((response: GetAllDisputesResponseDto) => {
                this.disputes = response.data;
                this.totalRecords = response.pagination?.totalItems || 0;
                this.loading = false;
            }, error => {
                this.loading = false;
                this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to load disputes', life: 3000 });
                console.error('Error loading disputes:', error);
            });
    }

    setupSearchListener() {
        this.searchQuery$
            .pipe(debounceTime(500), takeUntil(this.unsubscribe$))
            .subscribe(searchValue => {
                this.loadDisputes(1, this.rows, searchValue);
            });
    }

    onSearch(event: Event) {
        const searchValue = (event.target as HTMLInputElement).value;
        this.searchQuery$.next(searchValue);
    }

    onEdit(disputeId: string | number) {
        this.router.navigate(['pages/dispute/edit', disputeId]);
    }

    confirmDelete(event: Event, disputeId: string | number) {
        this.confirmationService.confirm({
            target: event.target as EventTarget,
            message: 'Do you want to delete this dispute?',
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
                this.onDelete(disputeId);
            },
            reject: () => {
                this.messageService.add({ severity: 'error', summary: 'Rejected', detail: 'You have rejected', life: 3000 });
            }
        });
    }

    onDelete(disputeId: string | number) {
        this.disputeService.deleteDisputeById(String(disputeId)).subscribe({
            next: () => {
                this.messageService.add({ severity: 'info', summary: 'Confirmed', detail: 'Dispute deleted', life: 3000 });
                this.loadDisputes();
            },
            error: (error) => {
                this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to delete dispute', life: 3000 });
                console.error('Error deleting dispute:', error);
            }
        });
    }

    onView(disputeId: string | number) {
        console.log('View button clicked for dispute ID:', disputeId);
    }

    onPageChange(event: any) {
        this.first = event.first;
        this.rows = event.rows;
        const page = event.first / event.rows + 1;
        this.loadDisputes(page, event.rows, this.searchQuery$.value);
    }

    navigateToCreateDispute() {
        this.router.navigate(['/pages/dispute/create']);
    }

    ngOnDestroy() {
        this.unsubscribe$.next();
        this.unsubscribe$.complete();
    }
}
