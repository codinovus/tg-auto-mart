/**
 * Data transfer object for creating a new referral
 */
export interface CreateReferralDto {
    referredById: string;
    referredUserId: string;
    rewardAmount?: number;
  }

  /**
   * Data transfer object for updating an existing referral
   */
  export interface UpdateReferralDto {
    rewardAmount?: number;
  }

  /**
   * Data transfer object representing a referral response
   */
  export interface ReferralResponseDto {
    id: string;
    referredById: string;
    referredUserId: string;
    rewardAmount: number;
    createdAt: Date;
    updatedAt: Date;
  }

  /**
   * Data transfer object for the paginated response of referrals
   */
  export interface GetAllReferralsResponseDto {
    success: boolean;
    message: string;
    data: ReferralResponseDto[];
    pagination: {
      totalItems: number;
      totalPages: number;
      currentPage: number;
      perPage: number;
    };
  }
