import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  CreateCryptoWalletDto,
  CryptoWalletResponseDto,
  GetAllCryptoWalletsResponseDto,
  UpdateCryptoWalletDto
} from '../../pages/crypto-wallet/model/crypto-wallet.dto';

@Injectable({
  providedIn: 'root'
})
export class CryptoWalletService {
  private readonly apiUrl = `${environment.apiBaseUrl}/crypto-wallets`;

  constructor(private http: HttpClient) {}

  /**
   * Create a new crypto wallet
   * @param createCryptoWalletDto Crypto wallet creation data
   */
  createCryptoWallet(createCryptoWalletDto: CreateCryptoWalletDto): Observable<{
    success: boolean;
    message: string;
    data: CryptoWalletResponseDto;
  }> {
    return this.http.post<{
      success: boolean;
      message: string;
      data: CryptoWalletResponseDto;
    }>(this.apiUrl, createCryptoWalletDto);
  }

  /**
   * Get all crypto wallets with pagination
   * @param page Page number (default: 1)
   * @param limit Number of items per page (default: 10)
   */
  getAllCryptoWallets(page: number = 1, limit: number = 10): Observable<GetAllCryptoWalletsResponseDto> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    return this.http.get<GetAllCryptoWalletsResponseDto>(this.apiUrl, { params });
  }

  /**
   * Get crypto wallet by ID
   * @param walletId Crypto wallet ID
   */
  getCryptoWalletById(walletId: string): Observable<CryptoWalletResponseDto> {
    return this.http.get<CryptoWalletResponseDto>(`${this.apiUrl}/${walletId}`);
  }

  /**
   * Update crypto wallet information
   * @param walletId Crypto wallet ID
   * @param updateCryptoWalletDto Crypto wallet data to update
   */
  updateCryptoWalletById(walletId: string, updateCryptoWalletDto: UpdateCryptoWalletDto): Observable<CryptoWalletResponseDto> {
    return this.http.put<CryptoWalletResponseDto>(`${this.apiUrl}/${walletId}`, updateCryptoWalletDto);
  }

  /**
   * Delete a crypto wallet
   * @param walletId Crypto wallet ID
   */
  deleteCryptoWalletById(walletId: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${walletId}`);
  }

  /**
   * Get all crypto wallets by user identifier
   * @param identifier User identifier
   * @param page Page number (default: 1)
   * @param limit Number of items per page (default: 10)
   */
  getAllCryptoWalletsByUserIdentifier(
    identifier: string,
    page: number = 1,
    limit: number = 10
  ): Observable<GetAllCryptoWalletsResponseDto> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    return this.http.get<GetAllCryptoWalletsResponseDto>(
      `${this.apiUrl}/by-identifier/${identifier}`,
      { params }
    );
  }
}
