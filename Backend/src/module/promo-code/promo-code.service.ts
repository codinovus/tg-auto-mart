import {
  Injectable,
  ConflictException,
  NotFoundException,
  BadRequestException,
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

  // Helper Methods
  private validatePagination(page: number, limit: number): void {
    if (page < 1 || limit < 1) {
      throw new BadRequestException('Page and limit must be positive integers');
    }
  }

  private async validatePromoCodeExists(promoCodeId: string): Promise<void> {
    const promoCode = await this.prisma.promoCode.findUnique({ where: { id: promoCodeId } });
    if (!promoCode) {
      throw new NotFoundException(`Promo code with ID ${promoCodeId} not found`);
    }
  }

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

  // Create Methods
  async createPromoCode(createPromoCodeDto: CreatePromoCodeDto): Promise<PromoCodeResponseDto> {
    const { code, discount, expiresAt, isActive = true } = createPromoCodeDto;

    if (!code || discount < 0) {
      throw new BadRequestException('Promo code and discount (>= 0) are required');
    }

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
    this.validatePagination(page, limit);
  
    const totalItems = await this.prisma.promoCode.count();
    const promoCodes = await this.prisma.promoCode.findMany({
      skip: (page - 1) * limit,
      take: limit, // Ensure limit is a number
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
    if (!promoCodeId) {
      throw new BadRequestException('Promo code ID is required');
    }

    await this.validatePromoCodeExists(promoCodeId);

    const promoCode = await this.prisma.promoCode.findUnique({
      where: { id: promoCodeId },
    });

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
    if (!promoCodeId) {
      throw new BadRequestException('Promo code ID is required');
    }

    await this.validatePromoCodeExists(promoCodeId);

    const updatedPromoCode = await this.prisma.promoCode.update({
      where: { id: promoCodeId },
      data: updateData,
    });

    return this.mapToPromoCodeResponseDto(updatedPromoCode);
  }

  // Delete Methods
  async deletePromoCodeById(promoCodeId: string): Promise<{ success: boolean; message: string }> {
    if (!promoCodeId) {
      throw new BadRequestException('Promo code ID is required');
    }

    await this.validatePromoCodeExists(promoCodeId);

    await this.prisma.promoCode.delete({
      where: { id: promoCodeId },
    });

    return {
      success: true,
      message: `Promo code with ID ${promoCodeId} deleted successfully`,
    };
  }
}