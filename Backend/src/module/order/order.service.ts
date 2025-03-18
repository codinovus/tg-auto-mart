import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/shared/prisma/prisma.service';
import {
  CreateOrderDto,
  GetAllOrdersResponseDto,
  GetOrderByIdResponseDto,
  OrderResponseDto,
  UpdateOrderDto,
} from './model/order.dto';

@Injectable()
export class OrderService {
  constructor(private prisma: PrismaService) {}

  // Create Methods
  async createOrder(createOrderDto: CreateOrderDto): Promise<OrderResponseDto> {
    const { userId, productId, quantity = 1, promoCodeId } = createOrderDto;
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      throw new NotFoundException(`Product with ID ${productId} not found`);
    }

    const total = product.price * quantity;

    let discountAmount = 0;
    if (promoCodeId) {
      const promoCode = await this.prisma.promoCode.findUnique({
        where: { id: promoCodeId },
      });

      if (promoCode && promoCode.isActive && new Date() < promoCode.expiresAt) {
        discountAmount = (total * promoCode.discount) / 100;
      }
    }

    const order = await this.prisma.order.create({
      data: {
        userId,
        productId,
        quantity,
        promoCodeId,
        total,
        discountAmount: discountAmount > 0 ? discountAmount : 0,
      },
      include: {
        product: true,
        payment: true,
        promoCode: true,
        disputes: true,
        Transaction: true,
      },
    });

    return this.mapToOrderResponseDto(order);
  }

  // Get Methods
  async getAllOrders(page: number, limit: number): Promise<GetAllOrdersResponseDto> {
    const totalItems = await this.prisma.order.count();

    const orders = await this.prisma.order.findMany({
      skip: (page - 1) * limit,
      take: limit,
      include: {
        product: true,
        payment: true,
        promoCode: true,
        disputes: true,
        Transaction: true,
      },
    });

    return new GetAllOrdersResponseDto(
      true,
      'Orders fetched successfully',
      orders.map((order) => this.mapToOrderResponseDto(order)),
      {
        totalItems,
        totalPages: Math.ceil(totalItems / limit),
        currentPage: page,
        perPage: limit,
      },
    );
  }

  async getOrdersByUserId(userId: string, page: number, limit: number): Promise<GetAllOrdersResponseDto> {
    const totalItems = await this.prisma.order.count({ where: { userId } });

    const orders = await this.prisma.order.findMany({
      where: { userId },
      skip: (page - 1) * limit,
      take: limit,
      include: {
        product: true,
        payment: true,
        promoCode: true,
        disputes: true,
        Transaction: true,
      },
    });

    return new GetAllOrdersResponseDto(
      true,
      'Orders fetched successfully',
      orders.map((order) => this.mapToOrderResponseDto(order)),
      {
        totalItems,
        totalPages: Math.ceil(totalItems / limit),
        currentPage: page,
        perPage: limit,
      },
    );
  }

  async getOrdersByTelegramId(telegramId: string, page: number, limit: number): Promise<GetAllOrdersResponseDto> {
    const totalItems = await this.prisma.order.count({
      where: { user: { telegramId } },
    });

    const orders = await this.prisma.order.findMany({
      where: { user: { telegramId } },
      skip: (page - 1) * limit,
      take: limit,
      include: {
        product: true,
        payment: true,
        promoCode: true,
        disputes: true,
        Transaction: true,
      },
    });

    return new GetAllOrdersResponseDto(
      true,
      'Orders fetched successfully',
      orders.map((order) => this.mapToOrderResponseDto(order)),
      {
        totalItems,
        totalPages: Math.ceil(totalItems / limit),
        currentPage: page,
        perPage: limit,
      },
    );
  }

  async getOrderById(orderId: string): Promise<GetOrderByIdResponseDto> {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: {
        product: true,
        payment: true,
        promoCode: true,
        disputes: true,
        Transaction: true,
      },
    });

    if (!order) {
      throw new NotFoundException(`Order with ID ${orderId} not found`);
    }

    return new GetOrderByIdResponseDto(true, 'Order fetched successfully', this.mapToOrderResponseDto(order));
  }

  // Update Methods
  async updateOrderById(orderId: string, updateData: UpdateOrderDto): Promise<OrderResponseDto> {
    const order = await this.prisma.order.findUnique({ where: { id: orderId } });

    if (!order) {
      throw new NotFoundException(`Order with ID ${orderId} not found`);
    }

    const updatedOrder = await this.prisma.order.update({
      where: { id: orderId },
      data: updateData,
      include: {
        product: true,
        payment: true,
        promoCode: true,
        disputes: true,
        Transaction: true,
      },
    });

    return this.mapToOrderResponseDto(updatedOrder);
  }

  // Delete Methods
  async deleteOrderById(orderId: string): Promise<{ success: boolean; message: string }> {
    const order = await this.prisma.order.findUnique({ where: { id: orderId } });

    if (!order) {
      throw new NotFoundException(`Order with ID ${orderId} not found`);
    }

    await this.prisma.order.delete({ where: { id: orderId } });

    return { success: true, message: `Order with ID ${orderId} deleted successfully` };
  }

  // Other Methods
  private mapToOrderResponseDto(order: any): OrderResponseDto {
    return {
      id: order.id,
      userId: order.userId,
      productId: order.productId,
      product: order.product,
      quantity: order.quantity,
      total: order.total,
      discountAmount: order.discountAmount,
      status: order.status,
      payment: order.payment,
      promoCode: order.promoCode,
      disputes: order.disputes,
      transactions: order.Transaction,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
    };
  }
}