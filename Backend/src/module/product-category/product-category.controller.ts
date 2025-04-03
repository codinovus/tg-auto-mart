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
} from '@nestjs/common';
import { ProductCategoryService } from './product-category.service';
import {
  CreateProductCategoryDto,
  ProductCategoryResponseDto,
  GetAllProductCategoriesResponseDto,
  UpdateProductCategoryDto,
} from './model/product-category.dto';
import { JwtAuthGuard } from 'src/shared/auth/jwt-auth.guard';
import { RolesGuard } from 'src/shared/auth/roles.guard';
import { Roles } from 'src/shared/auth/roles.decorator';

@Controller('product-categories')
export class ProductCategoryController {
  constructor(
    private readonly productCategoryService: ProductCategoryService,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('STORE_ADMIN', 'DEVELOPER')
  async createCategory(
    @Body() createProductCategoryDto: CreateProductCategoryDto,
  ) {
    // Only STORE_ADMIN and DEVELOPER can create categories
    const category = await this.productCategoryService.createProductCategory(
      createProductCategoryDto,
    );
    return {
      success: true,
      message: 'Product category created successfully',
      data: category,
    };
  }

  @Get()
  async getAllCategories(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
    @Query('search') search?: string,
  ): Promise<GetAllProductCategoriesResponseDto> {
    // Categories are public information, no auth required
    return this.productCategoryService.getAllProductCategories(page, limit, search);
  }

  @Get(':id')
  async getCategoryById(
    @Param('id') categoryId: string,
  ): Promise<ProductCategoryResponseDto> {
    // Categories are public information, no auth required
    return this.productCategoryService.getProductCategoryById(categoryId);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('STORE_ADMIN', 'DEVELOPER')
  async updateCategory(
    @Param('id') categoryId: string,
    @Body() updateProductCategoryDto: UpdateProductCategoryDto,
  ): Promise<ProductCategoryResponseDto> {
    // Only STORE_ADMIN and DEVELOPER can update categories
    return this.productCategoryService.updateProductCategoryById(
      categoryId,
      updateProductCategoryDto,
    );
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('STORE_ADMIN', 'DEVELOPER')
  async deleteCategory(@Param('id') categoryId: string) {
    // Only STORE_ADMIN and DEVELOPER can delete categories
    return this.productCategoryService.deleteProductCategoryById(categoryId);
  }
}