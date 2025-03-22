import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  CreatePromoCodeDto,
  GetAllPromoCodesResponseDto,
  GetPromoCodeByIdResponseDto,
  PromoCodeResponseDto,
  UpdatePromoCodeDto
} from '../../pages/promo-code/model/promo-code.dto';

@Injectable({
  providedIn: 'root'
})
export class PromoCodeService {
  private readonly apiUrl = `${environment.apiBaseUrl}/promo-codes`;

  constructor(private http: HttpClient) {}

  /**
   * Create a new promo code
   * @param createPromoCodeDto Promo code creation data
   */
  createPromoCode(createPromoCodeDto: CreatePromoCodeDto): Observable<{
    success: boolean;
    message: string;
    data: PromoCodeResponseDto;
  }> {
    return this.http.post<{
      success: boolean;
      message: string;
      data: PromoCodeResponseDto;
    }>(this.apiUrl, createPromoCodeDto);
  }

  /**
   * Get all promo codes with pagination
   * @param page Page number (default: 1)
   * @param limit Number of items per page (default: 10)
   */
  getAllPromoCodes(page: number = 1, limit: number = 10): Observable<GetAllPromoCodesResponseDto> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    return this.http.get<GetAllPromoCodesResponseDto>(this.apiUrl, { params });
  }

  /**
   * Get promo code by ID
   * @param promoCodeId Promo code ID
   */
  getPromoCodeById(promoCodeId: string): Observable<GetPromoCodeByIdResponseDto> {
    return this.http.get<GetPromoCodeByIdResponseDto>(`${this.apiUrl}/${promoCodeId}`);
  }

  /**
   * Update promo code information
   * @param promoCodeId Promo code ID
   * @param updatePromoCodeDto Promo code data to update
   */
  updatePromoCodeById(promoCodeId: string, updatePromoCodeDto: UpdatePromoCodeDto): Observable<PromoCodeResponseDto> {
    return this.http.put<PromoCodeResponseDto>(`${this.apiUrl}/${promoCodeId}`, updatePromoCodeDto);
  }

  /**
   * Delete a promo code
   * @param promoCodeId Promo code ID
   */
  deletePromoCodeById(promoCodeId: string): Observable<{ success: boolean; message: string }> {
    return this.http.delete<{ success: boolean; message: string }>(`${this.apiUrl}/${promoCodeId}`);
  }
}
