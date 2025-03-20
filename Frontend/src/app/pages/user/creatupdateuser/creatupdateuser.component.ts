import { Component, OnInit, Input } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { DropdownModule } from 'primeng/dropdown';
import { CardModule } from 'primeng/card';
import { PasswordModule } from 'primeng/password';
import { MessageModule } from 'primeng/message';
import { Role } from '../../../shared/enums/app-enums';
import { UserResponseDto, UpdateUserDto, RegisterUserModel } from '../model/user.dto';


@Component({
  selector: 'app-creatupdateuser',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ButtonModule,
    InputTextModule,
    DropdownModule,
    CardModule,
    PasswordModule,
    MessageModule
  ],
  templateUrl: './creatupdateuser.component.html',
  styleUrl: './creatupdateuser.component.scss'
})
export class CreatupdateuserComponent implements OnInit {
  @Input() user?: UserResponseDto;

  userForm!: FormGroup;
  roles: any[] = [];
  isUpdateMode = false;
  submitted = false;

  constructor(private fb: FormBuilder) { }

  ngOnInit(): void {
    this.isUpdateMode = !!this.user;

    // Prepare roles dropdown options
    this.roles = Object.values(Role).map(role => ({
      label: role.charAt(0) + role.slice(1).toLowerCase().replace('_', ' '),
      value: role
    }));

    this.initForm();
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
      return;
    }

    if (this.isUpdateMode) {
      // Remove empty values for update
      const updateData: UpdateUserDto = {};
      Object.keys(this.userForm.controls).forEach(key => {
        const control = this.userForm.get(key);
        if (control && control.value !== '' && control.dirty) {
          (updateData as any)[key] = control.value;
        }
      });

      console.log('Update User Data:', updateData);
    } else {
      // Create mode - use all form values
      const createData: RegisterUserModel = this.userForm.value;
      console.log('Create User Data:', createData);
    }
  }

  // Explicit getter methods for form controls to fix TypeScript errors
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
