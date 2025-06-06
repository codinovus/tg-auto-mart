import { Component, OnDestroy, OnInit } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { ReferralService } from '../../../shared/service/referral.service';
import { ReferralResponseDto, GetAllReferralsResponseDto } from '../model/referral.dto';
import { Router } from '@angular/router';
import { PaginatorModule } from 'primeng/paginator';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import { Subject, debounceTime, distinctUntilChanged, takeUntil } from 'rxjs';

@Component({
    selector: 'app-list-referral',
    templateUrl: './listreferral.component.html',
    styleUrls: ['./listreferral.component.scss'],
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
    providers: [ReferralService, ConfirmationService, MessageService]
})
export class ListReferralComponent implements OnInit, OnDestroy {
    private unsubscribe$ = new Subject<void>();
    private searchSubject = new Subject<string>();
    referrals!: ReferralResponseDto[];
    loading: boolean = true;
    first: number = 0;
    rows: number = 10;
    totalRecords: number = 0;
    searchTerm: string = '';

    constructor(
        private referralService: ReferralService,
        private router: Router,
        private confirmationService: ConfirmationService,
        private messageService: MessageService
    ) {}

    ngOnInit() {
        this.loadReferrals(); // Load referrals only once on initialization

        this.searchSubject.pipe(
            debounceTime(500),
            distinctUntilChanged(),
            takeUntil(this.unsubscribe$)
        ).subscribe(searchValue => {
            this.searchTerm = searchValue;
            this.loadReferrals(1, this.rows, searchValue); // Load referrals based on search input
        });
    }

    loadReferrals(page: number = 1, limit: number = this.rows, search: string = '') {
        this.loading = true;
        this.referralService.getAllReferrals(page, limit, search)
            .pipe(takeUntil(this.unsubscribe$))
            .subscribe((response: GetAllReferralsResponseDto) => {
                this.referrals = response.data;
                this.totalRecords = response.pagination?.totalItems || 0;
                this.loading = false;
            }, error => {
                this.loading = false;
                this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to load referrals', life: 3000 });
                console.error('Error loading referrals:', error);
            });
    }

    onSearch(event: Event) {
        const searchValue = (event.target as HTMLInputElement).value.trim();
        this.searchSubject.next(searchValue); // Trigger search
    }

    onEdit(referralId: string | number) {
        this.router.navigate(['pages/referral/edit', referralId]);
    }

    confirmDelete(event: Event, referralId: string | number) {
        this.confirmationService.confirm({
            target: event.target as EventTarget,
            message: 'Do you want to delete this referral?',
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
                this.onDelete(referralId);
            },
            reject: () => {
                this.messageService.add({ severity: 'error', summary: 'Rejected', detail: 'You have rejected', life: 3000 });            }
            });
        }

        onDelete(referralId: string | number) {
            this.referralService.deleteReferralById(String(referralId)).subscribe({
                next: () => {
                    this.messageService.add({ severity: 'info', summary: 'Confirmed', detail: 'Referral deleted', life: 3000 });
                    this.loadReferrals(1, this.rows, this.searchTerm); // Reload referrals after deletion
                },
                error: (error) => {
                    this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to delete referral', life: 3000 });
                    console.error('Error deleting referral:', error);
                }
            });
        }

        onView(referralId: string | number) {
            console.log('View button clicked for referral ID:', referralId);
            // Implement view functionality if needed
        }

        onPageChange(event: any) {
            this.first = event.first;
            this.rows = event.rows;
            const page = event.first / event.rows + 1; // Calculate the current page
            this.loadReferrals(page, event.rows, this.searchTerm); // Load referrals for the new page
        }

        navigateToCreateReferral() {
            this.router.navigate(['/pages/referral/create']);
        }

        ngOnDestroy() {
            this.unsubscribe$.next();
            this.unsubscribe$.complete();
        }
    }
