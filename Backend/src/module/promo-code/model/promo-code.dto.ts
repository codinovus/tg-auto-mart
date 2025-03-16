import { PaginationMeta } from "src/shared/model/GenericResponse.dto";
import { OrderResponseDto } from "src/module/order/model/order.dto";

export class PromoCodeResponseDto {
  id: string;
  code: string;
  discount: number;
  expiresAt: Date;
  isActive: boolean;
  usedBy?: OrderResponseDto[];
  createdAt: Date;
  updatedAt: Date;
}

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

export class CreatePromoCodeDto {
  code: string;
  discount: number;
  expiresAt: Date;
  isActive?: boolean;
}

export class UpdatePromoCodeDto {
  code?: string;
  discount?: number;
  expiresAt?: Date;
  isActive?: boolean;
}
