import { IsNotEmpty, IsOptional, IsUUID, IsNumber, Min } from 'class-validator';

// DTO for creating a referral
export class CreateReferralDto {
  @IsUUID()
  @IsNotEmpty()
  referredById: string;

  @IsUUID()
  @IsNotEmpty()
  referredUserId: string;

  @IsNumber()
  @Min(0)
  @IsOptional()
  rewardAmount?: number;
}

// DTO for updating a referral
export class UpdateReferralDto {
  @IsNumber()
  @Min(0)
  @IsOptional()
  rewardAmount?: number;
}

// DTO for individual referral response
export class ReferralResponseDto {
  id: string;
  referredById: string;
  referredUserId: string;
  rewardAmount: number;
  createdAt: Date;
  updatedAt: Date;
}

// DTO for paginated response of referrals
export class GetAllReferralsResponseDto {
  success: boolean;
  message: string;
  data: ReferralResponseDto[];
  pagination: {
    totalItems: number;
    totalPages: number;
    currentPage: number;
    perPage: number;
  };

  constructor(
    success: boolean,
    message: string,
    data: ReferralResponseDto[],
    pagination: { totalItems: number; totalPages: number; currentPage: number; perPage: number },
  ) {
    this.success = success;
    this.message = message;
    this.data = data;
    this.pagination = pagination;
  }
}
