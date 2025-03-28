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
    Query 
  } from '@nestjs/common';
  import { ReferralService } from './referral.service';
  import { 
    CreateReferralDto, 
    ReferralResponseDto, 
    GetAllReferralsResponseDto, 
    UpdateReferralDto 
  } from './model/referral.dto';
  
  @Controller('referrals')
  export class ReferralController {
    constructor(private readonly referralService: ReferralService) {}
  
    @Post()
    async createReferral(@Body() createReferralDto: CreateReferralDto) {
      const referral = await this.referralService.createReferral(createReferralDto);
      return { success: true, message: 'Referral created successfully', data: referral };
    }
  
    @Get()
    async getAllReferrals(
      @Query('page') page = 1,
      @Query('limit') limit = 10,
      @Query('search') searchQuery = '',
    ): Promise<GetAllReferralsResponseDto> {
      return this.referralService.getAllReferrals(page, limit, searchQuery);
    }
  
    @Get(':id')
    async getReferralById(@Param('id') referralId: string): Promise<ReferralResponseDto> {
      return this.referralService.getReferralById(referralId);
    }
  
    @Put(':id')
    async updateReferral(
      @Param('id') referralId: string,
      @Body() updateReferralDto: UpdateReferralDto,
    ): Promise<ReferralResponseDto> {
      return this.referralService.updateReferralById(referralId, updateReferralDto);
    }
  
    @Delete(':id')
    @HttpCode(HttpStatus.OK)
    async deleteReferral(@Param('id') referralId: string) {
      return this.referralService.deleteReferralById(referralId);
    }
  }
  