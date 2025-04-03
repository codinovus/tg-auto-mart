import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { LoginDto } from './login.dto';
import { environment } from '../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class LoginService {
    constructor(private http: HttpClient) {}

    login(loginData: LoginDto) {
        return this.http.post(`${environment.apiBaseUrl}/auth/login`, loginData);
    }

    refreshToken() {
        const refreshToken = localStorage.getItem('refreshToken');
        return this.http.post(`${environment.apiBaseUrl}/auth/refresh-token`, { refresh_token: refreshToken });
    }
}
