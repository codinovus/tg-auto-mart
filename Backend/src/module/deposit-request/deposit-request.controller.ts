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
  import { DepositRequestService } from './deposit-request.service';
  import {
    CreateDepositRequestDto,
    DepositRequestResponseDto,
    GetAllDepositRequestsResponseDto,
    UpdateDepositRequestDto,
  } from './model/deposit-request.dto';
  
  @Controller('deposit-requests')
  export class DepositRequestController {
    constructor(private readonly depositRequestService: DepositRequestService) {}
  
    @Post()
    async createDepositRequest(@Body() createDto: CreateDepositRequestDto) {
      const depositRequest = await this.depositRequestService.createDepositRequest(createDto);
      return { success: true, message: 'Deposit request created successfully', data: depositRequest };
    }
  
    @Get()
    async getAllDepositRequests(
      @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
          @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
    ): Promise<GetAllDepositRequestsResponseDto> {
      return this.depositRequestService.getAllDepositRequests(page, limit);
    }
  
    @Get(':id')
    async getDepositRequestById(@Param('id') id: string): Promise<DepositRequestResponseDto> {
      return this.depositRequestService.getDepositRequestById(id);
    }
  
    @Put(':id')
    async updateDepositRequest(
      @Param('id') id: string,
      @Body() updateDto: UpdateDepositRequestDto,
    ): Promise<DepositRequestResponseDto> {
      return this.depositRequestService.updateDepositRequestById(id, updateDto);
    }
  
    @Delete(':id')
    @HttpCode(HttpStatus.OK)
    async deleteDepositRequest(@Param('id') id: string) {
      return this.depositRequestService.deleteDepositRequestById(id);
    }
  }
  