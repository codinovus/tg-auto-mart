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
import { DepositRequestService } from './deposit-request.service';
import {
  CreateDepositRequestDto,
  DepositRequestResponseDto,
  GetAllDepositRequestsResponseDto,
  UpdateDepositRequestDto,
} from './model/deposit-request.dto';
import { JwtAuthGuard } from 'src/shared/auth/jwt-auth.guard';
import { RolesGuard } from 'src/shared/auth/roles.guard';
import { Roles } from 'src/shared/auth/roles.decorator';

@Controller('deposit-requests')
@UseGuards(JwtAuthGuard)
export class DepositRequestController {
  constructor(private readonly depositRequestService: DepositRequestService) {}

  @Post()
  async createDepositRequest(
    @Body() createDto: CreateDepositRequestDto,
    @Request() req
  ) {
    createDto.userId = req.user.id;
    
    const depositRequest = await this.depositRequestService.createDepositRequest(createDto);
    return { 
      success: true, 
      message: 'Deposit request created successfully', 
      data: depositRequest 
    };
  }

  @Get()
  @UseGuards(RolesGuard)
  @Roles('STORE_ADMIN', 'DEVELOPER')
  async getAllDepositRequests(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
    @Query('search') search?: string,
  ): Promise<GetAllDepositRequestsResponseDto> {
    return this.depositRequestService.getAllDepositRequests(page, limit, search);
  }

  @Get(':id')
  async getDepositRequestById(
    @Param('id') id: string,
    @Request() req
  ): Promise<DepositRequestResponseDto> {
    const depositRequest = await this.depositRequestService.getDepositRequestById(id);
    if (depositRequest.userId !== req.user.id && req.user.role !== 'STORE_ADMIN') {
      throw new ForbiddenException('You do not have permission to access this deposit request');
    }
    
    return depositRequest;
  }

  @Put(':id')
  async updateDepositRequest(
    @Param('id') id: string,
    @Body() updateDto: UpdateDepositRequestDto,
    @Request() req
  ): Promise<DepositRequestResponseDto> {
    const depositRequest = await this.depositRequestService.getDepositRequestById(id);
    
    if (depositRequest.userId !== req.user.id && req.user.role !== 'STORE_ADMIN') {
      throw new ForbiddenException('You do not have permission to update this deposit request');
    }
    
    return this.depositRequestService.updateDepositRequestById(id, updateDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async deleteDepositRequest(
    @Param('id') id: string,
    @Request() req
  ) {
    const depositRequest = await this.depositRequestService.getDepositRequestById(id);
    
    if (depositRequest.userId !== req.user.id && req.user.role !== 'STORE_ADMIN') {
      throw new ForbiddenException('You do not have permission to delete this deposit request'); }
    
    return this.depositRequestService.deleteDepositRequestById(id);
  }
}