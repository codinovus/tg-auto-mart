import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

// DTO for creating a product category
export class CreateProductCategoryDto {
  @IsString()
  @IsNotEmpty()
  name: string;
}

// DTO for updating a product category
export class UpdateProductCategoryDto {
  @IsString()
  @IsOptional()
  name?: string;
}

// DTO for individual product category response
export class ProductCategoryResponseDto {
  id: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

// DTO for paginated response of product categories
export class GetAllProductCategoriesResponseDto {
  success: boolean;
  message: string;
  data: ProductCategoryResponseDto[];
  pagination: {
    totalItems: number;
    totalPages: number;
    currentPage: number;
    perPage: number;
  };

  constructor(
    success: boolean,
    message: string,
    data: ProductCategoryResponseDto[],
    pagination: { totalItems: number; totalPages: number; currentPage: number; perPage: number },
  ) {
    this.success = success;
    this.message = message;
    this.data = data;
    this.pagination = pagination;
  }
}
