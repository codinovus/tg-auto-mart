import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  CreateOrderDto,
  GetAllOrdersResponseDto,
  GetOrderByIdResponseDto,
  OrderResponseDto,
  UpdateOrderDto
} from '../../pages/order/model/order.dto';

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private readonly apiUrl = `${environment.apiBaseUrl}/orders`;

  constructor(private http: HttpClient) {}

  /**
   * Create a new order
   * @param createOrderDto Order creation data
   */
  createOrder(createOrderDto: CreateOrderDto): Observable<{
    success: boolean;
    message: string;
    data: OrderResponseDto;
  }> {
    return this.http.post<{
      success: boolean;
      message: string;
      data: OrderResponseDto;
    }>(this.apiUrl, createOrderDto);
  }

  /**
   * Get all orders with pagination
   * @param page Page number (default: 1)
   * @param limit Number of items per page (default: 10)
   */
  getAllOrders(
    page: number = 1,
    limit: number = 10,
    search?: string
  ): Observable<GetAllOrdersResponseDto> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    if (search && search.trim() !== '') {
      params = params.set('search', search.trim());
    }

    return this.http.get<GetAllOrdersResponseDto>(this.apiUrl, { params });
  }

  /**
   * Get orders by user ID
   * @param userId User ID
   * @param page Page number (default: 1)
   * @param limit Number of items per page (default: 10)
   */
  getOrdersByUserId(userId: string, page: number = 1, limit: number = 10): Observable<GetAllOrdersResponseDto> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    return this.http.get<GetAllOrdersResponseDto>(`${this.apiUrl}/user/${userId}`, { params });
  }

  /**
   * Get orders by Telegram ID
   * @param telegramId Telegram ID
   * @param page Page number (default: 1)
   * @param limit Number of items per page (default: 10)
   */
  getOrdersByTelegramId(telegramId: string, page: number = 1, limit: number = 10): Observable<GetAllOrdersResponseDto> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    return this.http.get<GetAllOrdersResponseDto>(`${this.apiUrl}/telegram/${telegramId}`, { params });
  }

  /**
   * Get order by ID
   * @param orderId Order ID
   */
  getOrderById(orderId: string): Observable<GetOrderByIdResponseDto> {
    return this.http.get<GetOrderByIdResponseDto>(`${this.apiUrl}/${orderId}`);
  }

  /**
   * Update order information
   * @param orderId Order ID
   * @param updateOrderDto Order data to update
   */
  updateOrderById(orderId: string, updateOrderDto: UpdateOrderDto): Observable<OrderResponseDto> {
    return this.http.put<OrderResponseDto>(`${this.apiUrl}/${orderId}`, updateOrderDto);
  }

  /**
   * Delete an order
   * @param orderId Order ID
   */
  deleteOrderById(orderId: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${orderId}`);
  }
}
