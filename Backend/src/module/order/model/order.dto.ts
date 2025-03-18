import { PaginationMeta } from "src/shared/model/GenericResponse.dto";
import { OrderStatus } from "@prisma/client";
import { ProductResponseDto } from "src/module/product/model/product.dto";
import { PaymentResponseDto } from "src/module/payment/model/payment.dto";
import { PromoCodeResponseDto } from "src/module/promo-code/model/promo-code.dto";
import { DisputeResponseDto } from "src/module/dispute/model/dispute.dto";
import { TransactionResponseDto } from "src/module/transaction/model/transaction.dto";


export class OrderResponseDto {
  id: string;
  userId: string;
  product: ProductResponseDto;
  productId: string;
  quantity: number;
  total: number;
  discountAmount?: number | null;;
  status: OrderStatus;
  payment?: PaymentResponseDto;
  promoCode?: PromoCodeResponseDto;
  disputes?: DisputeResponseDto[];
  transactions?: TransactionResponseDto[];
  createdAt: Date;
  updatedAt: Date;
}

export class GetAllOrdersResponseDto {
  success: boolean;
  message: string;
  data: OrderResponseDto[];
  pagination?: PaginationMeta;
  timestamp: string;

  constructor(
    success: boolean,
    message: string,
    data: OrderResponseDto[],
    pagination?: PaginationMeta
  ) {
    this.success = success;
    this.message = message;
    this.data = data;
    this.pagination = pagination;
    this.timestamp = new Date().toISOString();
  }
}

export class GetOrderByIdResponseDto {
  success: boolean;
  message: string;
  data: OrderResponseDto;
  timestamp: string;

  constructor(success: boolean, message: string, data: OrderResponseDto) {
    this.success = success;
    this.message = message;
    this.data = data;
    this.timestamp = new Date().toISOString();
  }
}

export class CreateOrderDto {
  userId: string;
  productId: string;
  quantity?: number;
  promoCodeId?: string;
}

export class UpdateOrderDto {
  quantity?: number;
  status?: OrderStatus;
  promoCodeId?: string;
}
