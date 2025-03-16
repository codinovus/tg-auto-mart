import { IsNotEmpty, IsOptional, IsString, IsBoolean } from 'class-validator';

// DTO for creating a product key
export class CreateProductKeyDto {
  @IsString()
  @IsNotEmpty()
  key: string;

  @IsString()
  @IsNotEmpty()
  productId: string;
}

// DTO for updating a product key
export class UpdateProductKeyDto {
  @IsBoolean()
  @IsOptional()
  isSold?: boolean;
}

// DTO for individual product key response
export class ProductKeyResponseDto {
  id: string;
  key: string;
  productId: string;
  isSold: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// DTO for paginated response of product keys
export class GetAllProductKeysResponseDto {
  success: boolean;
  message: string;
  data: ProductKeyResponseDto[];
  pagination: {
    totalItems: number;
    totalPages: number;
    currentPage: number;
    perPage: number;
  };

  constructor(
    success: boolean,
    message: string,
    data: ProductKeyResponseDto[],
    pagination: { totalItems: number; totalPages: number; currentPage: number; perPage: number },
  ) {
    this.success = success;
    this.message = message;
    this.data = data;
    this.pagination = pagination;
  }
}
