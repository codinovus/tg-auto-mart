export class GenericResponseDto<T> {
    success: boolean;
    message: string;
    data?: T;
    error?: any;
    timestamp: string;
    pagination?: PaginationMeta;
  
    constructor(
      success: boolean,
      message: string,
      data?: T,
      error?: any,
      pagination?: PaginationMeta
    ) {
      this.success = success;
      this.message = message;
      this.data = data;
      this.error = error;
      this.timestamp = new Date().toISOString();
      this.pagination = pagination;
    }
  
    // Static method for success response
    static success<T>(message: string, data?: T, pagination?: PaginationMeta): GenericResponseDto<T> {
      return new GenericResponseDto<T>(true, message, data, undefined, pagination);
    }
  
    // Static method for error response
    static error<T>(message: string, error?: any): GenericResponseDto<T> {
      return new GenericResponseDto<T>(false, message, undefined, error);
    }
  }
  
  // Pagination Metadata Interface
  export interface PaginationMeta {
    totalItems: number;
    totalPages: number;
    currentPage: number;
    perPage: number;
  }
  