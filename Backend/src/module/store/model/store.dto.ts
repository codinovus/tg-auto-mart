import { IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';
import { PaginationMeta } from 'src/shared/model/GenericResponse.dto';

export class CreateStoreDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsUUID()
  ownerId: string;
}

export class StoreResponseDto {
  id: string;
  name: string;
  ownerId: string;
  createdAt: Date;
  updatedAt: Date;
}

export class GetAllStoresResponseDto {
  success: boolean;
  message: string;
  data: StoreResponseDto[];
  pagination?: PaginationMeta;
  timestamp: string;

  constructor(success: boolean, message: string, data: StoreResponseDto[], pagination?: PaginationMeta) {
    this.success = success;
    this.message = message;
    this.data = data;
    this.pagination = pagination;
    this.timestamp = new Date().toISOString();
  }
}

export class UpdateStoreDto {
  @IsOptional()
  @IsString()
  name?: string;
}