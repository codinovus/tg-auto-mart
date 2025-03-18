import {
    Injectable,
    NotFoundException,
  } from '@nestjs/common';
  import { PrismaService } from 'src/shared/prisma/prisma.service';
  import {
    CreateTransactionDto,
    UpdateTransactionDto,
    TransactionResponseDto,
    GetAllTransactionsResponseDto,
    GetTransactionByIdResponseDto,
  } from './model/transaction.dto';
  
  @Injectable()
  export class TransactionService {
    constructor(private prisma: PrismaService) {}
  
    async createTransaction(createTransactionDto: CreateTransactionDto): Promise<TransactionResponseDto> {
      const { walletId, userId, amount, type, status = 'PENDING', description, orderId, depositRequestId, referenceId } = createTransactionDto;
  
      // Check if the wallet exists
      const wallet = await this.prisma.wallet.findUnique({
        where: { id: walletId },
      });
      if (!wallet) {
        throw new NotFoundException(`Wallet with ID ${walletId} not found`);
      }
  
      // Check if the user exists
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
      });
      if (!user) {
        throw new NotFoundException(`User with ID ${userId} not found`);
      }
  
      // Create the transaction
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
      });
  
      return this.mapToTransactionResponseDto(transaction);
    }
  
    async getAllTransactions(page: number, limit: number): Promise<GetAllTransactionsResponseDto> {
      const totalItems = await this.prisma.transaction.count();
      const transactions = await this.prisma.transaction.findMany({
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
  
    async updateTransactionById(
      transactionId: string,
      updateData: UpdateTransactionDto,
    ): Promise<TransactionResponseDto> {
      const transaction = await this.prisma.transaction.findUnique({
        where: { id: transactionId },
      });
  
      if (!transaction) {
        throw new NotFoundException(`Transaction with ID ${transactionId} not found`);
      }
  
      const updatedTransaction = await this.prisma.transaction.update({
        where: { id: transactionId },
        data: updateData,
      });
  
      return this.mapToTransactionResponseDto(updatedTransaction);
    }
  
    async deleteTransactionById(transactionId: string): Promise<{ success: boolean; message: string }> {
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
  
    private mapToTransactionResponseDto(transaction: any): TransactionResponseDto {
      return {
        id: transaction.id,
        wallet: transaction.wallet,
        walletId: transaction.walletId,
        user: transaction.user,
        userId: transaction.userId,
        amount: transaction.amount,
        type: transaction.type,
        status: transaction.status,
        description: transaction.description,
        order: transaction.order,
        orderId: transaction.orderId,
        depositRequest: transaction.depositRequest,
        depositRequestId: transaction.depositRequestId,
        referenceId: transaction.referenceId,
        createdAt: transaction.createdAt,
        updatedAt: transaction.updatedAt,
      };
    }
  }