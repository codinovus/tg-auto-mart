import { PaginationMeta } from "src/shared/model/GenericResponse.dto";
import { OrderResponseDto } from "src/module/order/model/order.dto";

// DTO for a single promo code response
export class PromoCodeResponseDto {
  id: string;
  code: string;
  discount: number;
  expiresAt: Date;
  isActive: boolean;
  usedBy?: OrderResponseDto[];
  createdAt: Date;
  updatedAt: Date;

  constructor(
    id: string,
    code: string,
    discount: number,
    expiresAt: Date,
    isActive: boolean,
    usedBy: OrderResponseDto[] | undefined,
    createdAt: Date,
    updatedAt: Date
  ) {
    this.id = id;
    this.code = code;
    this.discount = discount;
    this.expiresAt = expiresAt;
    this.isActive = isActive;
    this.usedBy = usedBy;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }
}

// DTO for fetching all promo codes with pagination
export class GetAllPromoCodesResponseDto {
  success: boolean;
  message: string;
  data: PromoCodeResponseDto[];
  pagination?: PaginationMeta;
  timestamp: string;

  constructor(
    success: boolean,
    message: string,
    data: PromoCodeResponseDto[],
    pagination?: PaginationMeta
  ) {
    this.success = success;
    this.message = message;
    this.data = data;
    this.pagination = pagination;
    this.timestamp = new Date().toISOString();
  }
}

// DTO for fetching a single promo code by ID
export class GetPromoCodeByIdResponseDto {
  success: boolean;
  message: string;
  data: PromoCodeResponseDto;
  timestamp: string;

  constructor(success: boolean, message: string, data: PromoCodeResponseDto) {
    this.success = success;
    this.message = message;
    this.data = data;
    this.timestamp = new Date().toISOString();
  }
}

// DTO for creating a new promo code
export class CreatePromoCodeDto {
  code: string;
  discount: number;
  expiresAt: Date;
  isActive?: boolean;
}

// DTO for updating an existing promo code
export class UpdatePromoCodeDto {
  code?: string;
  discount?: number;
  expiresAt?: Date;
  isActive?: boolean;
}