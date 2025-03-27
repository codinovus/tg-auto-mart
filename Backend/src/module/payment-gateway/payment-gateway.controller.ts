import { Controller, Post, Body, BadRequestException } from '@nestjs/common';
import { PaymentGatewayService } from './payment-gateway.service';
import { CreateDepositRequestDto, DepositRequestResponseDto } from '../deposit-request/model/deposit-request.dto';

@Controller('payment-gateway')
export class PaymentGatewayController {
  constructor(private readonly paymentGatewayService: PaymentGatewayService) {}

  @Post('create-deposit')
  async createDeposit(@Body() createDto: CreateDepositRequestDto): Promise<DepositRequestResponseDto> {
    const { userId, amount } = createDto;

    if (!userId || !amount) {
      throw new BadRequestException('userId and amount are required');
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