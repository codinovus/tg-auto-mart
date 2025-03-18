import {
  Injectable,
  ConflictException,
  NotFoundException,
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

  // Create Methods
  async createProduct(createProductDto: CreateProductDto): Promise<ProductResponseDto> {
    const { name, description, price, stock, storeId, categoryId, autoDeliver } = createProductDto;

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

  // Get Methods
  async getAllProducts(
    page: number,
    limit: number,
    categoryId?: string,
    storeId?: string,
  ): Promise<GetAllProductsResponseDto> {
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
      take: limit,
    });

    const productResponseDtos: ProductResponseDto[] = products.map((product) => ({
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
    }));

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
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      throw new NotFoundException(`Product with ID ${productId} not found`);
    }

    return product;
  }

  async getProductsByCategoryId(
    categoryId: string,
    page: number,
    limit: number,
  ): Promise<GetAllProductsResponseDto> {
    const totalItems = await this.prisma.product.count({
      where: { categoryId },
    });

    const products = await this.prisma.product.findMany({
      where: { categoryId },
      skip: (page - 1) * limit,
      take: limit,
    });

    const productResponseDtos: ProductResponseDto[] = products.map((product) => ({
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
    }));

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
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      throw new NotFoundException(`Product with ID ${productId} not found`);
    }

    const updatedProduct = await this.prisma.product.update({
      where: { id: productId },
      data: updateData,
    });

    return updatedProduct;
  }

  async updateProductStock(productId: string, change: number): Promise<ProductResponseDto> {
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

    return {
      id: updatedProduct.id,
      name: updatedProduct.name,
      description: updatedProduct.description,
      price: updatedProduct.price,
      stock: updatedProduct.stock,
      storeId: updatedProduct.storeId,
      categoryId: updatedProduct.categoryId,
      autoDeliver: updatedProduct.autoDeliver,
      createdAt: updatedProduct.createdAt,
      updatedAt: updatedProduct.updatedAt,
    };
  }

  // Delete Methods
  async deleteProductById(productId: string): Promise<{ success: boolean; message: string }> {
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      throw new NotFoundException(`Product with ID ${productId} not found`);
    }

    await this.prisma.product.delete({
      where: { id: productId },
    });

    return {
      success: true,
      message: `Product with ID ${productId} deleted successfully`,
    };
  }
}