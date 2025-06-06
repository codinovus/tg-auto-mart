import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { RippleModule } from 'primeng/ripple';
import { AppFloatingConfigurator } from '../../layout/component/app.floatingconfigurator';
import { LoginService } from '../../shared/login.service';
import { LoginDto } from '../../shared/login.dto';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { AuthService } from '../../shared/auth.service';
import { finalize } from 'rxjs/operators';

@Component({
    selector: 'app-login',
    standalone: true,
    imports: [ButtonModule, InputTextModule, PasswordModule, FormsModule, RouterModule, RippleModule, AppFloatingConfigurator, ToastModule],
    providers: [MessageService],
    template: `
        <app-floating-configurator />
        <p-toast></p-toast>
        <div class="bg-surface-50 dark:bg-surface-950 flex items-center justify-center min-h-screen min-w-[100vw] overflow-hidden">
            <div class="flex flex-col items-center justify-center">
                <div style="border-radius: 56px; padding: 0.3rem; background: linear-gradient(180deg, var(--primary-color) 10%, rgba(33, 150, 243, 0) 30%)">
                    <div class="w-full bg-surface-0 dark:bg-surface-900 py-20 px-8 sm:px-20" style="border-radius: 53px">
                        <div class="text-center mb-8">
                            <div class="text-surface-900 dark:text-surface-0 text-3xl font-medium mb-4">Welcome to AutoBot!</div>
                            <span class="text-muted-color font-medium">Sign in to continue</span>
                        </div>

                        <div>
                            <label for="username" class="block text-surface-900 dark:text-surface-0 text-xl font-medium mb-2">Username</label>
                            <input pInputText id="username" type="text" placeholder="Username" class="w-full md:w-[30rem] mb-8" [(ngModel)]="username" />

                            <label for="password" class="block text-surface-900 dark:text-surface-0 font-medium text-xl mb-2">Password</label>
                            <p-password id="password" [(ngModel)]="password" placeholder="Password" [toggleMask]="true" styleClass="mb-4" [fluid]="true" [feedback]="false"></p-password>

                            <p-button label="Sign In" styleClass="w-full" [loading]="isLoading" [disabled]="isLoading || !username || !password" (click)="onLogin()"></p-button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `
})
export class Login implements OnInit {
    username: string = '';
    password: string = '';
    isLoading: boolean = false;

    constructor(
        private loginService: LoginService,
        private messageService: MessageService,
        private router: Router,
        private authService: AuthService
    ) {}

    ngOnInit() {
        if (this.authService.isAuthenticated()) {
            this.router.navigate(['/']);
        }
    }

    onLogin() {
        this.isLoading = true;
        const loginData: LoginDto = {
            username: this.username,
            password: this.password
        };

        this.loginService.login(loginData).pipe(finalize(() => this.isLoading = false)).subscribe(
            (response: any) => {
                // Check if the response contains tokens
                if (response.tokens && response.tokens.accessToken && response.tokens.refreshToken) {
                    localStorage.setItem('accessToken', response.tokens.accessToken);
                    localStorage.setItem('refreshToken', response.tokens.refreshToken);

                    if (response.user.role === 'STORE_ADMIN' || response.user.role === 'DEVELOPER') {
                        this.router.navigate(['/']);
                    } else if (response.user.role === 'CUSTOMER') {
                        this.router.navigate(['/error']);
                    }

                    this.messageService.add({ severity: 'success', summary: 'Success', detail: response.message || 'Login successful!' });
                } else {
                    // Handle the case where tokens are not present
                    this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Login failed. Tokens are missing in the response.' });
                }
            },
            (error) => {
                console.error('Login failed:', error);
                this.messageService.add({ severity: 'error', summary: 'Error', detail: error.error.message || 'Login failed. Please check your credentials.' });
            }
        );
    }
}
