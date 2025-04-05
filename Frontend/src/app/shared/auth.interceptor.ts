import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';
import { AuthService } from './auth.service';
import { LoginService } from './login.service';
import { Router } from '@angular/router';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
    constructor(private authService: AuthService, private loginService: LoginService, private router: Router) {}

    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        const token = this.authService.getAccessToken();
        if (token) {
            request = request.clone({
                setHeaders: {
                    Authorization: `Bearer ${token}`
                }
            });
        }

        return next.handle(request).pipe(
            catchError((error: HttpErrorResponse) => {
                if (error.status === 401 && !request.url.includes('/auth/login')) {
                    return this.loginService.refreshToken().pipe(
                        switchMap((response: any) => {
                            this.authService.setAccessToken(response.accessToken);
                            this.authService.setRefreshToken(response.refreshToken);
                            request = request.clone({
                                setHeaders: {
                                    Authorization: `Bearer ${response.accessToken}`
                                }
                            });
                            return next.handle(request);
                        }),
                        catchError((refreshError) => {
                            this.authService.clearTokens();
                            this.router.navigate(['/auth/login']);
                            return throwError(() => refreshError);
                        })
                    );
                }
                return throwError(() => error);
            })
        );
    }
}
