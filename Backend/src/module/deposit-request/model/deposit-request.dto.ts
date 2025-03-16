import { PaginationMeta } from "src/shared/model/GenericResponse.dto";
import { PaymentStatus } from "@prisma/client";
import { TransactionResponseDto } from "src/module/transaction/model/transaction.dto";
import { UserResponseDto } from "src/module/user/model/user.model";

export class DepositRequestResponseDto {
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

export class GetAllDepositRequestsResponseDto {
  success: boolean;
  message: string;
  data: DepositRequestResponseDto[];
  pagination?: PaginationMeta;
  timestamp: string;

  constructor(
    success: boolean,
    message: string,
    data: DepositRequestResponseDto[],
    pagination?: PaginationMeta
  ) {
    this.success = success;
    this.message = message;
    this.data = data;
    this.pagination = pagination;
    this.timestamp = new Date().toISOString();
  }
}

export class GetDepositRequestByIdResponseDto {
  success: boolean;
  message: string;
  data: DepositRequestResponseDto;
  timestamp: string;

  constructor(
    success: boolean,
    message: string,
    data: DepositRequestResponseDto
  ) {
    this.success = success;
    this.message = message;
    this.data = data;
    this.timestamp = new Date().toISOString();
  }
}

export class CreateDepositRequestDto {
  userId: string;
  amount: number;
  paymentLink: string;
  status?: PaymentStatus;
}

export class UpdateDepositRequestDto {
  status?: PaymentStatus;
}
