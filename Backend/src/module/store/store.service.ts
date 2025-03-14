import {
  Injectable,
  ConflictException,
  NotFoundException,
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

  async createStore(createStoreDto: CreateStoreDto): Promise<StoreResponseDto> {
    const { name, ownerId } = createStoreDto;
    const existingStore = await this.prisma.store.findUnique({
      where: { ownerId },
    });
    if (existingStore) {
      throw new ConflictException('User already owns a store');
    }

    const store = await this.prisma.store.create({
      data: {
        name,
        ownerId,
      },
    });

    return {
      id: store.id,
      name: store.name,
      ownerId: store.ownerId,
      createdAt: store.createdAt,
      updatedAt: store.updatedAt,
    };
  }

  async getAllStores(
    page: number,
    limit: number,
    searchQuery?: string,
  ): Promise<GetAllStoresResponseDto> {
    const totalItems = await this.prisma.store.count({
      where: { name: { contains: searchQuery, mode: 'insensitive' } },
    });

    const stores = await this.prisma.store.findMany({
      where: { name: { contains: searchQuery, mode: 'insensitive' } },
      skip: (page - 1) * limit,
      take: limit,
    });

    const storeResponseDtos: StoreResponseDto[] = stores.map((store) => ({
      id: store.id,
      name: store.name,
      ownerId: store.ownerId,
      createdAt: store.createdAt,
      updatedAt: store.updatedAt,
    }));

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
    const store = await this.prisma.store.findUnique({
      where: { id: storeId },
    });

    if (!store) {
      throw new NotFoundException(`Store with ID ${storeId} not found`);
    }

    return store;
  }

  async updateStoreById(storeId: string, updateData: UpdateStoreDto): Promise<StoreResponseDto> {
    const store = await this.prisma.store.findUnique({
      where: { id: storeId },
    });

    if (!store) {
      throw new NotFoundException(`Store with ID ${storeId} not found`);
    }

    const updatedStore = await this.prisma.store.update({
      where: { id: storeId },
      data: updateData,
    });

    return updatedStore;
  }

  async deleteStoreById(storeId: string): Promise<{ success: boolean; message: string }> {
    const store = await this.prisma.store.findUnique({
      where: { id: storeId },
    });

    if (!store) {
      throw new NotFoundException(`Store with ID ${storeId} not found`);
    }

    await this.prisma.store.delete({
      where: { id: storeId },
    });

    return { success: true, message: `Store with ID ${storeId} deleted successfully` };
  }
}
