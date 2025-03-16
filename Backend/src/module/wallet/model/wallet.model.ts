import { IsNotEmpty, IsOptional, IsString, IsNumber } from 'class-validator';

export class CreateWalletDto {
  @IsString()
  @IsNotEmpty()
  userId: string;
}

export class UpdateWalletDto {
  @IsNumber()
  @IsOptional()
  balance?: number;
}

export class WalletResponseDto {
  id: string;
  balance: number;
  userId?: string;
  createdAt: Date;
  updatedAt?: Date;
  username?: string | null;
  telegramId?: string | null;

  constructor(id: string, balance: number, userId: string, createdAt: Date, updatedAt: Date, username?: string | null, telegramId?: string | null) {
    this.id = id;
    this.balance = balance;
    this.userId = userId;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
    this.username = username;
    this.telegramId = telegramId;
  }
}

export class GetAllWalletsResponseDto {
  success: boolean;
  message: string;
  data: WalletResponseDto[];
  pagination: {
    totalItems: number;
    totalPages: number;
    currentPage: number;
    perPage: number;
  };

  constructor(
    success: boolean,
    message: string,
    data: WalletResponseDto[],
    pagination: { totalItems: number; totalPages: number; currentPage: number; perPage: number },
  ) {
    this.success = success;
    this.message = message;
    this.data = data;
    this.pagination = pagination;
  }
}