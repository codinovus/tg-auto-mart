import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { RegisterUserModel, GetUserByIdResponseDto, GetAllUsersResponseDto, UserProfileDto, UpdateUserDto } from '../../pages/user/model/user.dto';
import { SingleItemResponse } from '../model/pagination.dto';
import { environment } from '../../../environments/environment';



@Injectable({
  providedIn: 'root'
})
export class UserService {
  private readonly apiUrl = `${environment.apiBaseUrl}/users`;

  constructor(private http: HttpClient) {}

  /**
   * Register a new user
   * @param userData User registration data
   */
  registerUser(userData: RegisterUserModel): Observable<GetUserByIdResponseDto> {
    return this.http.post<GetUserByIdResponseDto>(`${this.apiUrl}/register`, userData);
  }

  /**
   * Get all users with pagination
   * @param page Page number (default: 1)
   * @param limit Number of items per page (default: 10)
   */
  getAllUsers(
    page: number = 1,
    limit: number = 10,
    search?: string
  ): Observable<GetAllUsersResponseDto> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    if (search && search.trim() !== '') {
      params = params.set('search', search.trim());
    }

    return this.http.get<GetAllUsersResponseDto>(this.apiUrl, { params });
  }

  /**
   * Get user by ID
   * @param userId User ID
   */
  getUserById(userId: string): Observable<GetUserByIdResponseDto> {
    return this.http.get<GetUserByIdResponseDto>(`${this.apiUrl}/${userId}`);
  }

  /**
   * Get user profile with related data
   * @param userId User ID
   */
  getUserProfile(userId: string): Observable<SingleItemResponse<UserProfileDto>> {
    return this.http.get<SingleItemResponse<UserProfileDto>>(`${this.apiUrl}/${userId}/profile`);
  }

  /**
   * Update user information
   * @param userId User ID
   * @param updateData User data to update
   */
  updateUser(userId: string, updateData: UpdateUserDto): Observable<GetUserByIdResponseDto> {
    return this.http.put<GetUserByIdResponseDto>(`${this.apiUrl}/${userId}`, updateData);
  }

  /**
   * Delete a user
   * @param userId User ID
   */
  deleteUser(userId: string): Observable<{ success: boolean; message: string }> {
    return this.http.delete<{ success: boolean; message: string }>(`${this.apiUrl}/${userId}`);
  }

  /**
   * Get user by Telegram ID
   * @param telegramId Telegram ID
   */
  getUserByTelegramId(telegramId: string): Observable<GetUserByIdResponseDto> {
    return this.http.get<GetUserByIdResponseDto>(`${this.apiUrl}/telegram/${telegramId}`);
  }
}
