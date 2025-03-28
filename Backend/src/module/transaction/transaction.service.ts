import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from 'src/shared/prisma/prisma.service';
import {
  CreateTransactionDto,
  UpdateTransactionDto,
  TransactionResponseDto,
  GetAllTransactionsResponseDto,
  GetTransactionByIdResponseDto,
} from './model/transaction.dto';
import { TransactionType, PaymentStatus } from '@prisma/client';

@Injectable()
export class TransactionService {
  constructor(private prisma: PrismaService) {}

  // Helper Methods
  private validatePagination(page: number, limit: number): void {
    if (page < 1 || limit < 1) {
      throw new BadRequestException('Page and limit must be positive integers');
    }
  }

  private async validateWalletExists(walletId: string): Promise<void> {
    const wallet = await this.prisma.wallet.findUnique({ where: { id: walletId } });
    if (!wallet) {
      throw new NotFoundException(`Wallet with ID ${walletId} not found`);
    }
  }

  private async validateUserExists(userId: string): Promise<void> {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException(`User  with ID ${userId} not found`);
    }
  }

  private mapToTransactionResponseDto(transaction: any): TransactionResponseDto {
    return {
      id: transaction.id,
      walletId: transaction.walletId,
      userId: transaction.userId,
      amount: transaction.amount,
      type: transaction.type,
      status: transaction.status,
      description: transaction.description,
      orderId: transaction.orderId,
      depositRequestId: transaction.depositRequestId,
      referenceId: transaction.referenceId,
      createdAt: transaction.createdAt,
      updatedAt: transaction.updatedAt,
      wallet: transaction.wallet, // Include wallet
      user: transaction.user, // Include user
    };
  }

  // Create Methods
  async createTransaction(createTransactionDto: CreateTransactionDto): Promise<TransactionResponseDto> {
    const { walletId, userId, amount, type, status = 'PENDING', description, orderId, depositRequestId, referenceId } = createTransactionDto;

    await this.validateWalletExists(walletId);
    await this.validateUserExists(userId);

    const transaction = await this.prisma.transaction.create({
      data: {
        walletId,
        userId,
        amount,
        type,
        status,
        description,
        orderId,
        depositRequestId,
        referenceId,
      },
      include: {
        wallet: true,
        user: true,
      },
    });

    return this.mapToTransactionResponseDto(transaction);
  }

  // Get Methods
async getAllTransactions(
  page: number,
  limit: number,
  search?: string, // New parameter for search
  transactionType?: TransactionType, // New parameter for transaction type
  paymentStatus?: PaymentStatus, // New parameter for payment status
): Promise<GetAllTransactionsResponseDto> {
  this.validatePagination(page, limit);

  let whereClause = {};

  // Construct the where clause based on search criteria
  if (search || transactionType || paymentStatus) {
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(search || '');

    whereClause = {
      OR: [
        ...(isUuid ? [{ id: search }] : []),
        {
          user: {
            username: {
              contains: search || '', // Search by username
              mode: 'insensitive',
            },
          },
        },
        ...(paymentStatus ? [{ status: paymentStatus }] : []),
        ...(transactionType ? [{ type: transactionType }] : []),
      ],
    };
  }

  const totalItems = await this.prisma.transaction.count({
    where: whereClause,
  });

  const transactions = await this.prisma.transaction.findMany({
    where: whereClause,
    skip: (page - 1) * limit,
    take: limit,
    include: {
      wallet: true,
      user: true,
      order: true,
      depositRequest: true,
    },
  });

  const transactionResponseDtos: TransactionResponseDto[] = transactions.map(transaction =>
    this.mapToTransactionResponseDto(transaction),
  );

  const totalPages = Math.ceil(totalItems / limit);
  return new GetAllTransactionsResponseDto(
    true,
    'Transactions fetched successfully',
    transactionResponseDtos,
    {
      totalItems,
      totalPages,
      currentPage: page,
      perPage: limit,
    },
  );
}

  async getTransactionById(transactionId: string): Promise<GetTransactionByIdResponseDto> {
    if (!transactionId) {
      throw new BadRequestException('Transaction ID is required');
    }

    const transaction = await this.prisma.transaction.findUnique({
      where: { id: transactionId },
      include: {
        wallet: true,
        user: true,
        order: true,
        depositRequest: true,
      },
    });

    if (!transaction) {
      throw new NotFoundException(`Transaction with ID ${transactionId} not found`);
    }

    return new GetTransactionByIdResponseDto(
      true,
      'Transaction fetched successfully',
      this.mapToTransactionResponseDto(transaction),
    );
  }

  // Update Methods
  async updateTransactionById(transactionId: string, updateData: UpdateTransactionDto): Promise<TransactionResponseDto> {
    if (!transactionId) {
      throw new BadRequestException('Transaction ID is required');
    }

    const transaction = await this.prisma.transaction.findUnique({
      where: { id: transactionId },
    });

    if (!transaction) {
      throw new NotFoundException(`Transaction with ID ${transactionId} not found`);
    }

    const updatedTransaction = await this.prisma.transaction.update({
      where: { id: transactionId },
      data: updateData,
      include: {
        wallet: true,
        user: true,
      },
    });

    return this.mapToTransactionResponseDto(updatedTransaction);
  }

  // Delete Methods
  async deleteTransactionById(transactionId: string): Promise<{ success: boolean; message: string }> {
    if (!transactionId) {
      throw new BadRequestException('Transaction ID is required');
    }

    const transaction = await this.prisma.transaction.findUnique({
      where: { id: transactionId },
    });

    if (!transaction) {
      throw new NotFoundException(`Transaction with ID ${transactionId} not found`);
    }

    await this.prisma.transaction.delete({
      where: { id: transactionId },
    });

    return {
      success: true,
      message: `Transaction with ID ${transactionId} deleted successfully`,
    };
  }
}