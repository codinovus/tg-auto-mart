import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  CreateStoreDto,
  StoreResponseDto,
  GetAllStoresResponseDto,
  UpdateStoreDto
} from '../../pages/store/model/store.dto';
import { SingleItemResponse } from '../model/pagination.dto';

@Injectable({
  providedIn: 'root'
})
export class StoreService {
  private readonly apiUrl = `${environment.apiBaseUrl}/stores`;

  constructor(private http: HttpClient) {}

  /**
   * Create a new store
   * @param storeData Store creation data
   */
  createStore(storeData: CreateStoreDto): Observable<SingleItemResponse<StoreResponseDto>> {
    return this.http.post<SingleItemResponse<StoreResponseDto>>(this.apiUrl, storeData);
  }

  /**
   * Get all stores with pagination
   * @param page Page number (default: 1)
   * @param limit Number of items per page (default: 10)
   */
  getAllStores(page: number = 1, limit: number = 10): Observable<GetAllStoresResponseDto> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    return this.http.get<GetAllStoresResponseDto>(this.apiUrl, { params });
  }

  /**
   * Get store by ID
   * @param storeId Store ID
   */
  getStoreById(storeId: string): Observable<SingleItemResponse<StoreResponseDto>> {
    return this.http.get<SingleItemResponse<StoreResponseDto>>(`${this.apiUrl}/${storeId}`);
  }

  /**
   * Update store information
   * @param storeId Store ID
   * @param updateData Store data to update
   */
  updateStore(storeId: string, updateData: UpdateStoreDto): Observable<SingleItemResponse<StoreResponseDto>> {
    return this.http.patch<SingleItemResponse<StoreResponseDto>>(`${this.apiUrl}/${storeId}`, updateData);
  }

  /**
   * Delete a store
   * @param storeId Store ID
   */
  deleteStore(storeId: string): Observable<{ success: boolean; message: string }> {
    return this.http.delete<{ success: boolean; message: string }>(`${this.apiUrl}/${storeId}`);
  }

  /**
   * Get all stores owned by a specific user
   * @param ownerId Owner user ID
   */
  getStoresByOwnerId(ownerId: string): Observable<GetAllStoresResponseDto> {
    let params = new HttpParams().set('ownerId', ownerId);
    return this.http.get<GetAllStoresResponseDto>(this.apiUrl, { params });
  }

  /**
   * Get store statistics
   */
  getStoreStats(): Observable<SingleItemResponse<any>> {
    return this.http.get<SingleItemResponse<any>>(`${this.apiUrl}/stats`);
  }

  /**
   * Check if store name is available
   * @param name Store name to check
   */
  checkStoreNameAvailability(name: string): Observable<{ success: boolean; available: boolean }> {
    let params = new HttpParams().set('name', name);
    return this.http.get<{ success: boolean; available: boolean }>(`${this.apiUrl}/check-name`, { params });
  }
}
