import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/shared/prisma/prisma.service';
import {
  CreatePromoCodeDto,
  UpdatePromoCodeDto,
  PromoCodeResponseDto,
  GetAllPromoCodesResponseDto,
  GetPromoCodeByIdResponseDto,
} from './model/promo-code.dto';

@Injectable()
export class PromoCodeService {
  constructor(private prisma: PrismaService) {}

  // Create Methods
  async createPromoCode(createPromoCodeDto: CreatePromoCodeDto): Promise<PromoCodeResponseDto> {
    const { code, discount, expiresAt, isActive = true } = createPromoCodeDto;

    const existingPromoCode = await this.prisma.promoCode.findUnique({
      where: { code },
    });
    if (existingPromoCode) {
      throw new ConflictException(`Promo code "${code}" already exists`);
    }

    const promoCode = await this.prisma.promoCode.create({
      data: {
        code,
        discount,
        expiresAt,
        isActive,
      },
    });

    return this.mapToPromoCodeResponseDto(promoCode);
  }

  // Get Methods
  async getAllPromoCodes(page: number, limit: number): Promise<GetAllPromoCodesResponseDto> {
    const totalItems = await this.prisma.promoCode.count();
    const promoCodes = await this.prisma.promoCode.findMany({
      skip: (page - 1) * limit,
      take: limit,
    });

    const promoCodeResponseDtos: PromoCodeResponseDto[] = promoCodes.map(promoCode =>
      this.mapToPromoCodeResponseDto(promoCode),
    );

    const totalPages = Math.ceil(totalItems / limit);
    return new GetAllPromoCodesResponseDto(
      true,
      'Promo codes fetched successfully',
      promoCodeResponseDtos,
      {
        totalItems,
        totalPages,
        currentPage: page,
        perPage: limit,
      },
    );
  }

  async getPromoCodeById(promoCodeId: string): Promise<GetPromoCodeByIdResponseDto> {
    const promoCode = await this.prisma.promoCode.findUnique({
      where: { id: promoCodeId },
    });

    if (!promoCode) {
      throw new NotFoundException(`Promo code with ID ${promoCodeId} not found`);
    }

    return new GetPromoCodeByIdResponseDto(
      true,
      'Promo code fetched successfully',
      this.mapToPromoCodeResponseDto(promoCode),
    );
  }

  // Update Methods
  async updatePromoCodeById(
    promoCodeId: string,
    updateData: UpdatePromoCodeDto,
  ): Promise<PromoCodeResponseDto> {
    const promoCode = await this.prisma.promoCode.findUnique({
      where: { id: promoCodeId },
    });

    if (!promoCode) {
      throw new NotFoundException(`Promo code with ID ${promoCodeId} not found`);
    }

    const updatedPromoCode = await this.prisma.promoCode.update({
      where: { id: promoCodeId },
      data: updateData,
    });

    return this.mapToPromoCodeResponseDto(updatedPromoCode);
  }

  // Delete Methods
  async deletePromoCodeById(promoCodeId: string): Promise<{ success: boolean; message: string }> {
    const promoCode = await this.prisma.promoCode.findUnique({
      where: { id: promoCodeId },
    });

    if (!promoCode) {
      throw new NotFoundException(`Promo code with ID ${promoCodeId} not found`);
    }

    await this.prisma.promoCode.delete({
      where: { id: promoCodeId },
    });

    return {
      success: true,
      message: `Promo code with ID ${promoCodeId} deleted successfully`,
    };
  }

  // Other Methods
  private mapToPromoCodeResponseDto(promoCode: any): PromoCodeResponseDto {
    return {
      id: promoCode.id,
      code: promoCode.code,
      discount: promoCode.discount,
      expiresAt: promoCode.expiresAt,
      isActive: promoCode.isActive,
      usedBy: promoCode.usedBy,
      createdAt: promoCode.createdAt,
      updatedAt: promoCode.updatedAt,
    };
  }
}