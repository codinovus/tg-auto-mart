import {
    Body,
    Controller,
    Delete,
    Get,
    HttpCode,
    HttpStatus,
    Param,
    Post,
    Put,
    Query,
  } from '@nestjs/common';
  import { PromoCodeService } from './promo-code.service';
  import {
    CreatePromoCodeDto,
    PromoCodeResponseDto,
    GetAllPromoCodesResponseDto,
    UpdatePromoCodeDto,
    GetPromoCodeByIdResponseDto,
  } from './model/promo-code.dto';
  
  @Controller('promo-codes')
  export class PromoCodeController {
    constructor(private readonly promoCodeService: PromoCodeService) {}
  
    @Post()
    async createPromoCode(@Body() createPromoCodeDto: CreatePromoCodeDto): Promise<{ success: boolean; message: string; data: PromoCodeResponseDto }> {
      const promoCode = await this.promoCodeService.createPromoCode(createPromoCodeDto);
      return { success: true, message: 'Promo code created successfully', data: promoCode };
    }
  
    @Get()
    async getAllPromoCodes(
      @Query('page') page = 1,
      @Query('limit') limit = 10,
    ): Promise<GetAllPromoCodesResponseDto> {
      return this.promoCodeService.getAllPromoCodes(page, limit);
    }
  
    @Get(':id')
    async getPromoCodeById(@Param('id') promoCodeId: string): Promise<GetPromoCodeByIdResponseDto> {
      return this.promoCodeService.getPromoCodeById(promoCodeId);
    }
  
    @Put(':id')
    async updatePromoCode(
      @Param('id') promoCodeId: string,
      @Body() updatePromoCodeDto: UpdatePromoCodeDto,
    ): Promise<PromoCodeResponseDto> {
      return this.promoCodeService.updatePromoCodeById(promoCodeId, updatePromoCodeDto);
    }
  
    @Delete(':id')
    @HttpCode(HttpStatus.OK)
    async deletePromoCode(@Param('id') promoCodeId: string): Promise<{ success: boolean; message: string }> {
      return this.promoCodeService.deletePromoCodeById(promoCodeId);
    }
  }