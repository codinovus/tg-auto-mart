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
import { OrderService } from './order.service';
import {
  CreateOrderDto,
  GetAllOrdersResponseDto,
  GetOrderByIdResponseDto,
  OrderResponseDto,
  UpdateOrderDto,
} from './model/order.dto';
import { JwtAuthGuard } from 'src/shared/auth/jwt-auth.guard';
import { RolesGuard } from 'src/shared/auth/roles.guard';
import { Roles } from 'src/shared/auth/roles.decorator';
import { PrismaService } from 'src/shared/prisma/prisma.service';

@Controller('orders')
@UseGuards(JwtAuthGuard)
export class OrderController {
  constructor(
    private readonly orderService: OrderService,
    private readonly prisma: PrismaService
  ) {}

  @Post()
  async createOrder(
    @Body() createOrderDto: CreateOrderDto,
    @Request() req
  ) {
    createOrderDto.userId = req.user.id;
    
    const order = await this.orderService.createOrder(createOrderDto);
    return { success: true, message: 'Order created successfully', data: order };
  }

  @Get()
  @UseGuards(RolesGuard)
  @Roles('STORE_ADMIN', 'DEVELOPER')
  async getAllOrders(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
    @Query('search') search?: string,
  ): Promise<GetAllOrdersResponseDto> {
    return this.orderService.getAllOrders(page, limit, search);
  }

  @Get('/user/:userId')
  @UseGuards(RolesGuard)
  @Roles('STORE_ADMIN', 'DEVELOPER')
  async getOrdersByUserId(
    @Param('userId') userId: string,
    @Query('page') page = 1,
    @Query('limit') limit = 10,
  ): Promise<GetAllOrdersResponseDto> {
    return this.orderService.getOrdersByUserId(userId, page, limit);
  }

  @Get('/telegram/:telegramId')
  @UseGuards(RolesGuard)
  @Roles('STORE_ADMIN', 'DEVELOPER')
  async getOrdersByTelegramId(
    @Param('telegramId') telegramId: string,
    @Query('page') page = 1,
    @Query('limit') limit = 10,
  ): Promise<GetAllOrdersResponseDto> {
    return this.orderService.getOrdersByTelegramId(telegramId, page, limit);
  }

  @Get('/my-orders')
  async getMyOrders(
    @Request() req,
    @Query('page') page = 1,
    @Query('limit') limit = 10,
  ): Promise<GetAllOrdersResponseDto> {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    return this.orderService.getOrdersByUserId(req.user.id, page, limit);
  }

  @Get(':id')
  async getOrderById(
    @Param('id') orderId: string,
    @Request() req
  ): Promise<GetOrderByIdResponseDto> {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      select: { userId: true }
    });
    
    if (!order) {
      throw new ForbiddenException('Order not found');
    }
    
    if (order.userId !== req.user.id && req.user.role !== 'STORE_ADMIN' && req.user.role !== 'DEVELOPER') {
      throw new ForbiddenException('You do not have permission to access this order');
    }
    
    return this.orderService.getOrderById(orderId);
  }

  @Put(':id')
  async updateOrder(
    @Param('id') orderId: string,
    @Body() updateOrderDto: UpdateOrderDto,
    @Request() req
  ): Promise<OrderResponseDto> {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      select: { userId: true }
    });
    
    if (!order) {
      throw new ForbiddenException('Order not found');
    }
    
    if (order.userId !== req.user.id && req.user.role !== 'STORE_ADMIN' && req.user.role !== 'DEVELOPER') {
      throw new ForbiddenException('You do not have permission to update this order');
    }
    
    return this.orderService.updateOrderById(orderId, updateOrderDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async deleteOrder(
    @Param('id') orderId: string,
    @Request() req
  ) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      select: { userId: true }
    });
    
    if (!order) {
      throw new ForbiddenException('Order not found');
    }
    
    if (order.userId !== req.user.id && req.user.role !== 'STORE_ADMIN' && req.user.role !== 'DEVELOPER') {
      throw new ForbiddenException('You do not have permission to delete this order');
    }
    
    return this.orderService.deleteOrderById(orderId);
  }
}