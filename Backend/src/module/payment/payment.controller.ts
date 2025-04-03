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
  UseGuards,
  Request,
  ForbiddenException,
} from '@nestjs/common';
import { PaymentService } from './payment.service';
import {
  CreatePaymentDto,
  PaymentResponseDto,
  GetAllPaymentsResponseDto,
  UpdatePaymentDto,
  GetPaymentByIdResponseDto,
} from './model/payment.dto';
import { JwtAuthGuard } from 'src/shared/auth/jwt-auth.guard';
import { RolesGuard } from 'src/shared/auth/roles.guard';
import { Roles } from 'src/shared/auth/roles.decorator';
import { PrismaService } from 'src/shared/prisma/prisma.service';

@Controller('payments')
@UseGuards(JwtAuthGuard)
export class PaymentController {
  constructor(
    private readonly paymentService: PaymentService,
    private readonly prisma: PrismaService
  ) {}

  @Post()
  async createPayment(
    @Body() createPaymentDto: CreatePaymentDto,
    @Request() req
  ): Promise<{ success: boolean; message: string; data: PaymentResponseDto }> {
    // To ensure this payment is associated with the user's order
    const order = await this.prisma.order.findUnique({
      where: { id: createPaymentDto.orderId },
      select: { userId: true }
    });
    
    if (!order) {
      throw new ForbiddenException('Order not found');
    }
    
    if (order.userId !== req.user.id && req.user.role !== 'STORE_ADMIN' && req.user.role !== 'DEVELOPER') {
      throw new ForbiddenException('You cannot create a payment for someone else\'s order');
    }
    
    const payment = await this.paymentService.createPayment(createPaymentDto);
    return {
      success: true,
      message: 'Payment created successfully',
      data: payment,
    };
  }

  @Get()
  @UseGuards(RolesGuard)
  @Roles('STORE_ADMIN', 'DEVELOPER')
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
    @Request() req
  ): Promise<GetPaymentByIdResponseDto> {
    const payment = await this.prisma.payment.findUnique({
      where: { id: paymentId },
      include: { order: { select: { userId: true } } }
    });
    
    if (!payment) {
      throw new ForbiddenException('Payment not found');
    }
    
    if (payment.order.userId !== req.user.id && req.user.role !== 'STORE_ADMIN' && req.user.role !== 'DEVELOPER') {
      throw new ForbiddenException('You do not have permission to access this payment');
    }
    
    return this.paymentService.getPaymentById(paymentId);
  }

  @Put(':id')
  async updatePayment(
    @Param('id') paymentId: string,
    @Body() updatePaymentDto: UpdatePaymentDto,
    @Request() req
  ): Promise<PaymentResponseDto> {
    const payment = await this.prisma.payment.findUnique({
      where: { id: paymentId },
      include: { order: { select: { userId: true } } } });
    
    if (!payment) {
      throw new ForbiddenException('Payment not found');
    }
    
    if (payment.order.userId !== req.user.id && req.user.role !== 'STORE_ADMIN' && req.user.role !== 'DEVELOPER') {
      throw new ForbiddenException('You do not have permission to update this payment');
    }
    
    return this.paymentService.updatePaymentById(paymentId, updatePaymentDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async deletePayment(
    @Param('id') paymentId: string,
    @Request() req
  ): Promise<{ success: boolean; message: string }> {
    const payment = await this.prisma.payment.findUnique({
      where: { id: paymentId },
      include: { order: { select: { userId: true } } }
    });
    
    if (!payment) {
      throw new ForbiddenException('Payment not found');
    }
    
    if (payment.order.userId !== req.user.id && req.user.role !== 'STORE_ADMIN' && req.user.role !== 'DEVELOPER') {
      throw new ForbiddenException('You do not have permission to delete this payment');
    }
    
    return this.paymentService.deletePaymentById(paymentId);
  }
}