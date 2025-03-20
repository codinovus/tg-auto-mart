import { Role } from "../../../shared/enums/app-enums";
import { PaginationMeta } from "../../../shared/model/pagination.dto";
import { CryptoWalletResponseDto } from "../../crypto-wallet/model/crypto-wallet.dto";
import { DepositRequestResponseDto } from "../../deposit/model/deposit-request.dto";
import { DisputeResponseDto } from "../../dispute/model/dispute.dto";
import { OrderResponseDto } from "../../order/model/order.dto";
import { ReferralResponseDto } from "../../referral/model/referral.dto";
import { StoreResponseDto } from "../../store/model/store.dto";
import { TransactionResponseDto } from "../../transaction/model/transaction.dto";
import { WalletResponseDto } from "../../wallet/model/wallet.dto";


/**
 * Data transfer object representing a user response
 */
export interface UserResponseDto {
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

/**
 * Data transfer object for the paginated response of users
 */
export interface GetAllUsersResponseDto {
  success: boolean;
  message: string;
  data: UserResponseDto[];
  pagination?: PaginationMeta;
  timestamp: string;
}

/**
 * Data transfer object for a single user response
 */
export interface GetUserByIdResponseDto {
  success: boolean;
  message: string;
  data: UserResponseDto;
  timestamp: string;
}

/**
 * Data transfer object for registering a new user
 */
export interface RegisterUserModel {
  username: string;
  password?: string;
  telegramId?: string;
  role?: Role;
}

/**
 * Data transfer object for updating an existing user
 */
export interface UpdateUserDto {
  username?: string;
  password?: string;
  telegramId?: string;
  role?: Role;
}

/**
 * Data transfer object for user profile information
 */
export interface UserProfileDto {
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

/**
 * Data transfer object for user login
 */
export interface LoginDto {
  username: string;
  password: string;
}

/**
 * Data transfer object for user registration
 */
export interface RegisterDto {
  username: string;
  password: string;
  telegramId?: string;
  role?: string;
}

/**
 * Data transfer object for authentication response
 */
export interface AuthResponseDto {
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
}

/**
 * Interface for JWT payload
 */
export interface JwtPayload {
  sub: string; // User ID
  username: string;
  role: string;
}
