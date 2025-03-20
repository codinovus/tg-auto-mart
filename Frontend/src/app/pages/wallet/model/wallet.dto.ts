import { TransactionResponseDto } from "../../transaction/model/transaction.dto";


/**
 * Data transfer object for creating a new wallet
 */
export interface CreateWalletDto {
  userId: string;
}

/**
 * Data transfer object for updating an existing wallet
 */
export interface UpdateWalletDto {
  balance?: number;
}

/**
 * Data transfer object representing a wallet response
 */
export interface WalletResponseDto {
  id: string;
  balance: number;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
  username?: string | null;
  telegramId?: string | null;
  transactions?: TransactionResponseDto[];
}

/**
 * Data transfer object for the paginated response of wallets
 */
export interface GetAllWalletsResponseDto {
  success: boolean;
  message: string;
  data: WalletResponseDto[];
  pagination: {
    totalItems: number;
    totalPages: number;
    currentPage: number;
    perPage: number;
  };
}
