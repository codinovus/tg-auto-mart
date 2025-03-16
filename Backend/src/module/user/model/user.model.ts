import { PaginationMeta } from "src/shared/model/GenericResponse.dto";
import { Role } from '@prisma/client';
import { WalletResponseDto } from "src/module/wallet/model/wallet.model";
import { CryptoWalletResponseDto } from "src/module/crypto-wallet/model/crypto-wallet.dto";

export class UserResponseDto {
    id: string | number;
    username: string | null | undefined;
    telegramId: string | null | undefined;
    role: string;
    createdAt: Date;
    updatedAt: Date;
    balance: number;
    orderCount: number;
  }

export class GetAllUsersResponseDto {
  success: boolean;
  message: string;
  data: UserResponseDto[];
  pagination?: PaginationMeta;
  timestamp: string;

  constructor(
    success: boolean,
    message: string,
    data: UserResponseDto[],
    pagination?: PaginationMeta
  ) {
    this.success = success;
    this.message = message;
    this.data = data;
    this.pagination = pagination;
    this.timestamp = new Date().toISOString();
  }
}

export class GetUserByIdResponseDto {
  success: boolean;
  message: string;
  data: UserResponseDto;
  timestamp: string;

  constructor(success: boolean, message: string, data: UserResponseDto) {
    this.success = success;
    this.message = message;
    this.data = data;
    this.timestamp = new Date().toISOString();
  }
}

export class RegisterUserModel {
  username: string;
  password?: string;
  telegramId?: string;
  role?: Role;
}

export class UpdateUserDto {
  username?: string;
  password?: string;
  telegramId?: string;
  role?: Role;
}


export class UserProfileDto {
    id: string | number;
    username: string;
    telegramId?: string;
    role: string;
    createdAt: Date;
    updatedAt: Date;
    wallet?: WalletResponseDto;
    storeCount?: number;
    orderCount?: number;
    disputeCount?: number;
    cryptoWallets?: CryptoWalletResponseDto[];
  }
