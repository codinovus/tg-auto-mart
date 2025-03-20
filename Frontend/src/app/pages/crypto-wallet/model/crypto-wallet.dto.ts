import { CryptoType } from "../../../shared/enums/app-enums";


/**
 * Data transfer object for creating a new crypto wallet
 */
export interface CreateCryptoWalletDto {
  type: CryptoType;
  address: string;
  userId: string;
}

/**
 * Data transfer object representing a crypto wallet response
 */
export interface CryptoWalletResponseDto {
  id: string;
  type: CryptoType;
  address: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Data transfer object for the paginated response of crypto wallets
 */
export interface GetAllCryptoWalletsResponseDto {
  success: boolean;
  message: string;
  data: CryptoWalletResponseDto[];
  pagination: {
    totalItems: number;
    totalPages: number;
    currentPage: number;
    perPage: number;
  };
}

/**
 * Data transfer object for updating an existing crypto wallet
 */
export interface UpdateCryptoWalletDto {
  type?: CryptoType;
  address?: string;
}
