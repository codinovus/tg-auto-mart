import {
  Body,
  Controller,
  DefaultValuePipe,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  UseGuards
} from '@nestjs/common';
import { TransactionService } from './transaction.service';
import {
  CreateTransactionDto,
  TransactionResponseDto,
  GetAllTransactionsResponseDto,
  UpdateTransactionDto,
  GetTransactionByIdResponseDto,
} from './model/transaction.dto';
import { JwtAuthGuard } from 'src/shared/auth/jwt-auth.guard';
import { RolesGuard } from 'src/shared/auth/roles.guard';
import { Roles } from 'src/shared/auth/roles.decorator';

@Controller('transactions')
@UseGuards(JwtAuthGuard) // Protect all routes with JWT authentication
export class TransactionController {
  constructor(private readonly transactionService: TransactionService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles('STORE_ADMIN', 'DEVELOPER') // Only allow STORE_ADMIN and DEVELOPER to create transactions
  async createTransaction(
      @Body() createTransactionDto: CreateTransactionDto
  ): Promise<{ success: boolean; message: string; data: TransactionResponseDto }> {
      const transaction = await this.transactionService.createTransaction(createTransactionDto);
      return { success: true, message: 'Transaction created successfully', data: transaction };
  }

  @Get()
  async getAllTransactions(
      @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
      @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
      @Query('search') search?: string,
  ): Promise<GetAllTransactionsResponseDto> {
      return this.transactionService.getAllTransactions(page, limit, search);
  }

  @Get(':id')
  async getTransactionById(@Param('id') transactionId: string): Promise<GetTransactionByIdResponseDto> {
      return this.transactionService.getTransactionById(transactionId);
  }

  @Put(':id')
  @UseGuards(RolesGuard)
  @Roles('STORE_ADMIN', 'DEVELOPER') // Only allow STORE_ADMIN and DEVELOPER to update transactions
  async updateTransaction(
      @Param('id') transactionId: string,
      @Body() updateTransactionDto: UpdateTransactionDto,
  ): Promise<TransactionResponseDto> {
      return this.transactionService.updateTransactionById(transactionId, updateTransactionDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @UseGuards(RolesGuard)
  @Roles('STORE_ADMIN', 'DEVELOPER') // Only allow STORE_ADMIN and DEVELOPER to delete transactions
  async deleteTransaction(@Param('id') transactionId: string): Promise<{ success: boolean; message: string }> {
      return this.transactionService.deleteTransactionById(transactionId);
  }
}