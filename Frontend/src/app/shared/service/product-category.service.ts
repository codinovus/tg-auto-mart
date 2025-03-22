import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  CreateProductCategoryDto,
  GetAllProductCategoriesResponseDto,
  ProductCategoryResponseDto,
  UpdateProductCategoryDto
} from '../../pages/product-category/model/product-category.dto';

@Injectable({
  providedIn: 'root'
})
export class ProductCategoryService {
  private readonly apiUrl = `${environment.apiBaseUrl}/product-categories`;

  constructor(private http: HttpClient) {}

  /**
   * Create a new product category
   * @param createProductCategoryDto Product category creation data
   */
  createProductCategory(createProductCategoryDto: CreateProductCategoryDto): Observable<{
    success: boolean;
    message: string;
    data: ProductCategoryResponseDto;
  }> {
    return this.http.post<{
      success: boolean;
      message: string;
      data: ProductCategoryResponseDto;
    }>(this.apiUrl, createProductCategoryDto);
  }

  /**
   * Get all product categories with pagination
   * @param page Page number (default: 1)
   * @param limit Number of items per page (default: 10)
   */
  getAllProductCategories(page: number = 1, limit: number = 10): Observable<GetAllProductCategoriesResponseDto> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    return this.http.get<GetAllProductCategoriesResponseDto>(this.apiUrl, { params });
  }

  /**
   * Get product category by ID
   * @param categoryId Product category ID
   */
  getProductCategoryById(categoryId: string): Observable<ProductCategoryResponseDto> {
    return this.http.get<ProductCategoryResponseDto>(`${this.apiUrl}/${categoryId}`);
  }

  /**
   * Update product category information
   * @param categoryId Product category ID
   * @param updateProductCategoryDto Product category data to update
   */
  updateProductCategoryById(categoryId: string, updateProductCategoryDto: UpdateProductCategoryDto): Observable<ProductCategoryResponseDto> {
    return this.http.put<ProductCategoryResponseDto>(`${this.apiUrl}/${categoryId}`, updateProductCategoryDto);
  }

  /**
   * Delete a product category
   * @param categoryId Product category ID
   */
  deleteProductCategoryById(categoryId: string): Observable<{ success: boolean; message: string }> {
    return this.http.delete<{ success: boolean; message: string }>(`${this.apiUrl}/${categoryId}`);
  }
}
