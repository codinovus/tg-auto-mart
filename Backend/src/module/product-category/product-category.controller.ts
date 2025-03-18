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
  import { ProductCategoryService } from './product-category.service';
  import { 
    CreateProductCategoryDto, 
    ProductCategoryResponseDto, 
    GetAllProductCategoriesResponseDto, 
    UpdateProductCategoryDto 
  } from './model/product-category.dto';
  
  @Controller('product-categories')
  export class ProductCategoryController {
    constructor(private readonly productCategoryService: ProductCategoryService) {}
  
    @Post()
    async createCategory(@Body() createProductCategoryDto: CreateProductCategoryDto) {
      const category = await this.productCategoryService.createProductCategory(createProductCategoryDto);
      return { success: true, message: 'Product category created successfully', data: category };
    }
  
    @Get()
    async getAllCategories(
      @Query('page') page = 1,
      @Query('limit') limit = 10,
    ): Promise<GetAllProductCategoriesResponseDto> {
      return this.productCategoryService.getAllProductCategories(page, limit);
    }
  
    @Get(':id')
    async getCategoryById(@Param('id') categoryId: string): Promise<ProductCategoryResponseDto> {
      return this.productCategoryService.getProductCategoryById(categoryId);
    }
  
    @Put(':id')
    async updateCategory(
      @Param('id') categoryId: string,
      @Body() updateProductCategoryDto: UpdateProductCategoryDto,
    ): Promise<ProductCategoryResponseDto> {
      return this.productCategoryService.updateProductCategoryById(categoryId, updateProductCategoryDto);
    }
  
    @Delete(':id')
    @HttpCode(HttpStatus.OK)
    async deleteCategory(@Param('id') categoryId: string) {
      return this.productCategoryService.deleteProductCategoryById(categoryId);
    }
  }
  