import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';
import { AuthService } from './auth.service';
import { LoginService } from './login.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
    constructor(private authService: AuthService, private loginService: LoginService) {}

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
            catchError((error) => {
                if (error.status === 401) {
                    // Token might be expired, attempt to refresh
                    return this.loginService.refreshToken().pipe(
                        switchMap((response: any) => {
                            this.authService.setAccessToken(response.tokens.accessToken);
                            this.authService.setRefreshToken(response.tokens.refreshToken);
                            request = request.clone({
                                setHeaders: {
                                    Authorization: `Bearer ${response.tokens.accessToken}`
                                }
                            });
                            return next.handle(request);
                        }),
                        catchError(() => {
                            this.authService.clearTokens();
                            // Redirect to login or handle logout
                            return of(error);
                        })
                    );
                }
                return of(error);
            })
        );
    }
}
