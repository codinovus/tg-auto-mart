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
    @Query('page') page = 1,
    @Query('limit') limit = 10,
  ): Promise<GetAllProductKeysResponseDto> {
    return this.productKeyService.getAllProductKeys(page, limit);
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
