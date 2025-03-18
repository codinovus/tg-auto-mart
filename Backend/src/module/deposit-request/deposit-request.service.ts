import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
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

  // Helper Methods
  private validatePagination(page: number, limit: number): void {
    if (page < 1 || limit < 1) {
      throw new BadRequestException('Page and limit must be positive integers');
    }
  }

  private mapDepositRequestToResponse(
    depositRequest: any,
  ): DepositRequestResponseDto {
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
        : ({} as any),
      transactions: depositRequest.Transaction.map((transaction) => ({
        id: transaction.id,
        amount: transaction.amount,
        status: transaction.status,
        createdAt: transaction.createdAt,
        updatedAt: transaction.updatedAt,
      })),
    };
  }

  // Create Methods
  async createDepositRequest(
    createDto: CreateDepositRequestDto,
  ): Promise<DepositRequestResponseDto> {
    const { userId, amount, paymentLink } = createDto;

    if (!userId || !amount || !paymentLink) {
      throw new BadRequestException(
        'userId, amount, and paymentLink are required',
      );
    }

    const existingRequest = await this.prisma.depositRequest.findFirst({
      where: { paymentLink },
    });

    if (existingRequest) {
      throw new ConflictException(
        'A deposit request with this payment link already exists',
      );
    }

    const depositRequest = await this.prisma.depositRequest.create({
      data: {
        userId,
        amount,
        paymentLink,
        status: createDto.status || PaymentStatus.PENDING,
      },
      include: {
        user: true,
        Transaction: true,
      },
    });

    return this.mapDepositRequestToResponse(depositRequest);
  }

  // Get Methods
  async getAllDepositRequests(
    page: number,
    limit: number,
  ): Promise<GetAllDepositRequestsResponseDto> {
    this.validatePagination(page, limit);

    const totalItems = await this.prisma.depositRequest.count();

    const depositRequests = await this.prisma.depositRequest.findMany({
      skip: (page - 1) * limit,
      take: limit,
      include: {
        user: true,
        Transaction: true,
      },
    });

    const responseDtos = depositRequests.map((request) =>
      this.mapDepositRequestToResponse(request),
    );

    const totalPages = Math.ceil(totalItems / limit);
    return new GetAllDepositRequestsResponseDto(
      true,
      'Deposit requests fetched successfully',
      responseDtos,
      {
        totalItems,
        totalPages,
        currentPage: page,
        perPage: limit,
      },
    );
  }

  async getDepositRequestById(id: string): Promise<DepositRequestResponseDto> {
    if (!id) {
      throw new BadRequestException('Deposit request ID is required');
    }

    const depositRequest = await this.prisma.depositRequest.findUnique({
      where: { id },
      include: {
        user: true,
        Transaction: true,
      },
    });

    if (!depositRequest) {
      throw new NotFoundException(`Deposit request with ID ${id} not found`);
    }

    return this.mapDepositRequestToResponse(depositRequest);
  }

  // Update Methods
  async updateDepositRequestById(
    id: string,
    updateDto: UpdateDepositRequestDto,
  ): Promise<DepositRequestResponseDto> {
    if (!id) {
      throw new BadRequestException('Deposit request ID is required');
    }

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
        Transaction: true,
      },
    });

    return this.mapDepositRequestToResponse(updatedDepositRequest);
  }

  // Delete Methods
  async deleteDepositRequestById(
    id: string,
  ): Promise<{ success: boolean; message: string }> {
    if (!id) {
      throw new BadRequestException('Deposit request ID is required');
    }

    const depositRequest = await this.prisma.depositRequest.findUnique({
      where: { id },
    });

    if (!depositRequest) {
      throw new NotFoundException(`Deposit request with ID ${id} not found`);
    }

    await this.prisma.depositRequest.delete({ where: { id } });

    return {
      success: true,
      message: `Deposit request with ID ${id} deleted successfully`,
    };
  }
}
