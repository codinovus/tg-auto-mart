import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  CreateProductKeyDto,
  GetAllProductKeysResponseDto,
  ProductKeyResponseDto,
  UpdateProductKeyDto
} from '../../pages/product-key/model/product-key.dto';

@Injectable({
  providedIn: 'root'
})
export class ProductKeyService {
  private readonly apiUrl = `${environment.apiBaseUrl}/product-keys`;

  constructor(private http: HttpClient) {}

  /**
   * Create a new product key
   * @param createProductKeyDto Product key creation data
   */
  createProductKey(createProductKeyDto: CreateProductKeyDto): Observable<{
    success: boolean;
    message: string;
    data: ProductKeyResponseDto;
  }> {
    return this.http.post<{
      success: boolean;
      message: string;
      data: ProductKeyResponseDto;
    }>(this.apiUrl, createProductKeyDto);
  }

  /**
   * Get all product keys with pagination
   * @param page Page number (default: 1)
   * @param limit Number of items per page (default: 10)
   */
  getAllProductKeys(
    page: number = 1,
    limit: number = 10,
    search?: string
  ): Observable<GetAllProductKeysResponseDto> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    if (search && search.trim() !== '') {
      params = params.set('search', search.trim());
    }

    return this.http.get<GetAllProductKeysResponseDto>(this.apiUrl, { params });
  }

  /**
   * Get product key by ID
   * @param productKeyId Product key ID
   */
  getProductKeyById(productKeyId: string): Observable<ProductKeyResponseDto> {
    return this.http.get<ProductKeyResponseDto>(`${this.apiUrl}/${productKeyId}`);
  }

  /**
   * Update product key information
   * @param productKeyId Product key ID
   * @param updateProductKeyDto Product key data to update
   */
  updateProductKeyById(productKeyId: string, updateProductKeyDto: UpdateProductKeyDto): Observable<ProductKeyResponseDto> {
    return this.http.put<ProductKeyResponseDto>(`${this.apiUrl}/${productKeyId}`, updateProductKeyDto);
  }

  /**
   * Delete a product key
   * @param productKeyId Product key ID
   */
  deleteProductKeyById(productKeyId: string): Observable<{ success: boolean; message: string }> {
    return this.http.delete<{ success: boolean; message: string }>(`${this.apiUrl}/${productKeyId}`);
  }
}
