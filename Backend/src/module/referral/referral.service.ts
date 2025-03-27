import {
    Injectable,
    ConflictException,
    NotFoundException,
  } from '@nestjs/common';
  import { PrismaService } from 'src/shared/prisma/prisma.service';
  import {
    CreateReferralDto,
    ReferralResponseDto,
    GetAllReferralsResponseDto,
    UpdateReferralDto,
  } from './model/referral.dto';
  
  @Injectable()
  export class ReferralService {
    constructor(private prisma: PrismaService) {}
  
    async createReferral(createReferralDto: CreateReferralDto): Promise<ReferralResponseDto> {
      const { referredById, referredUserId, rewardAmount = 0 } = createReferralDto;
  
      // Check if referral already exists
      const existingReferral = await this.prisma.referral.findFirst({
        where: { referredById, referredUserId },
      });
  
      if (existingReferral) {
        throw new ConflictException('Referral already exists');
      }
  
      const referral = await this.prisma.referral.create({
        data: { referredById, referredUserId, rewardAmount },
      });
  
      return {
        id: referral.id,
        referredById: referral.referredById,
        referredUserId: referral.referredUserId,
        rewardAmount: referral.rewardAmount,
        createdAt: referral.createdAt,
        updatedAt: referral.updatedAt,
      };
    }
  
    async getAllReferrals(
      page: number,
      limit: number,
      searchQuery?: string,
    ): Promise<GetAllReferralsResponseDto> {
      const totalItems = await this.prisma.referral.count({
        where: {
          OR: [
            { referredById: { contains: searchQuery, mode: 'insensitive' } },
            { referredUserId: { contains: searchQuery, mode: 'insensitive' } },
          ],
        },
      });
  
      const referrals = await this.prisma.referral.findMany({
        where: {
          OR: [
            { referredById: { contains: searchQuery, mode: 'insensitive' } },
            { referredUserId: { contains: searchQuery, mode: 'insensitive' } },
          ],
        },
        skip: (page - 1) * limit,
        take: limit,
      });
  
      const referralResponseDtos: ReferralResponseDto[] = referrals.map((referral) => ({
        id: referral.id,
        referredById: referral.referredById,
        referredUserId: referral.referredUserId,
        rewardAmount: referral.rewardAmount,
        createdAt: referral.createdAt,
        updatedAt: referral.updatedAt,
      }));
  
      const totalPages = Math.ceil(totalItems / limit);
      return new GetAllReferralsResponseDto(
        true,
        'Referrals fetched successfully',
        referralResponseDtos,
        { totalItems, totalPages, currentPage: page, perPage: limit },
      );
    }
  
    async getReferralById(referralId: string): Promise<ReferralResponseDto> {
      const referral = await this.prisma.referral.findUnique({
        where: { id: referralId },
      });
  
      if (!referral) {
        throw new NotFoundException(`Referral with ID ${referralId} not found`);
      }
  
      return referral;
    }
  
    async updateReferralById(referralId: string, updateData: UpdateReferralDto): Promise<ReferralResponseDto> {
      const referral = await this.prisma.referral.findUnique({
        where: { id: referralId },
      });
  
      if (!referral) {
        throw new NotFoundException(`Referral with ID ${referralId} not found`);
      }
  
      const updatedReferral = await this.prisma.referral.update({
        where: { id: referralId },
        data: updateData,
      });
  
      return updatedReferral;
    }
  
    async deleteReferralById(referralId: string): Promise<{ success: boolean; message: string }> {
      const referral = await this.prisma.referral.findUnique({
        where: { id: referralId },
      });
  
      if (!referral) {
        throw new NotFoundException(`Referral with ID ${referralId} not found`);
      }
  
      await this.prisma.referral.delete({
        where: { id: referralId },
      });
  
      return {
        success: true,
        message: `Referral with ID ${referralId} deleted successfully`,
      };
    }

    async getReferralIdByTelegramId(telegramId: string): Promise<ReferralResponseDto> {
      const referral = await this.prisma.referral.findFirst({
        where: {
          OR: [
            { referredBy: { telegramId } }, // If referredBy is linked to a user table with Telegram ID
            { referredUser: { telegramId } }, // If referredUser is linked to a user table with Telegram ID
          ],
        },
      });
  
      if (!referral) {
        throw new NotFoundException(`No referral found for Telegram ID ${telegramId}`);
      }
  
      return referral;
    }

    async getAllReferralsByTelegramId(
      telegramId: string,
      page: number,
      limit: number,
    ): Promise<GetAllReferralsResponseDto> {
      const totalItems = await this.prisma.referral.count({
        where: {
          referredBy: { telegramId },
        },
      });
  
      const referrals = await this.prisma.referral.findMany({
        where: {
            referredBy: { telegramId },
        },
        skip: (page - 1) * limit,
        take: limit,
      });
  
      if (!referrals.length) {
        throw new NotFoundException(`No referrals found for Telegram ID ${telegramId}`);
      }
  
      const referralResponseDtos: ReferralResponseDto[] = referrals.map((referral) => ({
        id: referral.id,
        referredById: referral.referredById,
        referredUserId: referral.referredUserId,
        rewardAmount: referral.rewardAmount,
        createdAt: referral.createdAt,
        updatedAt: referral.updatedAt,
      }));
  
      const totalPages = Math.ceil(totalItems / limit);
      return new GetAllReferralsResponseDto(
        true,
        'Referrals fetched successfully',
        referralResponseDtos,
        { totalItems, totalPages, currentPage: page, perPage: limit },
      );
    }
  }
  