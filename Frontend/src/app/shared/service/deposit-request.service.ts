import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  CreateDepositRequestDto,
  DepositRequestResponseDto,
  GetAllDepositRequestsResponseDto,
  GetDepositRequestByIdResponseDto,
  UpdateDepositRequestDto
} from '../../pages/deposit/model/deposit-request.dto';

@Injectable({
  providedIn: 'root'
})
export class DepositRequestService {
  private readonly apiUrl = `${environment.apiBaseUrl}/deposit-requests`;

  constructor(private http: HttpClient) {}

  /**
   * Create a new deposit request
   * @param createDto Deposit request creation data
   */
  createDepositRequest(createDto: CreateDepositRequestDto): Observable<{
    success: boolean;
    message: string;
    data: DepositRequestResponseDto;
  }> {
    return this.http.post<{
      success: boolean;
      message: string;
      data: DepositRequestResponseDto;
    }>(this.apiUrl, createDto);
  }

  /**
   * Get all deposit requests with pagination
   * @param page Page number (default: 1)
   * @param limit Number of items per page (default: 10)
   */
  getAllDepositRequests(page: number = 1, limit: number = 10): Observable<GetAllDepositRequestsResponseDto> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    return this.http.get<GetAllDepositRequestsResponseDto>(this.apiUrl, { params });
  }

  /**
   * Get deposit request by ID
   * @param id Deposit request ID
   */
  getDepositRequestById(id: string): Observable<DepositRequestResponseDto> {
    return this.http.get<DepositRequestResponseDto>(`${this.apiUrl}/${id}`);
  }

  /**
   * Update deposit request information
   * @param id Deposit request ID
   * @param updateDto Deposit request data to update
   */
  updateDepositRequestById(id: string, updateDto: UpdateDepositRequestDto): Observable<DepositRequestResponseDto> {
    return this.http.put<DepositRequestResponseDto>(`${this.apiUrl}/${id}`, updateDto);
  }

  /**
   * Delete a deposit request
   * @param id Deposit request ID
   */
  deleteDepositRequestById(id: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`);
  }
}
