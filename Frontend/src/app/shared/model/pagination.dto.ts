/**
 * Generic pagination metadata interface
 * Used across all paginated responses
 */
export interface PaginationMeta {
    totalItems: number;
    totalPages: number;
    currentPage: number;
    perPage: number;
  }

  /**
   * Generic paginated response interface
   * Can be used with any data type
   */
  export interface PaginatedResponse<T> {
    success: boolean;
    message: string;
    data: T[];
    pagination: PaginationMeta;
    timestamp: string;
  }

  /**
   * Generic single item response interface
   * Can be used with any data type
   */
  export interface SingleItemResponse<T> {
    success: boolean;
    message: string;
    data: T;
    timestamp: string;
  }

  /**
   * Interface for a generic API response
   */
  export interface GenericResponse<T> {
    success: boolean;
    message: string;
    data: T;
    timestamp: string;
  }

  /**
   * Interface for request pagination parameters
   * Used when making API requests that support pagination
   */
  export interface PaginationParams {
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    search?: string;
  }
