import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from 'src/shared/prisma/prisma.service';
import {
  CreateDepositRequestDto,
  DepositRequestResponseDto,
  GetAllDepositRequestsResponseDto,
  UpdateDepositRequestDto,
} from './model/deposit-request.dto';
import { PaymentGatewayService } from '../payment-gateway/payment-gateway.service';
import { SearchableField, SearchBuilder } from 'src/shared/base/search-builder.util';

@Injectable()
export class DepositRequestService {
  constructor(private prisma: PrismaService,
    private paymentgatewayService : PaymentGatewayService
  ) {}

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

  async createDepositRequest(
    createDto: CreateDepositRequestDto,
  ): Promise<DepositRequestResponseDto> {
    const { userId, amount } = createDto;
  
    if (!userId || !amount) {
      throw new BadRequestException('userId and amount are required');
    }
  
    // Call the addBalance method to handle the deposit request creation and payment link generation
    const depositRequestResponse = await this.paymentgatewayService.addBalance(createDto);
  
    // Return the response from addBalance, which includes all necessary properties
    return depositRequestResponse;
  }


  // Get Methods
  async getAllDepositRequests(
    page: number,
    limit: number,
    search?: string,
  ): Promise<GetAllDepositRequestsResponseDto> {
    this.validatePagination(page, limit);
  
    const searchableFields: SearchableField[] = [
      { name: 'status', type: 'enum', enumType: 'PaymentStatus' },
      { 
        name: 'user', 
        nested: true, 
        relationField: 'user', 
        searchableFields: [
          { name: 'username', type: 'string' },
          { name: 'telegramId', type: 'string' }
        ] 
      },
      { name: 'updatedAt', type: 'date' }
    ];
  
    const whereClause = SearchBuilder.buildWhereClause(search, searchableFields);
  
    // Count with search criteria
    const totalItems = await this.prisma.depositRequest.count({
      where: whereClause
    });
  
    const depositRequests = await this.prisma.depositRequest.findMany({
      where: whereClause,
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
