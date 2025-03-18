import {
  Injectable,
  ConflictException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from 'src/shared/prisma/prisma.service';
import {
  CreateStoreDto,
  StoreResponseDto,
  GetAllStoresResponseDto,
  UpdateStoreDto,
} from './model/store.dto';

@Injectable()
export class StoreService {
  constructor(private prisma: PrismaService) {}

  // Helper Methods
  private validatePagination(page: number, limit: number): void {
    if (page < 1 || limit < 1) {
      throw new BadRequestException('Page and limit must be positive integers');
    }
  }

  private async validateStoreExists(storeId: string): Promise<void> {
    const store = await this.prisma.store.findUnique({ where: { id: storeId } });
    if (!store) {
      throw new NotFoundException(`Store with ID ${storeId} not found`);
    }
  }

  private mapToStoreResponseDto(store: any): StoreResponseDto {
    return {
      id: store.id,
      name: store.name,
      ownerId: store.ownerId,
      createdAt: store.createdAt,
      updatedAt: store.updatedAt,
    };
  }

  // Create Methods
  async createStore(createStoreDto: CreateStoreDto): Promise<StoreResponseDto> {
    const { name, ownerId } = createStoreDto;

    if (!name || !ownerId) {
      throw new BadRequestException('Store name and owner ID are required');
    }

    const existingStore = await this.prisma.store.findUnique({
      where: { ownerId },
    });
    if (existingStore) {
      throw new ConflictException('User  already owns a store');
    }

    const store = await this.prisma.store.create({
      data: {
        name,
        ownerId,
      },
    });

    return this.mapToStoreResponseDto(store);
  }

  // Get Methods
  async getAllStores(page: number, limit: number): Promise<GetAllStoresResponseDto> {
    this.validatePagination(page, limit);

    const totalItems = await this.prisma.store.count();
    const stores = await this.prisma.store.findMany({
      skip: (page - 1) * limit,
      take: limit,
    });

    const storeResponseDtos: StoreResponseDto[] = stores.map((store) => this.mapToStoreResponseDto(store));

    const totalPages = Math.ceil(totalItems / limit);
    return new GetAllStoresResponseDto(
      true,
      'Stores fetched successfully',
      storeResponseDtos,
      {
        totalItems,
        totalPages,
        currentPage: page,
        perPage: limit,
      },
    );
  }

  async getStoreById(storeId: string): Promise<StoreResponseDto> {
    if (!storeId) {
      throw new BadRequestException('Store ID is required');
    }

    await this.validateStoreExists(storeId);

    const store = await this.prisma.store.findUnique({
      where: { id: storeId },
    });

    return this.mapToStoreResponseDto(store);
  }

  // Update Methods
  async updateStoreById(storeId: string, updateData: UpdateStoreDto): Promise<StoreResponseDto> {
    if (!storeId) {
      throw new BadRequestException('Store ID is required');
    }

    await this.validateStoreExists(storeId);

    const updatedStore = await this.prisma.store.update({
      where: { id: storeId },
      data: updateData,
    });

    return this.mapToStoreResponseDto(updatedStore);
  }

  // Delete Methods
  async deleteStoreById(storeId: string): Promise<{ success: boolean; message: string }> {
    if (!storeId) {
      throw new BadRequestException('Store ID is required');
    }

    await this.validateStoreExists(storeId);

    await this.prisma.store.delete({
      where: { id: storeId },
    });

    return { success: true, message: `Store with ID ${storeId} deleted successfully` };
  }
}