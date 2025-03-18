import { IsNotEmpty, IsOptional, IsString, IsEnum } from 'class-validator';
import { DisputeStatus } from '@prisma/client';
import { PaginationMeta } from 'src/shared/model/GenericResponse.dto';
import { OrderResponseDto } from 'src/module/order/model/order.dto';
import { UserResponseDto } from 'src/module/user/model/user.model';

// DTO for creating a dispute
export class CreateDisputeDto {
  @IsString()
  @IsNotEmpty()
  orderId: string;

  @IsString()
  @IsNotEmpty()
  userId: string;

  @IsString()
  @IsNotEmpty()
  reason: string;
}

// DTO for updating a dispute
export class UpdateDisputeDto {
  @IsEnum(DisputeStatus)
  @IsOptional()
  status?: DisputeStatus;

  @IsString()
  @IsOptional()
  resolution?: string;
}

// DTO for a single dispute response
export class DisputeResponseDto {
  id: string;
  order: OrderResponseDto;
  orderId: string;
  user: UserResponseDto;
  userId: string;
  status: DisputeStatus;
  reason: string;
  resolution?: string;
  createdAt: Date;
  updatedAt: Date;

  constructor(
    id: string,
    order: OrderResponseDto,
    orderId: string,
    user: UserResponseDto,
    userId: string,
    status: DisputeStatus,
    reason: string,
    resolution: string | undefined,
    createdAt: Date,
    updatedAt: Date
  ) {
    this.id = id;
    this.order = order;
    this.orderId = orderId;
    this.user = user;
    this.userId = userId;
    this.status = status;
    this.reason = reason;
    this.resolution = resolution;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }
}

// DTO for fetching all disputes with pagination
export class GetAllDisputesResponseDto {
  success: boolean;
  message: string;
  data: DisputeResponseDto[];
  pagination?: PaginationMeta;
  timestamp: string;

  constructor(
    success: boolean,
    message: string,
    data: DisputeResponseDto[],
    pagination?: PaginationMeta
  ) {
    this.success = success;
    this.message = message;
    this.data = data;
    this.pagination = pagination;
    this.timestamp = new Date().toISOString();
  }
}

// DTO for fetching a single dispute by ID
export class GetDisputeByIdResponseDto {
  success: boolean;
  message: string;
  data: DisputeResponseDto;
  timestamp: string;

  constructor(success: boolean, message: string, data: DisputeResponseDto) {
    this.success = success;
    this.message = message;
    this.data = data;
    this.timestamp = new Date().toISOString();
  }
}