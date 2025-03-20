import { PaymentStatus } from "../../../shared/enums/app-enums";
import { PaginationMeta } from "../../../shared/model/pagination.dto";
import { TransactionResponseDto } from "../../transaction/model/transaction.dto";
import { UserResponseDto } from "../../user/model/user.dto";


/**
 * Data transfer object representing a deposit request response
 */
export interface DepositRequestResponseDto {
  id: string;
  user: UserResponseDto;
  userId: string;
  amount: number;
  paymentLink: string;
  status: PaymentStatus;
  transactions?: TransactionResponseDto[];
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Data transfer object for the paginated response of deposit requests
 */
export interface GetAllDepositRequestsResponseDto {
  success: boolean;
  message: string;
  data: DepositRequestResponseDto[];
  pagination?: PaginationMeta;
  timestamp: string;
}

/**
 * Data transfer object for a single deposit request response
 */
export interface GetDepositRequestByIdResponseDto {
  success: boolean;
  message: string;
  data: DepositRequestResponseDto;
  timestamp: string;
}

/**
 * Data transfer object for creating a new deposit request
 */
export interface CreateDepositRequestDto {
  userId: string;
  amount: number;
  paymentLink: string;
  status?: PaymentStatus;
}

/**
 * Data transfer object for updating an existing deposit request
 */
export interface UpdateDepositRequestDto {
  status?: PaymentStatus;
}
