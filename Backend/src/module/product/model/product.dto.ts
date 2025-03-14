import {
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

// DTO for creating a product
export class CreateProductDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber()
  @IsNotEmpty()
  price: number;

  @IsNumber()
  @IsNotEmpty()
  stock: number;

  @IsUUID()
  @IsNotEmpty()
  storeId: string;

  @IsUUID()
  @IsNotEmpty()
  categoryId: string;

  @IsBoolean()
  @IsOptional()
  autoDeliver?: boolean;
}

export class UpdateProductDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber()
  @IsOptional()
  price?: number;

  @IsNumber()
  @IsOptional()
  stock?: number;

  @IsUUID()
  @IsOptional()
  storeId?: string;

  @IsUUID()
  @IsOptional()
  categoryId?: string;

  @IsBoolean()
  @IsOptional()
  autoDeliver?: boolean;
}

export class ProductResponseDto {
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


export class GetAllProductsResponseDto {
  success: boolean;
  message: string;
  data: ProductResponseDto[];
  pagination: {
    totalItems: number;
    totalPages: number;
    currentPage: number;
    perPage: number;
  };

  constructor(
    success: boolean,
    message: string,
    data: ProductResponseDto[],
    pagination: {
      totalItems: number;
      totalPages: number;
      currentPage: number;
      perPage: number;
    },
  ) {
    this.success = success;
    this.message = message;
    this.data = data;
    this.pagination = pagination;
  }
}
