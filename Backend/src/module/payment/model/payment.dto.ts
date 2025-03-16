import { PaginationMeta } from "src/shared/model/GenericResponse.dto";
import { PaymentMethod, PaymentStatus } from "@prisma/client";

export class PaymentResponseDto {
  id: string;
  orderId: string;
  amount: number;
  method: PaymentMethod;
  status: PaymentStatus;
  createdAt: Date;
  updatedAt: Date;
}

export class GetAllPaymentsResponseDto {
  success: boolean;
  message: string;
  data: PaymentResponseDto[];
  pagination?: PaginationMeta;
  timestamp: string;

  constructor(
    success: boolean,
    message: string,
    data: PaymentResponseDto[],
    pagination?: PaginationMeta
  ) {
    this.success = success;
    this.message = message;
    this.data = data;
    this.pagination = pagination;
    this.timestamp = new Date().toISOString();
  }
}

export class GetPaymentByIdResponseDto {
  success: boolean;
  message: string;
  data: PaymentResponseDto;
  timestamp: string;

  constructor(success: boolean, message: string, data: PaymentResponseDto) {
    this.success = success;
    this.message = message;
    this.data = data;
    this.timestamp = new Date().toISOString();
  }
}

export class CreatePaymentDto {
  orderId: string;
  amount: number;
  method: PaymentMethod;
}

export class UpdatePaymentDto {
  status?: PaymentStatus;
}
