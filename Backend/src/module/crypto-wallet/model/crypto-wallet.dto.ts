import { CryptoType } from '@prisma/client';

export class CreateCryptoWalletDto {
  type: CryptoType;
  address: string;
  userId: string;
}

export class CryptoWalletResponseDto {
  id: string;
  type: CryptoType;
  address: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

export class GetAllCryptoWalletsResponseDto {
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

export class UpdateCryptoWalletDto {
  type?: CryptoType;
  address?: string;
}
