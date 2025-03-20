import { OrderStatus } from "../../../shared/enums/app-enums";
import { PaginationMeta } from "../../../shared/model/pagination.dto";
import { DisputeResponseDto } from "../../dispute/model/dispute.dto";
import { PaymentResponseDto } from "../../payment/model/payment.dto";
import { ProductResponseDto } from "../../product/model/product.dto";
import { PromoCodeResponseDto } from "../../promo-code/model/promo-code.dto";
import { TransactionResponseDto } from "../../transaction/model/transaction.dto";

/**
 * Data transfer object representing an order response
 */
export interface OrderResponseDto {
  id: string;
  userId: string;
  product: ProductResponseDto;
  productId: string;
  quantity: number;
  total: number;
  discountAmount?: number | null;
  status: OrderStatus;
  payment?: PaymentResponseDto;
  promoCode?: PromoCodeResponseDto;
  disputes?: DisputeResponseDto[];
  transactions?: TransactionResponseDto[];
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Data transfer object for the paginated response of orders
 */
export interface GetAllOrdersResponseDto {
  success: boolean;
  message: string;
  data: OrderResponseDto[];
  pagination?: PaginationMeta;
  timestamp: string;
}

/**
 * Data transfer object for a single order response
 */
export interface GetOrderByIdResponseDto {
  success: boolean;
  message: string;
  data: OrderResponseDto;
  timestamp: string;
}

/**
 * Data transfer object for creating a new order
 */
export interface CreateOrderDto {
  userId: string;
  productId: string;
  quantity?: number;
  promoCodeId?: string;
}

/**
 * Data transfer object for updating an existing order
 */
export interface UpdateOrderDto {
  quantity?: number;
  status?: OrderStatus;
  promoCodeId?: string;
}
