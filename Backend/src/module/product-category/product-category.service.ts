import {
    Injectable,
    ConflictException,
    NotFoundException,
  } from '@nestjs/common';
  import { PrismaService } from 'src/shared/prisma/prisma.service';
  import {
    CreateProductCategoryDto,
    ProductCategoryResponseDto,
    GetAllProductCategoriesResponseDto,
    UpdateProductCategoryDto,
  } from './model/product-category.dto';
  
  @Injectable()
  export class ProductCategoryService {
    constructor(private prisma: PrismaService) {}
  
    async createProductCategory(
      createCategoryDto: CreateProductCategoryDto,
    ): Promise<ProductCategoryResponseDto> {
      const { name } = createCategoryDto;
  
      // Check if category already exists
      const existingCategory = await this.prisma.productCategory.findUnique({
        where: { name },
      });
      if (existingCategory) {
        throw new ConflictException('Category with this name already exists');
      }
  
      const category = await this.prisma.productCategory.create({
        data: { name },
      });
  
      return {
        id: category.id,
        name: category.name,
        createdAt: category.createdAt,
        updatedAt: category.updatedAt,
      };
    }
  
    async getAllProductCategories(
      page: number,
      limit: number,
      searchQuery?: string,
    ): Promise<GetAllProductCategoriesResponseDto> {
      const totalItems = await this.prisma.productCategory.count({
        where: { name: { contains: searchQuery, mode: 'insensitive' } },
      });
    
      const categories = await this.prisma.productCategory.findMany({
        where: { name: { contains: searchQuery, mode: 'insensitive' } },
        skip: (page - 1) * limit,
        take: limit,
      });
      const categoryResponseDtos: ProductCategoryResponseDto[] = await Promise.all(
        categories.map(async (category) => {
          const productCount = await this.prisma.product.count({
            where: { categoryId: category.id },
          });
    
          return new ProductCategoryResponseDto(
            category.id,
            category.name,
            category.createdAt,
            category.updatedAt,
            productCount
          );
        }),
      );
    
      const totalPages = Math.ceil(totalItems / limit);
      return new GetAllProductCategoriesResponseDto(
        true,
        'Product categories fetched successfully',
        categoryResponseDtos,
        {
          totalItems,
          totalPages,
          currentPage: page,
          perPage: limit,
        },
      );
    }
  
    async getProductCategoryById(
      categoryId: string,
    ): Promise<ProductCategoryResponseDto> {
      const category = await this.prisma.productCategory.findUnique({
        where: { id: categoryId },
      });
  
      if (!category) {
        throw new NotFoundException(`Category with ID ${categoryId} not found`);
      }
  
      return category;
    }
  
    async updateProductCategoryById(
      categoryId: string,
      updateData: UpdateProductCategoryDto,
    ): Promise<ProductCategoryResponseDto> {
      const category = await this.prisma.productCategory.findUnique({
        where: { id: categoryId },
      });
  
      if (!category) {
        throw new NotFoundException(`Category with ID ${categoryId} not found`);
      }
  
      const updatedCategory = await this.prisma.productCategory.update({
        where: { id: categoryId },
        data: updateData,
      });
  
      return updatedCategory;
    }
  
    async deleteProductCategoryById(categoryId: string): Promise<{
      success: boolean;
      message: string;
    }> {
      const category = await this.prisma.productCategory.findUnique({
        where: { id: categoryId },
      });
  
      if (!category) {
        throw new NotFoundException(`Category with ID ${categoryId} not found`);
      }
  
      await this.prisma.productCategory.delete({
        where: { id: categoryId },
      });
  
      return {
        success: true,
        message: `Category with ID ${categoryId} deleted successfully`,
      };
    }
  }
  