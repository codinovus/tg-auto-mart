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
} from '@nestjs/common';
import { PaymentService } from './payment.service';
import {
  CreatePaymentDto,
  PaymentResponseDto,
  GetAllPaymentsResponseDto,
  UpdatePaymentDto,
  GetPaymentByIdResponseDto,
} from './model/payment.dto';

@Controller('payments')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Post()
  async createPayment(
    @Body() createPaymentDto: CreatePaymentDto,
  ): Promise<{ success: boolean; message: string; data: PaymentResponseDto }> {
    const payment = await this.paymentService.createPayment(createPaymentDto);
    return {
      success: true,
      message: 'Payment created successfully',
      data: payment,
    };
  }

  @Get()
  async getAllPayments(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
    @Query('search') search?: string,
  ): Promise<GetAllPaymentsResponseDto> {
    return this.paymentService.getAllPayments(page, limit, search);
  }

  @Get(':id')
  async getPaymentById(
    @Param('id') paymentId: string,
  ): Promise<GetPaymentByIdResponseDto> {
    return this.paymentService.getPaymentById(paymentId);
  }

  @Put(':id')
  async updatePayment(
    @Param('id') paymentId: string,
    @Body() updatePaymentDto: UpdatePaymentDto,
  ): Promise<PaymentResponseDto> {
    return this.paymentService.updatePaymentById(paymentId, updatePaymentDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async deletePayment(
    @Param('id') paymentId: string,
  ): Promise<{ success: boolean; message: string }> {
    return this.paymentService.deletePaymentById(paymentId);
  }
}
