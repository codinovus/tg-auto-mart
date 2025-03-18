import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/shared/prisma/prisma.service';
import {
  CreateProductKeyDto,
  ProductKeyResponseDto,
  GetAllProductKeysResponseDto,
  UpdateProductKeyDto,
} from './model/product-key.dto';

@Injectable()
export class ProductKeyService {
  constructor(private prisma: PrismaService) {}

  // Create Methods
  async createProductKey(
    createProductKeyDto: CreateProductKeyDto,
  ): Promise<ProductKeyResponseDto> {
    const { key, productId } = createProductKeyDto;

    const existingKey = await this.prisma.productKey.findUnique({
      where: { key },
    });
    if (existingKey) {
      throw new ConflictException('Product key already exists');
    }

    const productKey = await this.prisma.productKey.create({
      data: { key, productId },
    });

    return {
      id: productKey.id,
      key: productKey.key,
      productId: productKey.productId,
      isSold: productKey.isSold,
      createdAt: productKey.createdAt,
      updatedAt: productKey.updatedAt,
    };
  }

  // Get Methods
  async getAllProductKeys(
    page: number,
    limit: number,
  ): Promise<GetAllProductKeysResponseDto> {
    const totalItems = await this.prisma.productKey.count();

    const keys = await this.prisma.productKey.findMany({
      skip: (page - 1) * limit,
      take: limit,
    });

    const productKeyResponseDtos: ProductKeyResponseDto[] = keys.map((key) => ({
      id: key.id,
      key: key.key,
      productId: key.productId,
      isSold: key.isSold,
      createdAt: key.createdAt,
      updatedAt: key.updatedAt,
    }));

    const totalPages = Math.ceil(totalItems / limit);
    return new GetAllProductKeysResponseDto(
      true,
      'Product keys fetched successfully',
      productKeyResponseDtos,
      {
        totalItems,
        totalPages,
        currentPage: page,
        perPage: limit,
      },
    );
  }

  async getProductKeyById(
    productKeyId: string,
  ): Promise<ProductKeyResponseDto> {
    const productKey = await this.prisma.productKey.findUnique({
      where: { id: productKeyId },
    });

    if (!productKey) {
      throw new NotFoundException(`Product key with ID ${productKeyId} not found`);
    }

    return productKey;
  }

  // Update Methods
  async updateProductKeyById(
    productKeyId: string,
    updateData: UpdateProductKeyDto,
  ): Promise<ProductKeyResponseDto> {
    const productKey = await this.prisma.productKey.findUnique({
      where: { id: productKeyId },
    });

    if (!productKey) {
      throw new NotFoundException(`Product key with ID ${productKeyId} not found`);
    }

    const updatedProductKey = await this.prisma.productKey.update({
      where: { id: productKeyId },
      data: updateData,
    });

    return updatedProductKey;
  }

  // Delete Methods
  async deleteProductKeyById(productKeyId: string): Promise<{
    success: boolean;
    message: string;
  }> {
    const productKey = await this.prisma.productKey.findUnique({
      where: { id: productKeyId },
    });

    if (!productKey) {
      throw new NotFoundException(`Product key with ID ${productKeyId} not found`);
    }

    await this.prisma.productKey.delete({
      where: { id: productKeyId },
    });

    return {
      success: true,
      message: `Product key with ID ${productKeyId} deleted successfully`,
    };
  }
}