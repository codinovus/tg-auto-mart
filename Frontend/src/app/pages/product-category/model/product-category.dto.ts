/**
 * Data transfer object for creating a new product category
 */
export interface CreateProductCategoryDto {
    name: string;
  }

  /**
   * Data transfer object for updating an existing product category
   */
  export interface UpdateProductCategoryDto {
    name?: string;
  }

  /**
   * Data transfer object representing a product category response
   */
  export interface ProductCategoryResponseDto {
    id: string;
    name: string;
    createdAt: Date;
    updatedAt: Date;
    productCount?: number;
  }

  /**
   * Data transfer object for the paginated response of product categories
   */
  export interface GetAllProductCategoriesResponseDto {
    success: boolean;
    message: string;
    data: ProductCategoryResponseDto[];
    pagination: {
      totalItems: number;
      totalPages: number;
      currentPage: number;
      perPage: number;
    };
  }
