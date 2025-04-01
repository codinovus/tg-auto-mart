import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { CreateProductDto, GetAllProductsResponseDto, ProductResponseDto, UpdateProductDto } from '../../pages/product/model/product.dto';

@Injectable({
    providedIn: 'root'
})
export class ProductService {
    private readonly apiUrl = `${environment.apiBaseUrl}/products`;

    constructor(private http: HttpClient) {}

    /**
     * Create a new product
     * @param createProductDto Product creation data
     */
    createProduct(createProductDto: CreateProductDto): Observable<{
        success: boolean;
        message: string;
        data: ProductResponseDto;
    }> {
        return this.http.post<{
            success: boolean;
            message: string;
            data: ProductResponseDto;
        }>(this.apiUrl, createProductDto);
    }

    /**
     * Get all products with optional filtering and pagination
     * @param page Page number (default: 1)
     * @param limit Number of items per page (default: 10)
     * @param categoryId Optional category ID filter
     * @param storeId Optional store ID filter
     */

    getAllProducts(page: number = 1, limit: number = 10, categoryId?: string, storeId?: string, search?: string): Observable<GetAllProductsResponseDto> {
        let params = new HttpParams().set('page', page.toString()).set('limit', limit.toString());

        // Add categoryId if provided
        if (categoryId) {
            params = params.set('categoryId', categoryId);
        }

        // Add storeId if provided
        if (storeId) {
            params = params.set('storeId', storeId);
        }

        if (search && search.trim() !== '') {
            params = params.set('search', search.trim());
        }

        return this.http.get<GetAllProductsResponseDto>(this.apiUrl, { params });
    }

    /**
     * Get product by ID
     * @param productId Product ID
     */
    getProductById(productId: string): Observable<ProductResponseDto> {
        return this.http.get<ProductResponseDto>(`${this.apiUrl}/${productId}`);
    }

    /**
     * Update product information
     * @param productId Product ID
     * @param updateProductDto Product data to update
     */
    updateProductById(productId: string, updateProductDto: UpdateProductDto): Observable<ProductResponseDto> {
        return this.http.put<ProductResponseDto>(`${this.apiUrl}/${productId}`, updateProductDto);
    }

    /**
     * Delete a product
     * @param productId Product ID
     */
    deleteProductById(productId: string): Observable<any> {
        return this.http.delete<any>(`${this.apiUrl}/${productId}`);
    }

    /**
     * Get products by category ID
     * @param categoryId Category ID
     * @param page Page number (default: 1)
     * @param limit Number of items per page (default: 10)
     */
    getProductsByCategoryId(categoryId: string, page: number = 1, limit: number = 10): Observable<GetAllProductsResponseDto> {
        let params = new HttpParams().set('page', page.toString()).set('limit', limit.toString());

        return this.http.get<GetAllProductsResponseDto>(`${this.apiUrl}/category/${categoryId}`, { params });
    }
}
