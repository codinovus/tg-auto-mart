/**
 * Data transfer object for creating a new product
 */
export interface CreateProductDto {
    name: string;
    description?: string;
    price: number;
    stock: number;
    storeId: string;
    categoryId: string;
    autoDeliver?: boolean;
  }

  /**
   * Data transfer object for updating an existing product
   */
  export interface UpdateProductDto {
    name?: string;
    description?: string;
    price?: number;
    stock?: number;
    storeId?: string;
    categoryId?: string;
    autoDeliver?: boolean;
  }

  /**
   * Data transfer object representing a product response
   */
  export interface ProductResponseDto {
    id: string;
    name: string;
    description?: string | null;
    price: number;
    stock: number;
    storeId: string;
    categoryId: string;
    autoDeliver: boolean;
    createdAt: Date;
    updatedAt: Date;
  }

  /**
   * Data transfer object for the paginated response of products
   */
  export interface GetAllProductsResponseDto {
    success: boolean;
    message: string;
    data: ProductResponseDto[];
    pagination: {
      totalItems: number;
      totalPages: number;
      currentPage: number;
      perPage: number;
    };
  }
