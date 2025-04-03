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
  UseGuards,
} from '@nestjs/common';
import { PromoCodeService } from './promo-code.service';
import {
  CreatePromoCodeDto,
  PromoCodeResponseDto,
  GetAllPromoCodesResponseDto,
  UpdatePromoCodeDto,
  GetPromoCodeByIdResponseDto,
} from './model/promo-code.dto';
import { JwtAuthGuard } from 'src/shared/auth/jwt-auth.guard';
import { RolesGuard } from 'src/shared/auth/roles.guard';
import { Roles } from 'src/shared/auth/roles.decorator';

@Controller('promo-codes')
@UseGuards(JwtAuthGuard) // Protect all routes with JWT authentication
export class PromoCodeController {
  constructor(private readonly promoCodeService: PromoCodeService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles('STORE_ADMIN', 'DEVELOPER') // Only allow STORE_ADMIN and DEVELOPER to create promo codes
  async createPromoCode(
    @Body() createPromoCodeDto: CreatePromoCodeDto,
  ): Promise<{
    success: boolean;
    message: string;
    data: PromoCodeResponseDto;
  }> {
    const promoCode =
      await this.promoCodeService.createPromoCode(createPromoCodeDto);
    return {
      success: true,
      message: 'Promo code created successfully',
      data: promoCode,
    };
  }

  @Get()
  async getAllPromoCodes(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
    @Query('search') search?: string,
  ): Promise<GetAllPromoCodesResponseDto> {
    return this.promoCodeService.getAllPromoCodes(page, limit, search);
  }

  @Get(':id')
  async getPromoCodeById(
    @Param('id') promoCodeId: string,
  ): Promise<GetPromoCodeByIdResponseDto> {
    return this.promoCodeService.getPromoCodeById(promoCodeId);
  }

  @Put(':id')
  @UseGuards(RolesGuard)
  @Roles('STORE_ADMIN', 'DEVELOPER') // Only allow STORE_ADMIN and DEVELOPER to update promo codes
  async updatePromoCode(
    @Param('id') promoCodeId: string,
    @Body() updatePromoCodeDto: UpdatePromoCodeDto,
  ): Promise<PromoCodeResponseDto> {
    return this.promoCodeService.updatePromoCodeById(
      promoCodeId,
      updatePromoCodeDto,
    );
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @UseGuards(RolesGuard)
  @Roles('STORE_ADMIN', 'DEVELOPER') // Only allow STORE_ADMIN and DEVELOPER to delete promo codes
  async deletePromoCode(
    @Param('id') promoCodeId: string,
  ): Promise<{ success: boolean; message: string }> {
    return this.promoCodeService.deletePromoCodeById(promoCodeId);
  }
}