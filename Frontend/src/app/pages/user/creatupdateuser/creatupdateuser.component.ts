import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { CardModule } from 'primeng/card';
import { PasswordModule } from 'primeng/password';
import { MessageModule } from 'primeng/message';
import { Router, ActivatedRoute } from '@angular/router';
import { finalize, takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';

import { Role } from '../../../shared/enums/app-enums';
import { UserResponseDto, UpdateUserDto, RegisterUserModel } from '../model/user.dto';
import { UserService } from '../../../shared/service/user.service';
import { MessageService } from '../../../shared/service/message.service';

@Component({
  selector: 'app-creatupdateuser',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ButtonModule,
    InputTextModule,
    SelectModule,
    CardModule,
    PasswordModule,
    MessageModule
  ],
  templateUrl: './creatupdateuser.component.html',
  styleUrl: './creatupdateuser.component.scss'
})
export class CreatupdateuserComponent implements OnInit, OnDestroy {
  @Input() user?: UserResponseDto;

  userForm!: FormGroup;
  roles: any[] = [];
  isUpdateMode = false;
  submitted = false;
  loading = false;
  userId = '';

  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private messageService: MessageService,
    private router: Router,
    private route: ActivatedRoute
  ) { }

  ngOnInit(): void {
    this.initRoles();
    this.handleRouteParams();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initRoles(): void {
    this.roles = Object.values(Role).map(role => ({
      label: role.charAt(0) + role.slice(1).toLowerCase().replace('_', ' '),
      value: role
    }));
  }

  private handleRouteParams(): void {
    this.route.params
      .pipe(takeUntil(this.destroy$))
      .subscribe(params => {
        if (params['id']) {
          this.userId = String(params['id']);
          this.loadUserData(this.userId);
        } else if (this.user) {
          this.isUpdateMode = true;
          this.userId = String(this.user.id);
          this.initForm();
        } else {
          this.initForm();
        }
      });
  }

  loadUserData(userId: string): void {
    this.loading = true;
    this.userService.getUserById(userId)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.loading = false)
      )
      .subscribe({
        next: (response) => {
          this.user = response.data;
          this.isUpdateMode = true;
          this.initForm();
          this.messageService.showInfo('User Data Loaded', 'User information has been successfully loaded.');
        },
        error: (error: any) => {
          const errorMsg = error.error?.message || error.message || 'Failed to load user data';
          this.messageService.showError('Error', errorMsg);
          console.error('Error loading user:', error);
        }
      });
  }

  initForm(): void {
    this.userForm = this.fb.group({
      username: [this.user?.username || '', [Validators.required, Validators.minLength(3)]],
      password: [
        '',
        this.isUpdateMode ? [] : [Validators.required, Validators.minLength(6)]
      ],
      telegramId: [this.user?.telegramId || ''],
      role: [this.user?.role || Role.CUSTOMER]
    });
  }

  onSubmit(): void {
    this.submitted = true;

    if (this.userForm.invalid) {
      this.messageService.showWarning('Validation Error', 'Please fill in all required fields correctly.');
      return;
    }

    this.loading = true;
    const userData = this.isUpdateMode ? this.prepareUpdateData() : this.userForm.value;

    const request$ = this.isUpdateMode
      ? this.userService.updateUser (this.userId, userData)
      : this.userService.registerUser (userData);

    request$
      .pipe(finalize(() => this.loading = false))
      .subscribe({
        next: () => {
          const successMessage = this.isUpdateMode ? 'User  updated successfully!' : 'User  created successfully!';
          this.messageService.showSuccess('Success', successMessage);
          if (!this.isUpdateMode) {
            this.userForm.reset();
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

  private prepareUpdateData(): UpdateUserDto {
    const updateData: UpdateUserDto = {};
    Object.keys(this.userForm.controls).forEach(key => {
      const control = this.userForm.get(key);
      if (control && control.value !== '' && control.dirty) {
        (updateData as any)[key] = control.value;
      }
    });
    return updateData;
  }

  get usernameControl(): AbstractControl | null {
    return this.userForm.get('username');
  }

  get passwordControl(): AbstractControl | null {
    return this.userForm.get('password');
  }

  get telegramIdControl(): AbstractControl | null {
    return this.userForm.get('telegramId');
  }

  get roleControl(): AbstractControl | null {
    return this.userForm.get('role');
  }
}
