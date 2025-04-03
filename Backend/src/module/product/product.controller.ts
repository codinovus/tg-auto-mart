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
  ForbiddenException
} from '@nestjs/common';
import { ProductService } from './product.service';
import { 
  CreateProductDto, 
  ProductResponseDto, 
  GetAllProductsResponseDto, 
  UpdateProductDto 
} from './model/product.dto';
import { JwtAuthGuard } from 'src/shared/auth/jwt-auth.guard';
import { RolesGuard } from 'src/shared/auth/roles.guard';
import { Roles } from 'src/shared/auth/roles.decorator';
import { PrismaService } from 'src/shared/prisma/prisma.service';

@Controller('products')
export class ProductController {
  constructor(
    private readonly productService: ProductService,
    private readonly prisma: PrismaService
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('STORE_ADMIN', 'DEVELOPER')
  async createProduct(
    @Body() createProductDto: CreateProductDto,
    @Request() req
  ) {
    // Verify the user owns the store they're adding the product to
    const store = await this.prisma.store.findUnique({
      where: { id: createProductDto.storeId },
      select: { ownerId: true }
    });

    if (!store) {
      throw new ForbiddenException('Store not found');
    }

    if (store.ownerId !== req.user.id && req.user.role !== 'DEVELOPER') {
      throw new ForbiddenException('You can only add products to your own store');
    }

    const product = await this.productService.createProduct(createProductDto);
    return { success: true, message: 'Product created successfully', data: product };
  }
  
  @Get()
  async getAllProducts(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
    @Query('categoryId') categoryId?: string,
    @Query('storeId') storeId?: string,
    @Query('search') search?: string,
  ): Promise<GetAllProductsResponseDto> {
    return this.productService.getAllProducts(page, limit, categoryId, storeId, search);
  }

  @Get(':id')
  async getProductById(@Param('id') productId: string): Promise<ProductResponseDto> {
    return this.productService.getProductById(productId);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('STORE_ADMIN', 'DEVELOPER')
  async updateProduct(
    @Param('id') productId: string,
    @Body() updateProductDto: UpdateProductDto,
    @Request() req
  ): Promise<ProductResponseDto> {
    // Check if user owns the store that this product belongs to
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
      include: { store: { select: { ownerId: true } } }
    });

    if (!product) {
      throw new ForbiddenException('Product not found');
    }

    if (product.store.ownerId !== req.user.id && req.user.role !== 'DEVELOPER') {
      throw new ForbiddenException('You can only update products in your own store');
    }

    return this.productService.updateProductById(productId, updateProductDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('STORE_ADMIN', 'DEVELOPER')
  async deleteProduct(@Param('id') productId: string, @Request() req) {
    // Verify the user owns the store that the product belongs to
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
      include: { store: { select: { ownerId: true } } }
    });

    if (!product) {
      throw new ForbiddenException('Product not found');
    }

    if (product.store.ownerId !== req.user.id && req.user.role !== 'DEVELOPER') {
      throw new ForbiddenException('You can only delete products in your own store');
    }

    return this.productService.deleteProductById(productId);
  }

  @Get('category/:categoryId')
  async getProductsByCategoryId(
    @Param('categoryId') categoryId: string,
    @Query('page') page = 1,
    @Query('limit') limit = 10
  ): Promise<GetAllProductsResponseDto> {
    return this.productService.getProductsByCategoryId(categoryId, Number(page), Number(limit));
  }
}