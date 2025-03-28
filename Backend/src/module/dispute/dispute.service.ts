import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from 'src/shared/prisma/prisma.service';
import {
  CreateDisputeDto,
  UpdateDisputeDto,
  DisputeResponseDto,
  GetAllDisputesResponseDto,
  GetDisputeByIdResponseDto,
} from './model/dispute.dto';
import { OrderResponseDto } from 'src/module/order/model/order.dto';
import { UserResponseDto } from 'src/module/user/model/user.model';
import { SearchableField, SearchBuilder } from 'src/shared/base/search-builder.util';

@Injectable()
export class DisputeService {
  constructor(private prisma: PrismaService) {}

  // Helper Methods
  private validatePagination(page: number, limit: number): void {
    if (page < 1 || limit < 1) {
      throw new BadRequestException('Page and limit must be positive integers');
    }
  }

  private mapToDisputeResponseDto(dispute: any): DisputeResponseDto {
    return {
      id: dispute.id,
      order: dispute.order as OrderResponseDto,
      orderId: dispute.orderId,
      user: dispute.user as UserResponseDto,
      userId: dispute.userId,
      status: dispute.status,
      reason: dispute.reason,
      resolution: dispute.resolution,
      createdAt: dispute.createdAt,
      updatedAt: dispute.updatedAt,
    };
  }

  // Create Methods
  async createDispute(createDisputeDto: CreateDisputeDto): Promise<DisputeResponseDto> {
    const { orderId, userId, reason } = createDisputeDto;

    if (!orderId || !userId || !reason) {
      throw new BadRequestException('Order ID, User ID, and reason are required');
    }

    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
    });
    if (!order) {
      throw new NotFoundException(`Order with ID ${orderId} not found`);
    }

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });
    if (!user) {
      throw new NotFoundException(`User  with ID ${userId} not found`);
    }

    const dispute = await this.prisma.dispute.create({
      data: {
        orderId,
        userId,
        reason,
      },
    });

    return this.mapToDisputeResponseDto(dispute);
  }

  // Get Methods
  async getAllDisputes(
    page: number, 
    limit: number, 
    search?: string
  ): Promise<GetAllDisputesResponseDto> {
    this.validatePagination(page, limit);
  
    const searchableFields: SearchableField[] = [
      { name: 'id', type: 'string', exact: true },
      { name: 'orderId', type: 'string', exact: true },
      { name: 'status', type: 'enum', enumType: 'DisputeStatus' },
      { 
        name: 'user', 
        nested: true, 
        relationField: 'user', 
        searchableFields: [
          { name: 'username', type: 'string' },
        ] 
      },
      { name: 'updatedAt', type: 'date' },
    ];
  
    const whereClause = SearchBuilder.buildWhereClause(search, searchableFields);
  
    const totalItems = await this.prisma.dispute.count({
      where: whereClause
    });
  
    const disputes = await this.prisma.dispute.findMany({
      where: whereClause,
      skip: (page - 1) * limit,
      take: limit,
      include: {
        order: true,
        user: true,
      },
      orderBy: {
        updatedAt: 'desc',
      },
    });
  
    const disputeResponseDtos: DisputeResponseDto[] = disputes.map(
      dispute => this.mapToDisputeResponseDto(dispute)
    );
  
    const totalPages = Math.ceil(totalItems / limit);
    return new GetAllDisputesResponseDto(
      true,
      'Disputes fetched successfully',
      disputeResponseDtos,
      {
        totalItems,
        totalPages,
        currentPage: page,
        perPage: limit,
      },
    );
  }

  async getDisputeById(disputeId: string): Promise<GetDisputeByIdResponseDto> {
    if (!disputeId) {
      throw new BadRequestException('Dispute ID is required');
    }

    const dispute = await this.prisma.dispute.findUnique({
      where: { id: disputeId },
      include: {
        order: true,
        user: true,
      },
    });

    if (!dispute) {
      throw new NotFoundException(`Dispute with ID ${disputeId} not found`);
    }

    return new GetDisputeByIdResponseDto(
      true,
      'Dispute fetched successfully',
      this.mapToDisputeResponseDto(dispute),
    );
  }

  // Update Methods
  async updateDisputeById(disputeId: string, updateData: UpdateDisputeDto): Promise<DisputeResponseDto> {
    if (!disputeId) {
      throw new BadRequestException('Dispute ID is required');
    }

    const dispute = await this.prisma.dispute.findUnique({
      where: { id: disputeId },
    });

    if (!dispute) {
      throw new NotFoundException(`Dispute with ID ${disputeId} not found`);
    }

    const updatedDispute = await this.prisma.dispute.update({
      where: { id: disputeId },
      data: updateData,
    });

    return this.mapToDisputeResponseDto(updatedDispute);
  }

  // Delete Methods
  async deleteDisputeById(disputeId: string): Promise<{ success: boolean; message: string }> {
    if (!disputeId) {
      throw new BadRequestException('Dispute ID is required');
    }

    const dispute = await this.prisma.dispute.findUnique({
      where: { id: disputeId },
    });

    if (!dispute) {
      throw new NotFoundException(`Dispute with ID ${disputeId} not found`);
    }

    await this.prisma.dispute.delete({
      where: { id: disputeId },
    });

    return {
      success: true,
      message: `Dispute with ID ${disputeId} deleted successfully`,
    };
  }
} 