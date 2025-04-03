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
  Request,
  ForbiddenException,
} from '@nestjs/common';
import { DisputeService } from './dispute.service';
import {
  CreateDisputeDto,
  DisputeResponseDto,
  GetAllDisputesResponseDto,
  UpdateDisputeDto,
  GetDisputeByIdResponseDto,
} from './model/dispute.dto';
import { JwtAuthGuard } from 'src/shared/auth/jwt-auth.guard';
import { RolesGuard } from 'src/shared/auth/roles.guard';
import { Roles } from 'src/shared/auth/roles.decorator';
import { PrismaService } from 'src/shared/prisma/prisma.service';

@Controller('disputes')
@UseGuards(JwtAuthGuard)
export class DisputeController {
  constructor(
    private readonly disputeService: DisputeService,
    private readonly prisma: PrismaService
  ) {}

  @Post()
  async createDispute(
    @Body() createDisputeDto: CreateDisputeDto,
    @Request() req
  ): Promise<{ success: boolean; message: string; data: DisputeResponseDto }> {
    createDisputeDto.userId = req.user.id;
    
    const dispute = await this.disputeService.createDispute(createDisputeDto);
    return {
      success: true,
      message: 'Dispute created successfully',
      data: dispute,
    };
  }

  @Get()
  @UseGuards(RolesGuard)
  @Roles('STORE_ADMIN', 'DEVELOPER')
  async getAllDisputes(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
    @Query('search') search?: string,
  ): Promise<GetAllDisputesResponseDto> {
    return this.disputeService.getAllDisputes(page, limit, search);
  }

  @Get(':id')
  async getDisputeById(
    @Param('id') disputeId: string,
    @Request() req
  ): Promise<GetDisputeByIdResponseDto> {
    // First check if user has permission to view this dispute
    const dispute = await this.prisma.dispute.findUnique({
      where: { id: disputeId },
      select: { userId: true }
    });
    
    if (!dispute) {
      throw new ForbiddenException('Dispute not found');
    }
    
    if (dispute.userId !== req.user.id && req.user.role !== 'STORE_ADMIN' && req.user.role !== 'DEVELOPER') {
      throw new ForbiddenException('You do not have permission to access this dispute');
    }
    
    // If permission check passes, get the full dispute data
    return this.disputeService.getDisputeById(disputeId);
  }

  @Put(':id')
  async updateDispute(
    @Param('id') disputeId: string,
    @Body() updateDisputeDto: UpdateDisputeDto,
    @Request() req
  ): Promise<DisputeResponseDto> {
    // First check if user has permission to update this dispute
    const dispute = await this.prisma.dispute.findUnique({
      where: { id: disputeId },
      select: { userId: true }
    });
    
    if (!dispute) {
      throw new ForbiddenException('Dispute not found');
    }
    
    if (dispute.userId !== req.user.id && req.user.role !== 'STORE_ADMIN' && req.user.role !== 'DEVELOPER') {
      throw new ForbiddenException('You do not have permission to update this dispute');
    }
    
    return this.disputeService.updateDisputeById(disputeId, updateDisputeDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async deleteDispute(
    @Param('id') disputeId: string,
    @Request() req
  ): Promise<{ success: boolean; message: string }> {
    const dispute = await this.prisma.dispute.findUnique({
      where: { id: disputeId },
      select: { userId: true }
    });
    
    if (!dispute) {
      throw new ForbiddenException('Dispute not found');
    }
    
    if (dispute.userId !== req.user.id && req.user.role !== 'STORE_ADMIN' && req.user.role !== 'DEVELOPER') {
      throw new ForbiddenException('You do not have permission to delete this dispute');
    }
    
    return this.disputeService.deleteDisputeById(disputeId);
  }
}