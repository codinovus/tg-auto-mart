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
import { ProductKeyService } from './product-key.service';
import {
  CreateProductKeyDto,
  GetAllProductKeysResponseDto,
  ProductKeyResponseDto,
  UpdateProductKeyDto,
} from './model/product-key.dto';

@Controller('product-keys')
export class ProductKeyController {
  constructor(private readonly productKeyService: ProductKeyService) {}

  @Post()
  async createProductKey(@Body() createProductKeyDto: CreateProductKeyDto) {
    const productKey =
      await this.productKeyService.createProductKey(createProductKeyDto);
    return {
      success: true,
      message: 'Product key created successfully',
      data: productKey,
    };
  }

  @Get()
  async getAllProductKeys(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
    @Query('search') search?: string,
  ): Promise<GetAllProductKeysResponseDto> {
    return this.productKeyService.getAllProductKeys(page, limit, search);
  }

  @Get(':id')
  async getProductKeyById(
    @Param('id') productKeyId: string,
  ): Promise<ProductKeyResponseDto> {
    return this.productKeyService.getProductKeyById(productKeyId);
  }

  @Put(':id')
  async updateProductKey(
    @Param('id') productKeyId: string,
    @Body() updateProductKeyDto: UpdateProductKeyDto,
  ): Promise<ProductKeyResponseDto> {
    return this.productKeyService.updateProductKeyById(
      productKeyId,
      updateProductKeyDto,
    );
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async deleteProductKey(@Param('id') productKeyId: string) {
    return this.productKeyService.deleteProductKeyById(productKeyId);
  }
}
