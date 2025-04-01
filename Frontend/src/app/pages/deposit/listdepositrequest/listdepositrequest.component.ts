import { Component, OnDestroy, OnInit } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { DepositRequestService } from '../../../shared/service/deposit-request.service';
import { DepositRequestResponseDto, GetAllDepositRequestsResponseDto } from '../model/deposit-request.dto';
import { Router } from '@angular/router';
import { PaginatorModule } from 'primeng/paginator';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import { Subject, debounceTime, distinctUntilChanged, takeUntil } from 'rxjs';

@Component({
    selector: 'app-list-deposit-request',
    templateUrl: './listdepositrequest.component.html',
    styleUrls: ['./listdepositrequest.component.scss'],
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
    providers: [DepositRequestService, ConfirmationService, MessageService]
})
export class ListDepositRequestComponent implements OnInit, OnDestroy {
    private unsubscribe$ = new Subject<void>();
    private searchSubject = new Subject<string>();
    depositRequests!: DepositRequestResponseDto[];
    loading: boolean = true;
    first: number = 0;
    rows: number = 10;
    totalRecords: number = 0;
    lastSearchTerm: string = '';

    constructor(
        private depositRequestService: DepositRequestService,
        private router: Router,
        private confirmationService: ConfirmationService,
        private messageService: MessageService
    ) {}

    ngOnInit() {
        this.loadDepositRequests();
        this.searchSubject.pipe(
            debounceTime(500),
            distinctUntilChanged(),
            takeUntil(this.unsubscribe$)
        ).subscribe(searchTerm => {
            if (searchTerm !== this.lastSearchTerm) {
                this.lastSearchTerm = searchTerm;
                this.loadDepositRequests(1, this.rows, searchTerm);
            }
        });
    }

    loadDepositRequests(page: number = 1, limit: number = this.rows, search: string = '') {
        this.loading = true;
        this.depositRequestService.getAllDepositRequests(page, limit, search)
            .pipe(takeUntil(this.unsubscribe$))
            .subscribe((response: GetAllDepositRequestsResponseDto) => {
                this.depositRequests = response.data;
                this.totalRecords = response.pagination?.totalItems || 0;
                this.loading = false;
            }, error => {
                this.loading = false;
                this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to load deposit requests', life: 3000 });
                console.error('Error loading deposit requests:', error);
            });
    }

    onSearch(event: Event) {
        const searchValue = (event.target as HTMLInputElement).value;
        this.searchSubject.next(searchValue);
    }

    onEdit(requestId: string | number) {
        this.router.navigate(['pages/deposit/edit', requestId]);
    }

    confirmDelete(event: Event, requestId: string | number) {
        this.confirmationService.confirm({
            target: event.target as EventTarget,
            message: 'Do you want to delete this deposit request?',
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
                this.onDelete(requestId);
            },
            reject: () => {
                this.messageService.add({ severity: 'error', summary: 'Rejected', detail: 'You have rejected', life: 3000 });
            }
        });
    }

    onDelete(requestId: string | number) {
        this.depositRequestService.deleteDepositRequestById(String(requestId)).subscribe({
            next: () => {
                this.messageService.add({ severity: 'info', summary: 'Confirmed', detail: 'Deposit request deleted', life: 3000 });
                this.loadDepositRequests();
            },
            error: (error) => {
                this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to delete deposit request', life: 3000 });
                console.error('Error deleting deposit request:', error);
            }
        });
    }

    onView(requestId: string | number) {
        console.log('View button clicked for request ID:', requestId);
    }

    onPageChange(event: any) {
        this.first = event.first;
        this.rows = event.rows;
        const page = event.first / event.rows + 1;
        this.loadDepositRequests(page, event.rows, this.lastSearchTerm);
    }

    navigateToCreateDepositRequest() {
        this.router.navigate(['/pages/deposit/create']);
    }

    ngOnDestroy() {
        this.unsubscribe$.next();
        this.unsubscribe$.complete();
    }
}
