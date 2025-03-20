/**
 * Data transfer object for creating a new product key
 */
export interface CreateProductKeyDto {
    key: string;
    productId: string;
  }

  /**
   * Data transfer object for updating an existing product key
   */
  export interface UpdateProductKeyDto {
    isSold?: boolean;
  }

  /**
   * Data transfer object representing a product key response
   */
  export interface ProductKeyResponseDto {
    id: string;
    key: string;
    productId: string;
    isSold: boolean;
    createdAt: Date;
    updatedAt: Date;
  }

  /**
   * Data transfer object for the paginated response of product keys
   */
  export interface GetAllProductKeysResponseDto {
    success: boolean;
    message: string;
    data: ProductKeyResponseDto[];
    pagination: {
      totalItems: number;
      totalPages: number;
      currentPage: number;
      perPage: number;
    };
  }
