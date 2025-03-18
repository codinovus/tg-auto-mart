import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/shared/prisma/prisma.service';
import {
  CreateDepositRequestDto,
  DepositRequestResponseDto,
  GetAllDepositRequestsResponseDto,
  UpdateDepositRequestDto,
} from './model/deposit-request.dto';
import { PaymentStatus } from '@prisma/client';

@Injectable()
export class DepositRequestService {
  constructor(private prisma: PrismaService) {}

  async createDepositRequest(createDto: CreateDepositRequestDto): Promise<DepositRequestResponseDto> {
    const depositRequest = await this.prisma.depositRequest.create({
      data: {
        userId: createDto.userId,
        amount: createDto.amount,
        paymentLink: createDto.paymentLink,
        status: createDto.status || PaymentStatus.PENDING,
      },
      include: { 
        user: true, 
        Transaction: true // Fixed relation name
      },
    });

    return this.mapDepositRequestToResponse(depositRequest);
  }

  async getAllDepositRequests(page: number, limit: number): Promise<GetAllDepositRequestsResponseDto> {
    const totalItems = await this.prisma.depositRequest.count();

    const depositRequests = await this.prisma.depositRequest.findMany({
      skip: (page - 1) * limit,
      take: limit,
      include: { 
        user: true, 
        Transaction: true // Fixed relation name
      },
    });

    const responseDtos = depositRequests.map((request) => this.mapDepositRequestToResponse(request));

    return new GetAllDepositRequestsResponseDto(
      true,
      'Deposit requests fetched successfully',
      responseDtos,
      {
        totalItems,
        totalPages: Math.ceil(totalItems / limit),
        currentPage: page,
        perPage: limit,
      },
    );
  }

  async getDepositRequestById(id: string): Promise<DepositRequestResponseDto> {
    const depositRequest = await this.prisma.depositRequest.findUnique({
      where: { id },
      include: { 
        user: true, 
        Transaction: true // Fixed relation name
      },
    });

    if (!depositRequest) {
      throw new NotFoundException(`Deposit request with ID ${id} not found`);
    }

    return this.mapDepositRequestToResponse(depositRequest);
  }

  async updateDepositRequestById(id: string, updateDto: UpdateDepositRequestDto): Promise<DepositRequestResponseDto> {
    const depositRequest = await this.prisma.depositRequest.findUnique({
      where: { id },
    });

    if (!depositRequest) {
      throw new NotFoundException(`Deposit request with ID ${id} not found`);
    }

    const updatedDepositRequest = await this.prisma.depositRequest.update({
      where: { id },
      data: updateDto,
      include: { 
        user: true, 
        Transaction: true // Fixed relation name
      },
    });

    return this.mapDepositRequestToResponse(updatedDepositRequest);
  }

  async deleteDepositRequestById(id: string): Promise<{ success: boolean; message: string }> {
    const depositRequest = await this.prisma.depositRequest.findUnique({ where: { id } });

    if (!depositRequest) {
      throw new NotFoundException(`Deposit request with ID ${id} not found`);
    }

    await this.prisma.depositRequest.delete({ where: { id } });

    return { success: true, message: `Deposit request with ID ${id} deleted successfully` };
  }

  private mapDepositRequestToResponse(depositRequest: any): DepositRequestResponseDto {
    return {
      id: depositRequest.id,
      userId: depositRequest.userId,
      amount: depositRequest.amount,
      paymentLink: depositRequest.paymentLink,
      status: depositRequest.status,
      createdAt: depositRequest.createdAt,
      updatedAt: depositRequest.updatedAt,
      user: depositRequest.user
        ? {
            id: depositRequest.user.id,
            username: depositRequest.user.username,
            telegramId: depositRequest.user.telegramId,
          }
        : ({} as any), // Fixed nullability issue
      transactions: depositRequest.Transaction.map((transaction) => ({
        id: transaction.id,
        amount: transaction.amount,
        status: transaction.status,
        createdAt: transaction.createdAt,
        updatedAt: transaction.updatedAt,
      })),
    };
  }
}
