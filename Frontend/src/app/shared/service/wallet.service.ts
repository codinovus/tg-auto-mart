import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  CreateWalletDto,
  GetAllWalletsResponseDto,
  WalletResponseDto,
  UpdateWalletDto
} from '../../pages/wallet/model/wallet.dto';

@Injectable({
  providedIn: 'root'
})
export class WalletService {
  private readonly apiUrl = `${environment.apiBaseUrl}/wallet`;

  constructor(private http: HttpClient) {}

  /**
   * Create a new wallet
   * @param createWalletDto Wallet creation data
   */
  createWallet(createWalletDto: CreateWalletDto): Observable<{
    success: boolean;
    message: string;
    data: WalletResponseDto;
  }> {
    return this.http.post<{
      success: boolean;
      message: string;
      data: WalletResponseDto;
    }>(this.apiUrl, createWalletDto);
  }

  /**
   * Get all wallets with pagination
   * @param page Page number (default: 1)
   * @param limit Number of items per page (default: 10)
   */
  getAllWallets(
    page: number = 1,
    limit: number = 10,
    search?: string
  ): Observable<GetAllWalletsResponseDto> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    if (search && search.trim() !== '') {
      params = params.set('search', search.trim());
    }

    return this.http.get<GetAllWalletsResponseDto>(this.apiUrl, { params });
  }

  /**
   * Get wallet by ID
   * @param walletId Wallet ID
   */
  getWalletById(walletId: string): Observable<WalletResponseDto> {
    return this.http.get<WalletResponseDto>(`${this.apiUrl}/${walletId}`);
  }

  /**
   * Get wallet by user ID
   * @param userId User ID
   */
  getWalletByUserId(userId: string): Observable<WalletResponseDto> {
    return this.http.get<WalletResponseDto>(`${this.apiUrl}/user/${userId}`);
  }

  /**
   * Get wallet by Telegram ID
   * @param telegramId Telegram ID
   */
  getWalletByTelegramId(telegramId: string): Observable<WalletResponseDto> {
    return this.http.get<WalletResponseDto>(`${this.apiUrl}/telegram/${telegramId}`);
  }

  /**
   * Update wallet information by ID
   * @param walletId Wallet ID
   * @param updateWalletDto Wallet data to update
   */
  updateWalletById(walletId: string, updateWalletDto: UpdateWalletDto): Observable<WalletResponseDto> {
    return this.http.put<WalletResponseDto>(`${this.apiUrl}/${walletId}`, updateWalletDto);
  }

  /**
   * Update wallet information by Telegram ID
   * @param telegramId Telegram ID
   * @param updateWalletDto Wallet data to update
   */
  updateWalletByTelegramId(telegramId: string, updateWalletDto: UpdateWalletDto): Observable<WalletResponseDto> {
    return this.http.put<WalletResponseDto>(`${this.apiUrl}/telegram/${telegramId}`, updateWalletDto);
  }

  /**
   * Delete a wallet
   * @param walletId Wallet ID
   */
  deleteWalletById(walletId: string): Observable<{ success: boolean; message: string }> {
    return this.http.delete<{ success: boolean; message: string }>(`${this.apiUrl}/${walletId}`);
  }
}
