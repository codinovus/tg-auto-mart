import { PaginationMeta } from "src/shared/model/GenericResponse.dto";
import { TransactionType, PaymentStatus } from "@prisma/client";
import { WalletResponseDto } from "src/module/wallet/model/wallet.model";

import { OrderResponseDto } from "src/module/order/model/order.dto";
import { UserResponseDto } from "src/module/user/model/user.model";
import { DepositRequestResponseDto } from "src/module/deposit-request/model/deposit-request.dto";


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
}

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

export class UpdateTransactionDto {
  status?: PaymentStatus;
  description?: string;
  referenceId?: string;
}
