import { PaginationMeta } from "src/shared/model/GenericResponse.dto";
import { TransactionType, PaymentStatus } from "@prisma/client";
import { WalletResponseDto } from "src/module/wallet/model/wallet.model";
import { OrderResponseDto } from "src/module/order/model/order.dto";
import { UserResponseDto } from "src/module/user/model/user.model";
import { DepositRequestResponseDto } from "src/module/deposit-request/model/deposit-request.dto";

// DTO for a single transaction response
export class TransactionResponseDto {
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

  constructor(
    id: string,
    wallet: WalletResponseDto,
    walletId: string,
    user: UserResponseDto,
    userId: string,
    amount: number,
    type: TransactionType,
    status: PaymentStatus,
    description: string | undefined,
    order: OrderResponseDto | undefined,
    orderId: string | undefined,
    depositRequest: DepositRequestResponseDto | undefined,
    depositRequestId: string | undefined,
    referenceId: string | undefined,
    createdAt: Date,
    updatedAt: Date
  ) {
    this.id = id;
    this.wallet = wallet;
    this.walletId = walletId;
    this.user = user;
    this.userId = userId;
    this.amount = amount;
    this.type = type;
    this.status = status;
    this.description = description;
    this.order = order;
    this.orderId = orderId;
    this.depositRequest = depositRequest;
    this.depositRequestId = depositRequestId;
    this.referenceId = referenceId;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }
}

// DTO for fetching all transactions with pagination
export class GetAllTransactionsResponseDto {
  success: boolean;
  message: string;
  data: TransactionResponseDto[];
  pagination?: PaginationMeta;
  timestamp: string;

  constructor(
    success: boolean,
    message: string,
    data: TransactionResponseDto[],
    pagination?: PaginationMeta
  ) {
    this.success = success;
    this.message = message;
    this.data = data;
    this.pagination = pagination;
    this.timestamp = new Date().toISOString();
  }
}

// DTO for fetching a single transaction by ID
export class GetTransactionByIdResponseDto {
  success: boolean;
  message: string;
  data: TransactionResponseDto;
  timestamp: string;

  constructor(success: boolean, message: string, data: TransactionResponseDto) {
    this.success = success;
    this.message = message;
    this.data = data;
    this.timestamp = new Date().toISOString();
  }
}

// DTO for creating a new transaction
export class CreateTransactionDto {
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

// DTO for updating an existing transaction
export class UpdateTransactionDto {
  status?: PaymentStatus;
  description?: string;
  referenceId?: string;
}