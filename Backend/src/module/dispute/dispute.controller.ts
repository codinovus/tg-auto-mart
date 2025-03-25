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
  async createDispute(
    @Body() createDisputeDto: CreateDisputeDto,
  ): Promise<{ success: boolean; message: string; data: DisputeResponseDto }> {
    const dispute = await this.disputeService.createDispute(createDisputeDto);
    return {
      success: true,
      message: 'Dispute created successfully',
      data: dispute,
    };
  }

  @Get()
  async getAllDisputes(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
  ): Promise<GetAllDisputesResponseDto> {
    return this.disputeService.getAllDisputes(page, limit);
  }

  @Get(':id')
  async getDisputeById(
    @Param('id') disputeId: string,
  ): Promise<GetDisputeByIdResponseDto> {
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
  async deleteDispute(
    @Param('id') disputeId: string,
  ): Promise<{ success: boolean; message: string }> {
    return this.disputeService.deleteDisputeById(disputeId);
  }
}
