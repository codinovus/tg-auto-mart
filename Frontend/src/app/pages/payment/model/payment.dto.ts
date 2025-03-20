import { PaymentMethod, PaymentStatus } from "../../../shared/enums/app-enums";
import { PaginationMeta } from "../../../shared/model/pagination.dto";


/**
 * Data transfer object representing a payment response
 */
export interface PaymentResponseDto {
  id: string;
  orderId: string;
  amount: number;
  method: PaymentMethod;
  status: PaymentStatus;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Data transfer object for the paginated response of payments
 */
export interface GetAllPaymentsResponseDto {
  success: boolean;
  message: string;
  data: PaymentResponseDto[];
  pagination?: PaginationMeta;
  timestamp: string;
}

/**
 * Data transfer object for a single payment response
 */
export interface GetPaymentByIdResponseDto {
  success: boolean;
  message: string;
  data: PaymentResponseDto;
  timestamp: string;
}

/**
 * Data transfer object for creating a new payment
 */
export interface CreatePaymentDto {
  orderId: string;
  amount: number;
  method: PaymentMethod;
}

/**
 * Data transfer object for updating an existing payment
 */
export interface UpdatePaymentDto {
  status?: PaymentStatus;
}
