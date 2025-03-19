import { PaginationMeta } from "src/shared/model/GenericResponse.dto";
import { Role } from '@prisma/client';
import { WalletResponseDto } from "src/module/wallet/model/wallet.model";
import { CryptoWalletResponseDto } from "src/module/crypto-wallet/model/crypto-wallet.dto";
import { ReferralResponseDto } from "src/module/referral/model/referral.dto";
import { StoreResponseDto } from "src/module/store/model/store.dto";
import { DepositRequestResponseDto } from "src/module/deposit-request/model/deposit-request.dto";
import { DisputeResponseDto } from "src/module/dispute/model/dispute.dto";
import { OrderResponseDto } from "src/module/order/model/order.dto";
import { TransactionResponseDto } from "src/module/transaction/model/transaction.dto";

export class UserResponseDto {
    id: string | number;
    username: string | null | undefined;
    telegramId: string | null | undefined;
    role: string;
    createdAt: Date;
    updatedAt: Date;
    password?: string;
    wallet?: WalletResponseDto;
    orders?: OrderResponseDto[];
    balance: number;
    orderCount: number;
    disputeCount?: number;
    storeCount?: number;
    cryptoWallets?: CryptoWalletResponseDto[];
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
    cryptoWallets?: CryptoWalletResponseDto[];
    referrals?: ReferralResponseDto[];
    referredBy?: ReferralResponseDto[];
    store?: StoreResponseDto;
    orders?: OrderResponseDto[];
    disputes?: DisputeResponseDto[];
    transactions?: TransactionResponseDto[];
    depositRequests?: DepositRequestResponseDto[];
    orderCount?: number;
    disputeCount?: number;
    storeCount?: number;
}

export class LoginDto {
    username: string;
    password: string;
  }
  
  export class RegisterDto {
    username: string;
    password: string;
    telegramId?: string;
    role?: string;
  }
  
  export class AuthResponseDto {
    success: boolean;
    message: string;
    data: {
      token: string;
      user: {
        id: string;
        username: string;
        role: string;
      }
    };
    timestamp: string;
  
    constructor(success: boolean, message: string, token: string, user: any) {
      this.success = success;
      this.message = message;
      this.data = {
        token,
        user: {
          id: user.id,
          username: user.username,
          role: user.role
        }
      };
      this.timestamp = new Date().toISOString();
    }
  }

  export interface JwtPayload {
    sub: string; // User ID
    username: string;
    role: string;
  }