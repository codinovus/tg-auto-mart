import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private accessToken: string | null = null;
    private refreshToken: string | null = null;

    constructor() {}

    setAccessToken(token: string) {
        this.accessToken = token;
        localStorage.setItem('accessToken', token);
    }

    setRefreshToken(token: string) {
        this.refreshToken = token;
        localStorage.setItem('refreshToken', token);
    }

    getAccessToken(): string | null {
        return this.accessToken || localStorage.getItem('accessToken');
    }

    getRefreshToken(): string | null {
        return this.refreshToken || localStorage.getItem('refreshToken');
    }

    isAuthenticated(): boolean {
        return this.getAccessToken() !== null;
    }

    clearTokens() {
        this.accessToken = null;
        this.refreshToken = null;
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
    }
}
