import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor, HttpErrorResponse } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';
import { AuthService } from './auth.service';
import { LoginService } from './login.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
    constructor(private authService: AuthService, private loginService: LoginService) {}

    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        console.log('AuthInterceptor: Processing request', request.url);

        const token = this.authService.getAccessToken();
        if (token) {
            console.log('AuthInterceptor: Adding token to request');
            request = request.clone({
                setHeaders: {
                    Authorization: `Bearer ${token}`
                }
            });
        } else {
            console.log('AuthInterceptor: No token available');
        }

        return next.handle(request).pipe(
            catchError((error: HttpErrorResponse) => {
                console.log(`AuthInterceptor: Error occurred - Status: ${error.status}`, error);

                if (error.status === 401) {
                    console.log('AuthInterceptor: 401 Unauthorized - Attempting to refresh token');

                    return this.loginService.refreshToken().pipe(
                        switchMap((response: any) => {
                            console.log('AuthInterceptor: Token refresh successful', response);

                            this.authService.setAccessToken(response.tokens.accessToken);
                            this.authService.setRefreshToken(response.tokens.refreshToken);

                            console.log('AuthInterceptor: Retrying original request with new token');

                            request = request.clone({
                                setHeaders: {
                                    Authorization: `Bearer ${response.tokens.accessToken}`
                                }
                            });
                            return next.handle(request);
                        }),
                        catchError((refreshError) => {
                            console.log('AuthInterceptor: Token refresh failed', refreshError);
                            console.log('AuthInterceptor: Logging out user due to authentication failure');

                            this.authService.clearTokens();
                            // You might want to redirect to login page here
                            // this.router.navigate(['/auth/login']);

                            return throwError(() => refreshError);
                        })
                    );
                }

                console.log('AuthInterceptor: Error is not 401, returning error', error);
                return throwError(() => error);
            })
        );
    }
}
