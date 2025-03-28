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
  import { OrderService } from './order.service';
  import {
    CreateOrderDto,
    GetAllOrdersResponseDto,
    GetOrderByIdResponseDto,
    OrderResponseDto,
    UpdateOrderDto,
  } from './model/order.dto';
  
  @Controller('orders')
  export class OrderController {
    constructor(private readonly orderService: OrderService) {}
  
    @Post()
    async createOrder(@Body() createOrderDto: CreateOrderDto) {
      const order = await this.orderService.createOrder(createOrderDto);
      return { success: true, message: 'Order created successfully', data: order };
    }
  
    @Get()
    async getAllOrders(
      @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
      @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
      @Query('search') search?: string,
    ): Promise<GetAllOrdersResponseDto> {
      return this.orderService.getAllOrders(page, limit, search);
    }
  
    @Get('/user/:userId')
    async getOrdersByUserId(
      @Param('userId') userId: string,
      @Query('page') page = 1,
      @Query('limit') limit = 10,
    ): Promise<GetAllOrdersResponseDto> {
      return this.orderService.getOrdersByUserId(userId, page, limit);
    }
  
    @Get('/telegram/:telegramId')
    async getOrdersByTelegramId(
      @Param('telegramId') telegramId: string,
      @Query('page') page = 1,
      @Query('limit') limit = 10,
    ): Promise<GetAllOrdersResponseDto> {
      return this.orderService.getOrdersByTelegramId(telegramId, page, limit);
    }
  
    @Get(':id')
    async getOrderById(@Param('id') orderId: string): Promise<GetOrderByIdResponseDto> {
      return this.orderService.getOrderById(orderId);
    }
  
    @Put(':id')
    async updateOrder(
      @Param('id') orderId: string,
      @Body() updateOrderDto: UpdateOrderDto,
    ): Promise<OrderResponseDto> {
      return this.orderService.updateOrderById(orderId, updateOrderDto);
    }
  
    @Delete(':id')
    @HttpCode(HttpStatus.OK)
    async deleteOrder(@Param('id') orderId: string) {
      return this.orderService.deleteOrderById(orderId);
    }
  }
  