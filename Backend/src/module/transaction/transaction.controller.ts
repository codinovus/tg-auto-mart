import {
    Body,
    Controller,
    Delete,
    Get,
    HttpCode,
    HttpStatus,
    Param,
    Post,
    Put,
    Query,
  } from '@nestjs/common';
  import { TransactionService } from './transaction.service';
  import {
    CreateTransactionDto,
    TransactionResponseDto,
    GetAllTransactionsResponseDto,
    UpdateTransactionDto,
    GetTransactionByIdResponseDto,
  } from './model/transaction.dto';
  
  @Controller('transactions')
  export class TransactionController {
    constructor(private readonly transactionService: TransactionService) {}
  
    @Post()
    async createTransaction(@Body() createTransactionDto: CreateTransactionDto): Promise<{ success: boolean; message: string; data: TransactionResponseDto }> {
      const transaction = await this.transactionService.createTransaction(createTransactionDto);
      return { success: true, message: 'Transaction created successfully', data: transaction };
    }
  
    @Get()
    async getAllTransactions(
      @Query('page') page = 1,
      @Query('limit') limit = 10,
    ): Promise<GetAllTransactionsResponseDto> {
      return this.transactionService.getAllTransactions(page, limit);
    }
  
    @Get(':id')
    async getTransactionById(@Param('id') transactionId: string): Promise<GetTransactionByIdResponseDto> {
      return this.transactionService.getTransactionById(transactionId);
    }
  
    @Put(':id')
    async updateTransaction(
      @Param('id') transactionId: string,
      @Body() updateTransactionDto: UpdateTransactionDto,
    ): Promise<TransactionResponseDto> {
      return this.transactionService.updateTransactionById(transactionId, updateTransactionDto);
    }
  
    @Delete(':id')
    @HttpCode(HttpStatus.OK)
    async deleteTransaction(@Param('id') transactionId: string): Promise<{ success: boolean; message: string }> {
      return this.transactionService.deleteTransactionById(transactionId);
    }
  }