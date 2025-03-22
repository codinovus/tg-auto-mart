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
} from '@nestjs/common';
import { StoreService } from './store.service';
import {
  CreateStoreDto,
  StoreResponseDto,
  UpdateStoreDto,
} from './model/store.dto';

@Controller('stores')
export class StoreController {
  constructor(private readonly storeService: StoreService) {}

  @Post()
  async createStore(@Body() createStoreDto: CreateStoreDto) {
    const store = await this.storeService.createStore(createStoreDto);
    return {
      success: true,
      message: 'Store created successfully',
      data: store,
    };
  }

  @Get()
  async getAllStores(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
  ) {
    return this.storeService.getAllStores(page, limit);
  }

  @Get(':id')
  async getStoreById(@Param('id') storeId: string): Promise<StoreResponseDto> {
    return this.storeService.getStoreById(storeId);
  }

  @Put(':id')
  async updateStore(
    @Param('id') storeId: string,
    @Body() updateStoreDto: UpdateStoreDto,
  ): Promise<StoreResponseDto> {
    return this.storeService.updateStoreById(storeId, updateStoreDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async deleteStore(@Param('id') storeId: string) {
    return this.storeService.deleteStoreById(storeId);
  }
}
