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
  import { DisputeService } from './dispute.service';
  import {
    CreateDisputeDto,
    DisputeResponseDto,
    GetAllDisputesResponseDto,
    UpdateDisputeDto,
    GetDisputeByIdResponseDto,
  } from './model/dispute.dto';
  
  @Controller('disputes')
  export class DisputeController {
    constructor(private readonly disputeService: DisputeService) {}
  
    @Post()
    async createDispute(@Body() createDisputeDto: CreateDisputeDto): Promise<{ success: boolean; message: string; data: DisputeResponseDto }> {
      const dispute = await this.disputeService.createDispute(createDisputeDto);
      return { success: true, message: 'Dispute created successfully', data: dispute };
    }
  
    @Get()
    async getAllDisputes(
      @Query('page') page = 1,
      @Query('limit') limit = 10,
    ): Promise<GetAllDisputesResponseDto> {
      return this.disputeService.getAllDisputes(page, limit);
    }
  
    @Get(':id')
    async getDisputeById(@Param('id') disputeId: string): Promise<GetDisputeByIdResponseDto> {
      return this.disputeService.getDisputeById(disputeId);
    }
  
    @Put(':id')
    async updateDispute(
      @Param('id') disputeId: string,
      @Body() updateDisputeDto: UpdateDisputeDto,
    ): Promise<DisputeResponseDto> {
      return this.disputeService.updateDisputeById(disputeId, updateDisputeDto);
    }
  
    @Delete(':id')
    @HttpCode(HttpStatus.OK)
    async deleteDispute(@Param('id') disputeId: string): Promise<{ success: boolean; message: string }> {
      return this.disputeService.deleteDisputeById(disputeId);
    }
  }