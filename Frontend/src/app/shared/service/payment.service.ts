import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  CreatePaymentDto,
  GetAllPaymentsResponseDto,
  PaymentResponseDto,
  UpdatePaymentDto,
  GetPaymentByIdResponseDto
} from '../../pages/payment/model/payment.dto';

@Injectable({
  providedIn: 'root'
})
export class PaymentService {
  private readonly apiUrl = `${environment.apiBaseUrl}/payments`;

  constructor(private http: HttpClient) {}

  /**
   * Create a new payment
   * @param createPaymentDto Payment creation data
   */
  createPayment(createPaymentDto: CreatePaymentDto): Observable<{
    success: boolean;
    message: string;
    data: PaymentResponseDto;
  }> {
    return this.http.post<{
      success: boolean;
      message: string;
      data: PaymentResponseDto;
    }>(this.apiUrl, createPaymentDto);
  }

  /**
   * Get all payments with optional pagination
   * @param page Page number (default: 1)
   * @param limit Number of items per page (default: 10)
   */
  getAllPayments(page: number = 1, limit: number = 10): Observable<GetAllPaymentsResponseDto> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    return this.http.get<GetAllPaymentsResponseDto>(this.apiUrl, { params });
  }

  /**
   * Get payment by ID
   * @param paymentId Payment ID
   */
  getPaymentById(paymentId: string): Observable<GetPaymentByIdResponseDto> {
    return this.http.get<GetPaymentByIdResponseDto>(`${this.apiUrl}/${paymentId}`);
  }

  /**
   * Update payment information
   * @param paymentId Payment ID
   * @param updatePaymentDto Payment data to update
   */
  updatePaymentById(paymentId: string, updatePaymentDto: UpdatePaymentDto): Observable<PaymentResponseDto> {
    return this.http.put<PaymentResponseDto>(`${this.apiUrl}/${paymentId}`, updatePaymentDto);
  }

  /**
   * Delete a payment
   * @param paymentId Payment ID
   */
  deletePaymentById(paymentId: string): Observable<{ success: boolean; message: string }> {
    return this.http.delete<{ success: boolean; message: string }>(`${this.apiUrl}/${paymentId}`);
  }
}
