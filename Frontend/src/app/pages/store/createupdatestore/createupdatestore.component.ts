import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { CardModule } from 'primeng/card';
import { MessageModule } from 'primeng/message';
import { Router, ActivatedRoute } from '@angular/router';
import { finalize, takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';

import { StoreResponseDto, CreateStoreDto, UpdateStoreDto } from '../model/store.dto';
import { StoreService } from '../../../shared/service/store.service';
import { MessageService } from '../../../shared/service/message.service';
import { UserResponseDto } from '../../user/model/user.dto';
import { UserService } from '../../../shared/service/user.service';

@Component({
  selector: 'app-createupdatestore',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ButtonModule,
    InputTextModule,
    SelectModule,
    CardModule,
    MessageModule
  ],
  templateUrl: './createupdatestore.component.html',
  styleUrl: './createupdatestore.component.scss'
})
export class CreateupdatestoreComponent implements OnInit, OnDestroy {
  @Input() store?: StoreResponseDto;

  storeForm!: FormGroup;
  owners: any[] = [];
  isUpdateMode = false;
  submitted = false;
  loading = false;
  storeId = '';

  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private storeService: StoreService,
    private userService: UserService,
    private messageService: MessageService,
    private router: Router,
    private route: ActivatedRoute
  ) { }

  ngOnInit(): void {
    this.loadOwners();
    this.handleRouteParams();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadOwners(): void {
    this.userService.getAllUsers()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.owners = response.data.map(user => ({
            label: user.username,
            value: user.id
          }));
        },
        error: (error: any) => {
          const errorMsg = error.error?.message || error.message || 'Failed to load users';
          this.messageService.showError('Error', errorMsg);
          console.error('Error loading users:', error);
        }
      });
  }

  private handleRouteParams(): void {
    this.route.params
      .pipe(takeUntil(this.destroy$))
      .subscribe(params => {
        if (params['id']) {
          this.storeId = String(params['id']);
          this.loadStoreData(this.storeId);
        } else if (this.store) {
          this.isUpdateMode = true;
          this.storeId = String(this.store.id);
          this.initForm();
        } else {
          this.initForm();
        }
      });
  }

  loadStoreData(storeId: string): void {
    this.loading = true;
    this.storeService.getStoreById(storeId)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.loading = false)
      )
      .subscribe({
        next: (response) => {
          this.store = response.data;
          this.isUpdateMode = true;
          this.initForm();
          this.messageService.showInfo('Store Data Loaded', 'Store information has been successfully loaded.');
        },
        error: (error: any) => {
          const errorMsg = error.error?.message || error.message || 'Failed to load store data';
          this.messageService.showError('Error', errorMsg);
          console.error('Error loading store:', error);
        }
      });
  }

  initForm(): void {
    this.storeForm = this.fb.group({
      name: [this.store?.name || '', [Validators.required]],
      ownerId: [this.store?.ownerId || '', this.isUpdateMode ? [] : [Validators.required]]
    });
  }

  onSubmit(): void {
    this.submitted = true;

    if (this.storeForm.invalid) {
      this.messageService.showWarning('Validation Error', 'Please fill in all required fields correctly.');
      return;
    }

    this.loading = true;
    const storeData = this.isUpdateMode ? this.prepareUpdateData() : this.storeForm.value;

    const request$ = this.isUpdateMode
      ? this.storeService.updateStore(this.storeId, storeData)
      : this.storeService.createStore(storeData);

    request$
      .pipe(finalize(() => this.loading = false))
      .subscribe({
        next: () => {
          const successMessage = this.isUpdateMode ? 'Store updated successfully!' : 'Store created successfully!';
          this.messageService.showSuccess('Success', successMessage);
          if (!this.isUpdateMode) {
            this.storeForm.reset();
            this.submitted = false;
          }
        },
        error: (error: any) => {
          const errorMsg = error.error?.message || error.message || 'Operation failed';
          this.messageService.showError('Error', errorMsg);
          console.error('Error:', error);
        }
      });
  }

  private prepareUpdateData(): UpdateStoreDto {
    const updateData: UpdateStoreDto = {};
    if (this.storeForm.get('name')?.dirty) {
      updateData.name = this.storeForm.get('name')?.value;
    }
    return updateData;
  }

  get nameControl(): AbstractControl | null {
    return this.storeForm.get('name');
  }

  get ownerIdControl(): AbstractControl | null {
    return this.storeForm.get('ownerId');
  }
}
