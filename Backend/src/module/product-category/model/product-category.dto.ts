import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateProductCategoryDto {
  @IsString()
  @IsNotEmpty()
  name: string;
}

export class UpdateProductCategoryDto {
  @IsString()
  @IsOptional()
  name?: string;
}

export class ProductCategoryResponseDto {
  id: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
  productCount?: number;

  constructor(id: string, name: string, createdAt: Date, updatedAt: Date, productCount: number) {
    this.id = id;
    this.name = name;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
    this.productCount = productCount;
  }
}

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