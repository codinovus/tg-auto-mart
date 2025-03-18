import {
  Injectable,
  ConflictException,
  NotFoundException,
  BadRequestException,
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

  // Helper Methods
  private validatePagination(page: number, limit: number): void {
    if (page < 1 || limit < 1) {
      throw new BadRequestException('Page and limit must be positive integers');
    }
  }

  private async validateOrderExists(orderId: string): Promise<void> {
    const order = await this.prisma.order.findUnique({ where: { id: orderId } });
    if (!order) {
      throw new NotFoundException(`Order with ID ${orderId} not found`);
    }
  }

  private async validatePaymentExists(paymentId: string): Promise<void> {
    const payment = await this.prisma.payment.findUnique({ where: { id: paymentId } });
    if (!payment) {
      throw new NotFoundException(`Payment with ID ${paymentId} not found`);
    }
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

  // Create Methods
  async createPayment(createPaymentDto: CreatePaymentDto): Promise<PaymentResponseDto> {
    const { orderId, amount, method } = createPaymentDto;

    if (!orderId || amount <= 0 || !method) {
      throw new BadRequestException('Order ID, amount (greater than 0), and payment method are required');
    }

    await this.validateOrderExists(orderId);

    const existingPayment = await this.prisma.payment.findUnique({
      where: { orderId },
    });
    if (existingPayment) {
      throw new ConflictException(`Payment for order with ID ${orderId} already exists`);
    }

    const payment = await this.prisma.payment.create({
      data: {
        orderId,
        amount,
        method,
      },
    });

    return this.mapToPaymentResponseDto(payment);
  }

  // Get Methods
  async getAllPayments(page: number, limit: number): Promise<GetAllPaymentsResponseDto> {
    this.validatePagination(page, limit);

    const totalItems = await this.prisma.payment.count();
    const payments = await this.prisma.payment.findMany({
      skip: (page - 1) * limit,
      take: limit,
    });

    return new GetAllPaymentsResponseDto(
      true,
      'Payments fetched successfully',
      payments.map((payment) => this.mapToPaymentResponseDto(payment)),
      {
        totalItems,
        totalPages: Math.ceil(totalItems / limit),
        currentPage: page,
        perPage: limit,
      },
    );
  }

  async getPaymentById(paymentId: string): Promise<GetPaymentByIdResponseDto> {
    if (!paymentId) {
      throw new BadRequestException('Payment ID is required');
    }

    await this.validatePaymentExists(paymentId);

    const payment = await this.prisma.payment.findUnique({
      where: { id: paymentId },
    });

    return new GetPaymentByIdResponseDto(
      true,
      'Payment fetched successfully',
      this.mapToPaymentResponseDto(payment),
    );
  }

  // Update Methods
  async updatePaymentById(paymentId: string, updateData: UpdatePaymentDto): Promise<PaymentResponseDto> {
    if (!paymentId) {
      throw new BadRequestException('Payment ID is required');
    }

    await this.validatePaymentExists(paymentId);

    const updatedPayment = await this.prisma.payment.update({
      where: { id: paymentId },
      data: updateData,
    });

    return this.mapToPaymentResponseDto(updatedPayment);
  }

  // Delete Methods
  async deletePaymentById(paymentId: string): Promise<{ success: boolean; message: string }> {
    if (!paymentId) {
      throw new BadRequestException('Payment ID is required');
    }

    await this.validatePaymentExists(paymentId);

    await this.prisma.payment.delete({
      where: { id: paymentId },
    });

    return {
      success: true,
      message: `Payment with ID ${paymentId} deleted successfully`,
    };
  }
}