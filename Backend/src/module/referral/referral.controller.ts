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
  UseGuards 
} from '@nestjs/common';
import { ReferralService } from './referral.service';
import { 
  CreateReferralDto, 
  ReferralResponseDto, 
  GetAllReferralsResponseDto, 
  UpdateReferralDto 
} from './model/referral.dto';
import { JwtAuthGuard } from 'src/shared/auth/jwt-auth.guard';
import { RolesGuard } from 'src/shared/auth/roles.guard';
import { Roles } from 'src/shared/auth/roles.decorator';

@Controller('referrals')
@UseGuards(JwtAuthGuard) // Protect all routes with JWT authentication
export class ReferralController {
  constructor(private readonly referralService: ReferralService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles('STORE_ADMIN', 'DEVELOPER') // Only allow STORE_ADMIN and DEVELOPER to create referrals
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
  @UseGuards(RolesGuard)
  @Roles('STORE_ADMIN', 'DEVELOPER') // Only allow STORE_ADMIN and DEVELOPER to update referrals
  async updateReferral(
      @Param('id') referralId: string,
      @Body() updateReferralDto: UpdateReferralDto,
  ): Promise<ReferralResponseDto> {
      return this.referralService.updateReferralById(referralId, updateReferralDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @UseGuards(RolesGuard)
  @Roles('STORE_ADMIN', 'DEVELOPER') // Only allow STORE_ADMIN and DEVELOPER to delete referrals
  async deleteReferral(@Param('id') referralId: string) {
      return this.referralService.deleteReferralById(referralId);
  }
}