import {
  Injectable,
  ConflictException,
  NotFoundException,
  BadRequestException,
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

  // Helper Methods
  private validatePagination(page: number, limit: number): void {
    if (page < 1 || limit < 1) {
      throw new BadRequestException('Page and limit must be positive integers');
    }
  }

  private async validateCategoryExists(categoryId: string): Promise<void> {
    const category = await this.prisma.productCategory.findUnique({
      where: { id: categoryId },
    });
    if (!category) {
      throw new NotFoundException(`Category with ID ${categoryId} not found`);
    }
  }

  private mapToProductCategoryResponseDto(
    category: any,
  ): ProductCategoryResponseDto {
    return {
      id: category.id,
      name: category.name,
      createdAt: category.createdAt,
      updatedAt: category.updatedAt,
    };
  }

  // Create Methods
  async createProductCategory(
    createCategoryDto: CreateProductCategoryDto,
  ): Promise<ProductCategoryResponseDto> {
    const { name } = createCategoryDto;

    if (!name) {
      throw new BadRequestException('Category name is required');
    }

    const existingCategory = await this.prisma.productCategory.findUnique({
      where: { name },
    });
    if (existingCategory) {
      throw new ConflictException('Category with this name already exists');
    }

    const category = await this.prisma.productCategory.create({
      data: { name },
    });

    return this.mapToProductCategoryResponseDto(category);
  }

  // Get Methods
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
    if (!categoryId) {
      throw new BadRequestException('Category ID is required');
    }

    await this.validateCategoryExists(categoryId);

    const category = await this.prisma.productCategory.findUnique({
      where: { id: categoryId },
    });

    return this.mapToProductCategoryResponseDto(category);
  }

  // Update Methods
  async updateProductCategoryById(
    categoryId: string,
    updateData: UpdateProductCategoryDto,
  ): Promise<ProductCategoryResponseDto> {
    if (!categoryId) {
      throw new BadRequestException('Category ID is required');
    }

    await this.validateCategoryExists(categoryId);

    const updatedCategory = await this.prisma.productCategory.update({
      where: { id: categoryId },
      data: updateData,
    });

    return this.mapToProductCategoryResponseDto(updatedCategory);
  }

  // Delete Methods
  async deleteProductCategoryById(categoryId: string): Promise<{
    success: boolean;
    message: string;
  }> {
    if (!categoryId) {
      throw new BadRequestException('Category ID is required');
    }

    await this.validateCategoryExists(categoryId);

    await this.prisma.productCategory.delete({
      where: { id: categoryId },
    });

    return {
      success: true,
      message: `Category with ID ${categoryId} deleted successfully`,
    };
  }
}
