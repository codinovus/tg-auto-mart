import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  CreateReferralDto,
  GetAllReferralsResponseDto,
  ReferralResponseDto,
  UpdateReferralDto
} from '../../pages/referral/model/referral.dto';

@Injectable({
  providedIn: 'root'
})
export class ReferralService {
  private readonly apiUrl = `${environment.apiBaseUrl}/referrals`;

  constructor(private http: HttpClient) {}

  /**
   * Create a new referral
   * @param createReferralDto Referral creation data
   */
  createReferral(createReferralDto: CreateReferralDto): Observable<{
    success: boolean;
    message: string;
    data: ReferralResponseDto;
  }> {
    return this.http.post<{
      success: boolean;
      message: string;
      data: ReferralResponseDto;
    }>(this.apiUrl, createReferralDto);
  }

  /**
   * Get all referrals with pagination and optional search
   * @param page Page number (default: 1)
   * @param limit Number of items per page (default: 10)
   * @param searchQuery Optional search term
   */
  getAllReferrals(
    page: number = 1,
    limit: number = 10,
    search?: string
  ): Observable<GetAllReferralsResponseDto> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    if (search && search.trim() !== '') {
      params = params.set('search', search.trim());
    }

    return this.http.get<GetAllReferralsResponseDto>(this.apiUrl, { params });
  }

  /**
   * Get referral by ID
   * @param referralId Referral ID
   */
  getReferralById(referralId: string): Observable<ReferralResponseDto> {
    return this.http.get<ReferralResponseDto>(`${this.apiUrl}/${referralId}`);
  }

  /**
   * Update referral information
   * @param referralId Referral ID
   * @param updateReferralDto Referral data to update
   */
  updateReferralById(referralId: string, updateReferralDto: UpdateReferralDto): Observable<ReferralResponseDto> {
    return this.http.put<ReferralResponseDto>(`${this.apiUrl}/${referralId}`, updateReferralDto);
  }

  /**
   * Delete a referral
   * @param referralId Referral ID
   */
  deleteReferralById(referralId: string): Observable<{ success: boolean; message: string }> {
    return this.http.delete<{ success: boolean; message: string }>(`${this.apiUrl}/${referralId}`);
  }
}
