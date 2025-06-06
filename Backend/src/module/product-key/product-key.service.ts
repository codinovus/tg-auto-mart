import {
  Injectable,
  ConflictException,
  NotFoundException,
  BadRequestException,
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

  // Helper Methods
  private validatePagination(page: number, limit: number): void {
    if (page < 1 || limit < 1) {
      throw new BadRequestException('Page and limit must be positive integers');
    }
  }

  private async validateProductKeyExists(productKeyId: string): Promise<void> {
    const productKey = await this.prisma.productKey.findUnique({ where: { id: productKeyId } });
    if (!productKey) {
      throw new NotFoundException(`Product key with ID ${productKeyId} not found`);
    }
  }

  private mapToProductKeyResponseDto(productKey: any): ProductKeyResponseDto {
    return {
      id: productKey.id,
      key: productKey.key,
      productId: productKey.productId,
      isSold: productKey.isSold,
      createdAt: productKey.createdAt,
      updatedAt: productKey.updatedAt,
    };
  }

  // Create Methods
  async createProductKey(
    createProductKeyDto: CreateProductKeyDto,
  ): Promise<ProductKeyResponseDto> {
    const { key, productId } = createProductKeyDto;

    if (!key || !productId) {
      throw new BadRequestException('Key and Product ID are required');
    }

    const existingKey = await this.prisma.productKey.findUnique({
      where: { key },
    });
    if (existingKey) {
      throw new ConflictException('Product key already exists');
    }

    const productKey = await this.prisma.productKey.create({
      data: { key, productId },
    });

    return this.mapToProductKeyResponseDto(productKey);
  }

  // Get Methods
  async getAllProductKeys(
    page: number,
    limit: number,
    search?: string,
  ): Promise<GetAllProductKeysResponseDto> {
    this.validatePagination(page, limit);
  
    let whereClause = {};
  
    if (search) {
      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(search);
      const isBool = ['true', 'false'].includes(search.toLowerCase());
      
      whereClause = {
        OR: [
          ...(isUuid ? [{ id: search }] : []),
          ...(isUuid ? [{ productId: search }] : []),
          {
            key: {
              contains: search,
              mode: 'insensitive'
            }
          },
          {
            product: {
              name: {
                contains: search,
                mode: 'insensitive'
              }
            }
          },
          ...(isBool ? [{ isSold: search.toLowerCase() === 'true' }] : [])
        ]
      };
    }
  
    const totalItems = await this.prisma.productKey.count({
      where: whereClause
    });
  
    const keys = await this.prisma.productKey.findMany({
      where: whereClause,
      skip: (page - 1) * limit,
      take: limit,
      include: {
        product: true
      },
      orderBy: {
        updatedAt: 'desc',
      },
    });
  
    const productKeyResponseDtos: ProductKeyResponseDto[] = keys.map((key) =>
      this.mapToProductKeyResponseDto(key),
    );
  
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
    if (!productKeyId) {
      throw new BadRequestException('Product key ID is required');
    }

    await this.validateProductKeyExists(productKeyId);

    const productKey = await this.prisma.productKey.findUnique({
      where: { id: productKeyId },
    });

    return this.mapToProductKeyResponseDto(productKey);
  }

  // Update Methods
  async updateProductKeyById(
    productKeyId: string,
    updateData: UpdateProductKeyDto,
  ): Promise<ProductKeyResponseDto> {
    if (!productKeyId) {
      throw new BadRequestException('Product key ID is required');
    }

    await this.validateProductKeyExists(productKeyId);

    const updatedProductKey = await this.prisma.productKey.update({
      where: { id: productKeyId },
      data: updateData,
    });

    return this.mapToProductKeyResponseDto(updatedProductKey);
  }

  // Delete Methods
  async deleteProductKeyById(productKeyId: string): Promise<{
    success: boolean;
    message: string;
  }> {
    if (!productKeyId) {
      throw new BadRequestException('Product key ID is required');
    }

    await this.validateProductKeyExists(productKeyId);

    await this.prisma.productKey.delete({
      where: { id: productKeyId },
    });

    return {
      success: true,
      message: `Product key with ID ${productKeyId} deleted successfully`,
    };
  }

  async getAvailableProductKeyByProductId(productId: string): Promise<ProductKeyResponseDto | null> {
    if (!productId) {
      throw new BadRequestException('Product ID is required');
    }
  
    const productKey = await this.prisma.productKey.findFirst({
      where: {
        productId: productId,
        isSold: false,
      },
    });
  
    return productKey ? this.mapToProductKeyResponseDto(productKey) : null;
  }
  
}