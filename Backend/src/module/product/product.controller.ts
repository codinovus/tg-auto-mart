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
  Query 
} from '@nestjs/common';
import { ProductService } from './product.service';
import { 
  CreateProductDto, 
  ProductResponseDto, 
  GetAllProductsResponseDto, 
  UpdateProductDto 
} from './model/product.dto';

@Controller('products')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Post()
  async createProduct(@Body() createProductDto: CreateProductDto) {
    const product = await this.productService.createProduct(createProductDto);
    return { success: true, message: 'Product created successfully', data: product };
  }

  @Get()
  async getAllProducts(
    @Query('page') page = 1,
    @Query('limit') limit = 10,
    @Query('categoryId') categoryId?: string,
    @Query('storeId') storeId?: string,
  ): Promise<GetAllProductsResponseDto> {
    return this.productService.getAllProducts(page, limit, categoryId, storeId);
  }

  @Get(':id')
  async getProductById(@Param('id') productId: string): Promise<ProductResponseDto> {
    return this.productService.getProductById(productId);
  }

  @Put(':id')
  async updateProduct(
    @Param('id') productId: string,
    @Body() updateProductDto: UpdateProductDto,
  ): Promise<ProductResponseDto> {
    return this.productService.updateProductById(productId, updateProductDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async deleteProduct(@Param('id') productId: string) {
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