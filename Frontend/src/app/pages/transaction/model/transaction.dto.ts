import { TransactionType, PaymentStatus } from "../../../shared/enums/app-enums";
import { PaginationMeta } from "../../../shared/model/pagination.dto";
import { DepositRequestResponseDto } from "../../deposit/model/deposit-request.dto";
import { OrderResponseDto } from "../../order/model/order.dto";
import { UserResponseDto } from "../../user/model/user.dto";
import { WalletResponseDto } from "../../wallet/model/wallet.dto";


/**
 * Data transfer object representing a transaction response
 */
export interface TransactionResponseDto {
  id: string;
  wallet: WalletResponseDto;
  walletId: string;
  user: UserResponseDto;
  userId: string;
  amount: number;
  type: TransactionType;
  status: PaymentStatus;
  description?: string;
  order?: OrderResponseDto;
  orderId?: string;
  depositRequest?: DepositRequestResponseDto;
  depositRequestId?: string;
  referenceId?: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Data transfer object for the paginated response of transactions
 */
export interface GetAllTransactionsResponseDto {
  success: boolean;
  message: string;
  data: TransactionResponseDto[];
  pagination?: PaginationMeta;
  timestamp: string;
}

/**
 * Data transfer object for a single transaction response
 */
export interface GetTransactionByIdResponseDto {
  success: boolean;
  message: string;
  data: TransactionResponseDto;
  timestamp: string;
}

/**
 * Data transfer object for creating a new transaction
 */
export interface CreateTransactionDto {
  walletId: string;
  userId: string;
  amount: number;
  type: TransactionType;
  status?: PaymentStatus;
  description?: string;
  orderId?: string;
  depositRequestId?: string;
  referenceId?: string;
}

/**
 * Data transfer object for updating an existing transaction
 */
export interface UpdateTransactionDto {
  status?: PaymentStatus;
  description?: string;
  referenceId?: string;
}

