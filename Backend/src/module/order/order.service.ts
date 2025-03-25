import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from 'src/shared/prisma/prisma.service';
import {
  CreateOrderDto,
  GetAllOrdersResponseDto,
  GetOrderByIdResponseDto,
  OrderResponseDto,
  UpdateOrderDto,
} from './model/order.dto';
import { ProductKeyService } from '../product-key/product-key.service';
import { ProductKeyResponseDto } from '../product-key/model/product-key.dto';

@Injectable()
export class OrderService {
  constructor(private prisma: PrismaService, private ProductkeyService : ProductKeyService) {}

  // Helper Methods
  private validatePagination(page: number, limit: number): void {
    if (page < 1 || limit < 1) {
      throw new BadRequestException('Page and limit must be positive integers');
    }
  }

  private async validateProductExists(productId: string): Promise<void> {
    // All IDs are strings (UUIDs), so no conversion needed
    const product = await this.prisma.product.findUnique({ where: { id: productId } });
    if (!product) {
      throw new NotFoundException(`Product with ID ${productId} not found`);
    }
  }

  private async validateUserExists(userId: string): Promise<void> {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }
  }

  private async validateOrderExists(orderId: string): Promise<void> {
    const order = await this.prisma.order.findUnique({ where: { id: orderId } });
    if (!order) {
      throw new NotFoundException(`Order with ID ${orderId} not found`);
    }
  }

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

  // Create Methods
  async createOrder(createOrderDto: CreateOrderDto): Promise<OrderResponseDto> {
    const { userId, productId, quantity = 1, promoCodeId } = createOrderDto;
  
    await this.validateProductExists(productId);
    await this.validateUserExists(userId);
  
    if (promoCodeId) {
      const promoCode = await this.prisma.promoCode.findUnique({
        where: { id: promoCodeId },
      });
  
      if (!promoCode) {
        throw new NotFoundException(`PromoCode with ID ${promoCodeId} not found`);
      }
    }
  
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
  
    try {
      return await this.prisma.$transaction(async (prisma) => {
        const order = await prisma.order.create({
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
  
        let productKey: ProductKeyResponseDto | null = null;
        if (product.autoDeliver) {
          productKey = await this.ProductkeyService.getAvailableProductKeyByProductId(productId);
  
          if (productKey) {
            // Update the product key to mark it as sold and link it to the order
            await prisma.productKey.update({
              where: { id: productKey.id },
              data: {
                isSold: true,
                orderId: order.id,
              },
            });
          }
        }
  
        // Decrease the product stock by the quantity ordered
        await prisma.product.update({
          where: { id: productId },
          data: {
            stock: {
              decrement: quantity,
            },
          },
        });
  
        return {
          ...this.mapToOrderResponseDto(order),
          productKey: productKey ? productKey.key : null,
          message: productKey ? null : 'Your order will be fulfilled shortly.',
        };
      });
    } catch (error) {
      throw new BadRequestException('Error creating order: ' + error.message);
    }
  }

  // Get Methods
  async getAllOrders(page: number, limit: number): Promise<GetAllOrdersResponseDto> {
    // Convert page and limit to numbers in case they come as strings
    const pageNum = Number(page);
    const limitNum = Number(limit);
    
    this.validatePagination(pageNum, limitNum);
  
    const totalItems = await this.prisma.order.count();
    const orders = await this.prisma.order.findMany({
      skip: (pageNum - 1) * limitNum,
      take: limitNum, // Now it's a number
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
        totalPages: Math.ceil(totalItems / limitNum),
        currentPage: pageNum,
        perPage: limitNum,
      },
    );
  }

  async getOrdersByUserId(userId: string, page: number, limit: number): Promise<GetAllOrdersResponseDto> {
    this.validatePagination(page, limit);
    await this.validateUserExists(userId);

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
    this.validatePagination(page, limit);

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
    if (!orderId) {
      throw new BadRequestException('Order ID is required');
    }

    await this.validateOrderExists(orderId);

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

    return new GetOrderByIdResponseDto(true, 'Order fetched successfully', this.mapToOrderResponseDto(order));
  }

  // Update Methods
  async updateOrderById(orderId: string, updateData: UpdateOrderDto): Promise<OrderResponseDto> {
    if (!orderId) {
      throw new BadRequestException('Order ID is required');
    }

    await this.validateOrderExists(orderId);

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
    if (!orderId) {
      throw new BadRequestException('Order ID is required');
    }

    await this.validateOrderExists(orderId);

    await this.prisma.order.delete({ where: { id: orderId } });

    return { success: true, message: `Order with ID ${orderId} deleted successfully` };
  }
}