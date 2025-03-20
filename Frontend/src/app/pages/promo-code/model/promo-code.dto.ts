import { PaginationMeta } from "../../../shared/model/pagination.dto";
import { OrderResponseDto } from "../../order/model/order.dto";

/**
 * Data transfer object representing a promo code response
 */
export interface PromoCodeResponseDto {
  id: string;
  code: string;
  discount: number;
  expiresAt: Date;
  isActive: boolean;
  usedBy?: OrderResponseDto[];
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Data transfer object for the paginated response of promo codes
 */
export interface GetAllPromoCodesResponseDto {
  success: boolean;
  message: string;
  data: PromoCodeResponseDto[];
  pagination?: PaginationMeta;
  timestamp: string;
}

/**
 * Data transfer object for a single promo code response
 */
export interface GetPromoCodeByIdResponseDto {
  success: boolean;
  message: string;
  data: PromoCodeResponseDto;
  timestamp: string;
}

/**
 * Data transfer object for creating a new promo code
 */
export interface CreatePromoCodeDto {
  code: string;
  discount: number;
  expiresAt: Date;
  isActive?: boolean;
}

/**
 * Data transfer object for updating an existing promo code
 */
export interface UpdatePromoCodeDto {
  code?: string;
  discount?: number;
  expiresAt?: Date;
  isActive?: boolean;
}
