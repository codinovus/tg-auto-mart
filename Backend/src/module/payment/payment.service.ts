import {
    Injectable,
    ConflictException,
    NotFoundException,
  } from '@nestjs/common';
  import { PrismaService } from 'src/shared/prisma/prisma.service';
  import {
    CreatePaymentDto,
    UpdatePaymentDto,
    PaymentResponseDto,
    GetAllPaymentsResponseDto,
    GetPaymentByIdResponseDto,
  } from './model/payment.dto';
  
  @Injectable()
  export class PaymentService {
    constructor(private prisma: PrismaService) {}
  
    async createPayment(createPaymentDto: CreatePaymentDto): Promise<PaymentResponseDto> {
      const { orderId, amount, method } = createPaymentDto;
  
      // Check if the order exists
      const order = await this.prisma.order.findUnique({
        where: { id: orderId },
      });
      if (!order) {
        throw new NotFoundException(`Order with ID ${orderId} not found`);
      }
  
      // Check if a payment already exists for this order
      const existingPayment = await this.prisma.payment.findUnique({
        where: { orderId },
      });
      if (existingPayment) {
        throw new ConflictException(`Payment for order with ID ${orderId} already exists`);
      }
  
      // Create the payment
      const payment = await this.prisma.payment.create({
        data: {
          orderId,
          amount,
          method,
        },
      });
  
      return this.mapToPaymentResponseDto(payment);
    }
  
    async getAllPayments(page: number, limit: number): Promise<GetAllPaymentsResponseDto> {
      const totalItems = await this.prisma.payment.count();
      const payments = await this.prisma.payment.findMany({
        skip: (page - 1) * limit,
        take: limit,
      });
  
      const paymentResponseDtos: PaymentResponseDto[] = payments.map(payment =>
        this.mapToPaymentResponseDto(payment),
      );
  
      const totalPages = Math.ceil(totalItems / limit);
      return new GetAllPaymentsResponseDto(
        true,
        'Payments fetched successfully',
        paymentResponseDtos,
        {
          totalItems,
          totalPages,
          currentPage: page,
          perPage: limit,
        },
      );
    }
  
    async getPaymentById(paymentId: string): Promise<GetPaymentByIdResponseDto> {
      const payment = await this.prisma.payment.findUnique({
        where: { id: paymentId },
      });
  
      if (!payment) {
        throw new NotFoundException(`Payment with ID ${paymentId} not found`);
      }
  
      return new GetPaymentByIdResponseDto(
        true,
        'Payment fetched successfully',
        this.mapToPaymentResponseDto(payment),
      );
    }
  
    async updatePaymentById(
      paymentId: string,
      updateData: UpdatePaymentDto,
    ): Promise<PaymentResponseDto> {
      const payment = await this.prisma.payment.findUnique({
        where: { id: paymentId },
      });
  
      if (!payment) {
        throw new NotFoundException(`Payment with ID ${paymentId} not found`);
      }
  
      const updatedPayment = await this.prisma.payment.update({
        where: { id: paymentId },
        data: updateData,
      });
  
      return this.mapToPaymentResponseDto(updatedPayment);
    }
  
    async deletePaymentById(paymentId: string): Promise<{ success: boolean; message: string }> {
      const payment = await this.prisma.payment.findUnique({
        where: { id: paymentId },
      });
  
      if (!payment) {
        throw new NotFoundException(`Payment with ID ${paymentId} not found`);
      }
  
      await this.prisma.payment.delete({
        where: { id: paymentId },
      });
  
      return {
        success: true,
        message: `Payment with ID ${paymentId} deleted successfully`,
      };
    }
  
    private mapToPaymentResponseDto(payment: any): PaymentResponseDto {
      return {
        id: payment.id,
        orderId: payment.orderId,
        amount: payment.amount,
        method: payment.method,
        status: payment.status,
        createdAt: payment.createdAt,
        updatedAt: payment.updatedAt,
      };
    }
  }