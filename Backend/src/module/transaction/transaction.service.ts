import {
  Injectable,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { PrismaService } from 'src/shared/prisma/prisma.service';
import {
  CreateTransactionDto,
  UpdateTransactionDto,
  TransactionResponseDto,
  GetAllTransactionsResponseDto,
  GetTransactionByIdResponseDto,
} from './model/transaction.dto';
import { SearchableField, SearchBuilder } from 'src/shared/base/search-builder.util';
import { PaymentStatus, TransactionType } from '@prisma/client';

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
    search?: string,
  ): Promise<GetAllTransactionsResponseDto> {
    try {
      this.validatePagination(page, limit);
  
      const searchableFields: SearchableField[] = [
        { name: 'id', type: 'string', exact: true },
        { name: 'amount', type: 'number' },
        { name: 'status', type: 'enum', enumType: 'PaymentStatus' },
        { name: 'type', type: 'enum', enumType: 'TransactionType' },
        { 
          name: 'user', 
          nested: true, 
          relationField: 'user', 
          searchableFields: [
            { name: 'username', type: 'string' },
            { name: 'telegramId', type: 'string' },
            // Remove email as it's not in your schema
          ] 
        },
        { 
          name: 'wallet', 
          nested: true, 
          relationField: 'wallet', 
          searchableFields: [
            { name: 'balance', type: 'number' }, // Update to match your schema
          ] 
        },
      ];
      
      let whereClause = {};
      
      if (search && search.trim() !== '') {
        try {
          whereClause = SearchBuilder.buildWhereClause(search, searchableFields);
        } catch (searchError) {
          console.error("Error in search builder:", searchError);
          
          const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(search);
          const isNumber = !isNaN(parseFloat(search)) && isFinite(Number(search));
          const searchLower = search.toLowerCase();
          
          // Find matching enum values
          const matchingTransactionTypes = Object.values(TransactionType)
            .filter(value => typeof value === 'string' && value.toLowerCase().includes(searchLower));
          
          const matchingPaymentStatuses = Object.values(PaymentStatus)
            .filter(value => typeof value === 'string' && value.toLowerCase().includes(searchLower));
          
          whereClause = {
            OR: [
              ...(isUuid ? [{ id: search }] : []),
              ...(isNumber ? [{ amount: parseFloat(search) }] : []),
              ...(matchingTransactionTypes.length > 0 ? [{ type: { in: matchingTransactionTypes } }] : []),
              ...(matchingPaymentStatuses.length > 0 ? [{ status: { in: matchingPaymentStatuses } }] : []),
              {
                user: {
                  OR: [
                    { username: { contains: search, mode: 'insensitive' } },
                    { telegramId: { contains: search, mode: 'insensitive' } },
                  ]
                }
              },
              {
                wallet: {
                  balance: isNumber ? parseFloat(search) : undefined
                }
              }
            ].filter(condition => 
              Object.keys(condition).length > 0 && 
              (!condition.wallet || condition.wallet.balance !== undefined)
            )
          };
        }
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
        orderBy: {
          createdAt: 'desc',
        }, });
  
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
    } catch (error) {
      console.error("Error fetching transactions:", error);
      throw new InternalServerErrorException('An error occurred while fetching transactions');
    }
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