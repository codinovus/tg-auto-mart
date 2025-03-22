import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  CreateDisputeDto,
  DisputeResponseDto,
  GetAllDisputesResponseDto,
  GetDisputeByIdResponseDto,
  UpdateDisputeDto
} from '../../pages/dispute/model/dispute.dto';

@Injectable({
  providedIn: 'root'
})
export class DisputeService {
  private readonly apiUrl = `${environment.apiBaseUrl}/disputes`;

  constructor(private http: HttpClient) {}

  /**
   * Create a new dispute
   * @param createDisputeDto Dispute creation data
   */
  createDispute(createDisputeDto: CreateDisputeDto): Observable<{
    success: boolean;
    message: string;
    data: DisputeResponseDto;
  }> {
    return this.http.post<{
      success: boolean;
      message: string;
      data: DisputeResponseDto;
    }>(this.apiUrl, createDisputeDto);
  }

  /**
   * Get all disputes with pagination
   * @param page Page number (default: 1)
   * @param limit Number of items per page (default: 10)
   */
  getAllDisputes(page: number = 1, limit: number = 10): Observable<GetAllDisputesResponseDto> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    return this.http.get<GetAllDisputesResponseDto>(this.apiUrl, { params });
  }

  /**
   * Get dispute by ID
   * @param disputeId Dispute ID
   */
  getDisputeById(disputeId: string): Observable<GetDisputeByIdResponseDto> {
    return this.http.get<GetDisputeByIdResponseDto>(`${this.apiUrl}/${disputeId}`);
  }

  /**
   * Update dispute information
   * @param disputeId Dispute ID
   * @param updateDisputeDto Dispute data to update
   */
  updateDisputeById(disputeId: string, updateDisputeDto: UpdateDisputeDto): Observable<DisputeResponseDto> {
    return this.http.put<DisputeResponseDto>(`${this.apiUrl}/${disputeId}`, updateDisputeDto);
  }

  /**
   * Delete a dispute
   * @param disputeId Dispute ID
   */
  deleteDisputeById(disputeId: string): Observable<{ success: boolean; message: string }> {
    return this.http.delete<{ success: boolean; message: string }>(`${this.apiUrl}/${disputeId}`);
  }
}
