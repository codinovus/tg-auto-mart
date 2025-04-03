import { 
  Controller, 
  Post, 
  Body, 
  BadRequestException, 
  UseGuards, 
  Request, 
  ForbiddenException 
} from '@nestjs/common';
import { PaymentGatewayService } from './payment-gateway.service';
import { CreateDepositRequestDto, DepositRequestResponseDto } from '../deposit-request/model/deposit-request.dto';
import { JwtAuthGuard } from 'src/shared/auth/jwt-auth.guard';


@Controller('payment-gateway')
export class PaymentGatewayController {
  constructor(private readonly paymentGatewayService: PaymentGatewayService) {}

  @Post('create-deposit')
  @UseGuards(JwtAuthGuard)
  async createDeposit(
    @Body() createDto: CreateDepositRequestDto,
    @Request() req
  ): Promise<DepositRequestResponseDto> {
    // Ensure the user can only create deposits for themselves
    if (createDto.userId && createDto.userId !== req.user.id && req.user.role !== 'STORE_ADMIN' && req.user.role !== 'DEVELOPER') {
      throw new ForbiddenException('You can only create deposits for your own account');
    }
    
    // Set the userId to the authenticated user's ID
    createDto.userId = req.user.id;
    
    // Validate the amount
    if (!createDto.amount || createDto.amount <= 0) {
      throw new BadRequestException('A valid amount is required');
    }

    return await this.paymentGatewayService.addBalance(createDto);
  }

  @Post('ipn-callback')
  async handleIpnCallback(@Body() data: any) {
    try {
      await this.paymentGatewayService.handleWebhook(data);
      return { status: 'success' };
    } catch (error) {
      throw new BadRequestException('Failed to process IPN callback: ' + error.message);
    }
  }
}