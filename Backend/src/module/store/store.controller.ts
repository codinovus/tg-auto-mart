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
  UseGuards
} from '@nestjs/common';
import { StoreService } from './store.service';
import {
  CreateStoreDto,
  GetAllStoresResponseDto,
  StoreResponseDto,
  UpdateStoreDto,
} from './model/store.dto';
import { JwtAuthGuard } from 'src/shared/auth/jwt-auth.guard';
import { RolesGuard } from 'src/shared/auth/roles.guard';
import { Roles } from 'src/shared/auth/roles.decorator';

@Controller('stores')
@UseGuards(JwtAuthGuard) // Protect all routes with JWT authentication
export class StoreController {
  constructor(private readonly storeService: StoreService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles('STORE_ADMIN', 'DEVELOPER') // Only allow STORE_ADMIN and DEVELOPER to create stores
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
    @Query('search') search?: string,
  ): Promise<GetAllStoresResponseDto> {
    return this.storeService.getAllStores(page, limit, search);
  }

  @Get(':id')
  async getStoreById(@Param('id') storeId: string): Promise<StoreResponseDto> {
    return this.storeService.getStoreById(storeId);
  }

  @Put(':id')
  @UseGuards(RolesGuard)
  @Roles('STORE_ADMIN', 'DEVELOPER') // Only allow STORE_ADMIN and DEVELOPER to update stores
  async updateStore(
    @Param('id') storeId: string,
    @Body() updateStoreDto: UpdateStoreDto,
  ): Promise<StoreResponseDto> {
    return this.storeService.updateStoreById(storeId, updateStoreDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @UseGuards(RolesGuard)
  @Roles('STORE_ADMIN', 'DEVELOPER') // Only allow STORE_ADMIN and DEVELOPER to delete stores
  async deleteStore(@Param('id') storeId: string) {
    return this.storeService.deleteStoreById(storeId);
  }
}