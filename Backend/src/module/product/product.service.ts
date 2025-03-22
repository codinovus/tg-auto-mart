import {
  Injectable,
  ConflictException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from 'src/shared/prisma/prisma.service';
import {
  CreateProductDto,
  UpdateProductDto,
  ProductResponseDto,
  GetAllProductsResponseDto,
} from './model/product.dto';

@Injectable()
export class ProductService {
  constructor(private prisma: PrismaService) {}

  // Helper Methods
  private validatePagination(page: number, limit: number): void {
    if (page < 1 || limit < 1) {
      throw new BadRequestException('Page and limit must be positive integers');
    }
  }

  private async validateProductExists(productId: string): Promise<void> {
    const product = await this.prisma.product.findUnique({ where: { id: productId } });
    if (!product) {
      throw new NotFoundException(`Product with ID ${productId} not found`);
    }
  }

  private mapToProductResponseDto(product: any): ProductResponseDto {
    return {
      id: product.id,
      name: product.name,
      description: product.description,
      price: product.price,
      stock: product.stock,
      storeId: product.storeId,
      categoryId: product.categoryId,
      autoDeliver: product.autoDeliver,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
    };
  }

  // Create Methods
  async createProduct(createProductDto: CreateProductDto): Promise<ProductResponseDto> {
    const { name, description, price, stock, storeId, categoryId, autoDeliver } = createProductDto;

    if (!name || !storeId || price < 0 || stock < 0) {
      throw new BadRequestException('Name, storeId, price (>= 0), and stock (>= 0) are required');
    }

    const existingProduct = await this.prisma.product.findFirst({
      where: { name, storeId },
    });

    if (existingProduct) {
      throw new ConflictException('Product with this name already exists in the store');
    }

    const product = await this.prisma.product.create({
      data: {
        name,
        description,
        price,
        stock,
        storeId,
        categoryId,
        autoDeliver: autoDeliver ?? false,
      },
    });

    return this.mapToProductResponseDto(product);
  }

  // Get Methods
  async getAllProducts(
    page: number,
    limit: number,
    categoryId?: string,
    storeId?: string,
  ): Promise<GetAllProductsResponseDto> {
    this.validatePagination(page, limit);
  
    const filters: any = {};
    if (categoryId) {
      filters.categoryId = categoryId;
    }
    if (storeId) {
      filters.storeId = storeId;
    }
  
    const totalItems = await this.prisma.product.count({ where: filters });
  
    const products = await this.prisma.product.findMany({
      where: filters,
      skip: (page - 1) * limit,
      take: limit, // Ensure limit is a number
    });
  
    const productResponseDtos: ProductResponseDto[] = products.map((product) => this.mapToProductResponseDto(product));
  
    const totalPages = Math.ceil(totalItems / limit);
  
    return new GetAllProductsResponseDto(
      true,
      'Products fetched successfully',
      productResponseDtos,
      {
        totalItems,
        totalPages,
        currentPage: page,
        perPage: limit,
      },
    );
  }

  async getProductById(productId: string): Promise<ProductResponseDto> {
    if (!productId) {
      throw new BadRequestException('Product ID is required');
    }

    await this.validateProductExists(productId);

    const product = await this.prisma.product.findUnique({
      where: { id: productId },
    });

    return this.mapToProductResponseDto(product);
  }

  async getProductsByCategoryId(
    categoryId: string,
    page: number,
    limit: number,
  ): Promise<GetAllProductsResponseDto> {
    this.validatePagination(page, limit);

    const totalItems = await this.prisma.product.count({
      where: { categoryId },
    });

    const products = await this.prisma.product.findMany({
      where: { categoryId },
      skip: (page - 1) * limit,
      take: limit,
    });

    const productResponseDtos: ProductResponseDto[] = products.map((product) => this.mapToProductResponseDto(product));

    const totalPages = Math.ceil(totalItems / limit);

    return new GetAllProductsResponseDto(
      true,
      `Products under category ${categoryId} fetched successfully`,
      productResponseDtos,
      {
        totalItems,
        totalPages,
        currentPage: page,
        perPage: limit,
      },
    );
  }

  // Update Methods
  async updateProductById(
    productId: string,
    updateData: UpdateProductDto,
  ): Promise<ProductResponseDto> {
    if (!productId) {
      throw new BadRequestException('Product ID is required');
    }

    await this.validateProductExists(productId);

    const updatedProduct = await this.prisma.product.update({
      where: { id: productId },
      data: updateData,
    });

    return this.mapToProductResponseDto(updatedProduct);
  }

  async updateProductStock(productId: string, change: number): Promise<ProductResponseDto> {
    if (!productId) {
      throw new BadRequestException('Product ID is required');
    }
  
    await this.validateProductExists(productId);
  
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
    });
  
    if (!product) {
      throw new NotFoundException(`Product with ID ${productId} not found`);
    }
  
    const newStock = Math.max(0, product.stock + change);
  
    const updatedProduct = await this.prisma.product.update({
      where: { id: productId },
      data: { stock: newStock },
    });
  
    return this.mapToProductResponseDto(updatedProduct);
  }

  // Delete Methods
  async deleteProductById(productId: string): Promise<{ success: boolean; message: string }> {
    if (!productId) {
      throw new BadRequestException('Product ID is required');
    }

    await this.validateProductExists(productId);

    await this.prisma.product.delete({
      where: { id: productId },
    });

    return {
      success: true,
      message: `Product with ID ${productId} deleted successfully`,
    };
  }
}