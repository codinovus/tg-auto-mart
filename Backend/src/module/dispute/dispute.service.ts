import {
    Injectable,
    NotFoundException,
  } from '@nestjs/common';
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
  
  @Injectable()
  export class DisputeService {
    constructor(private prisma: PrismaService) {}
  
    async createDispute(createDisputeDto: CreateDisputeDto): Promise<DisputeResponseDto> {
      const { orderId, userId, reason } = createDisputeDto;
  
      // Check if the order exists
      const order = await this.prisma.order.findUnique({
        where: { id: orderId },
      });
      if (!order) {
        throw new NotFoundException(`Order with ID ${orderId} not found`);
      }
  
      // Check if the user exists
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
      });
      if (!user) {
        throw new NotFoundException(`User  with ID ${userId} not found`);
      }
  
      // Create the dispute
      const dispute = await this.prisma.dispute.create({
        data: {
          orderId,
          userId,
          reason,
        },
      });
  
      return this.mapToDisputeResponseDto(dispute);
    }
  
    async getAllDisputes(page: number, limit: number): Promise<GetAllDisputesResponseDto> {
      const totalItems = await this.prisma.dispute.count();
      const disputes = await this.prisma.dispute.findMany({
        skip: (page - 1) * limit,
        take: limit,
        include: {
          order: true, // Include related order data
          user: true, // Include related user data
        },
      });
  
      const disputeResponseDtos: DisputeResponseDto[] = disputes.map(dispute => this.mapToDisputeResponseDto(dispute));
  
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
      const dispute = await this.prisma.dispute.findUnique({
        where: { id: disputeId },
        include: {
          order: true, // Include related order data
          user: true, // Include related user data
        },
      });
  
      if (!dispute) {
        throw new NotFoundException(`Dispute with ID ${disputeId} not found`);
      }
  
      return new GetDisputeByIdResponseDto(true, 'Dispute fetched successfully', this.mapToDisputeResponseDto(dispute));
    }
  
    async updateDisputeById(disputeId: string, updateData: UpdateDisputeDto): Promise<DisputeResponseDto> {
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
  
    async deleteDisputeById(disputeId: string): Promise<{ success: boolean; message: string }> {
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
  }