import { PaginationMeta } from "src/shared/model/GenericResponse.dto";
import { PaymentMethod, PaymentStatus } from "@prisma/client";

// DTO for a single payment response
export class PaymentResponseDto {
  id: string;
  orderId: string;
  amount: number;
  method: PaymentMethod;
  status: PaymentStatus;
  createdAt: Date;
  updatedAt: Date;

  constructor(
    id: string,
    orderId: string,
    amount: number,
    method: PaymentMethod,
    status: PaymentStatus,
    createdAt: Date,
    updatedAt: Date
  ) {
    this.id = id;
    this.orderId = orderId;
    this.amount = amount;
    this.method = method;
    this.status = status;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }
}

// DTO for fetching all payments with pagination
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

// DTO for fetching a single payment by ID
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

// DTO for creating a new payment
export class CreatePaymentDto {
  orderId: string;
  amount: number;
  method: PaymentMethod;
}

// DTO for updating an existing payment
export class UpdatePaymentDto {
  status?: PaymentStatus;
}