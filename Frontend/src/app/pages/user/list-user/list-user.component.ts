import { Component, OnDestroy, OnInit } from '@angular/core';
import { Table } from 'primeng/table';
import { HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { UserService } from '../../../shared/service/user.service';
import { UserResponseDto, GetAllUsersResponseDto } from '../model/user.dto';
import { TagModule } from 'primeng/tag';
import { Router } from '@angular/router';
import { PaginatorModule } from 'primeng/paginator';
import { BadgeModule } from 'primeng/badge';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import { BehaviorSubject, debounceTime, Subject, takeUntil } from 'rxjs';

@Component({
    selector: 'app-list-user',
    templateUrl: './list-user.component.html',
    styleUrl: './list-user.component.scss',
    standalone: true,
    imports: [
        TableModule,
        HttpClientModule,
        CommonModule,
        InputTextModule,
        ButtonModule,
        IconFieldModule,
        InputIconModule,
        TagModule,
        PaginatorModule,
        BadgeModule,
        ConfirmDialogModule,
        ToastModule
    ],
    providers: [UserService, ConfirmationService, MessageService]
})
export class ListUserComponent implements OnInit, OnDestroy {
    private unsubscribe$ = new Subject<void>();
    private searchQuery$ = new BehaviorSubject<string>('');
    users!: UserResponseDto[];
    loading: boolean = true;
    roles = [
        { label: 'CUSTOMER', value: 'CUSTOMER' },
        { label: 'STORE_ADMIN', value: 'STORE_ADMIN' },
        { label: 'DEVELOPER', value: 'DEVELOPER' }
    ];
    first: number = 0; // First row offset
    rows: number = 10; // Number of rows per page
    totalRecords: number = 0; // Total number of records

    constructor(
        private userService: UserService,
        private router: Router,
        private confirmationService: ConfirmationService,
        private messageService: MessageService,
    ) {}

    ngOnInit() {
        this.loadUsers();
        this.setupSearchListener();
    }

    setupSearchListener() {
        this.searchQuery$
            .pipe(debounceTime(500), takeUntil(this.unsubscribe$))
            .subscribe(searchValue => {
                this.loadUsers(1, this.rows, searchValue);
            });
    }

    loadUsers(page: number = 1, limit: number = this.rows, search: string = '') {
        this.loading = true;
        this.userService.getAllUsers(page, limit, search) // Pass the search parameter
            .pipe(takeUntil(this.unsubscribe$))
            .subscribe((response: GetAllUsersResponseDto) => {
                this.users = response.data;
                this.totalRecords = response.pagination?.totalItems || 0;
                this.loading = false;
            }, error => {
                this.loading = false;
                this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to load users', life: 3000 });
                console.error('Error loading users:', error);
            });
    }

    onSearch(event: Event) {
        const searchValue = (event.target as HTMLInputElement).value;
        this.searchQuery$.next(searchValue); // Update the search query
    }

    getSeverity(role: string) {
        switch (role) {
            case 'CUSTOMER':
                return 'success';
            case 'STORE_ADMIN':
                return 'warn'; // Changed from 'warning' to 'warn'
            case 'DEVELOPER':
                return 'danger';
            default:
                return 'info';
        }
    }

    onEdit(userId: string | number) {
        this.router.navigate(['pages/user/edit', userId]);
    }

    confirmDelete(event: Event, userId: string | number) {
        this.confirmationService.confirm({
            target: event.target as EventTarget,
            message: 'Do you want to delete this user?',
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
                this.onDelete(userId);
            },
            reject: () => {
                this.messageService.add({ severity: 'error', summary: 'Rejected', detail: 'You have rejected', life: 3000 });
            }
        });
    }

    onDelete(userId: string | number) {
        this.userService.deleteUser(String(userId)).subscribe({
            next: () => {
                this.messageService.add({ severity: 'info', summary: 'Confirmed', detail: 'User deleted', life: 3000 });
                this.loadUsers(); // Reload users after deletion
            },
            error: (error) => {
                this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to delete user', life: 3000 });
                console.error('Error deleting user:', error);
            }
        });
    }

    onView(userId: string | number) {
        console.log('View button clicked for user ID:', userId);
    }

    onPageChange(event: any) {
        this.first = event.first;
        this.rows = event.rows;
        const page = event.first / event.rows + 1; // Calculate page number
        this.loadUsers(page, event.rows); // Load users for the new page
    }

    navigateToCreateUser () {
        this.router.navigate(['/pages/user/create']);
    }

    ngOnDestroy() {
        this.unsubscribe$.next();
        this.unsubscribe$.complete();
    }
}
