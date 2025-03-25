/* eslint-disable @typescript-eslint/await-thenable */
/* eslint-disable @typescript-eslint/no-unsafe-return */
import { Body, Controller, Post, Get, Param, BadRequestException } from '@nestjs/common';
import { PaymentGatewayService } from './payment-gateway.service';

@Controller('payment-gateway')
export class PaymentGatewayController {
  constructor(private readonly paymentGatewayService: PaymentGatewayService) {}

  @Post('create-invoice')
  async createInvoice(
    @Body() body: {
      priceAmount: number;
      priceCurrency: string;
      orderId: string;
      orderDescription: string;
      ipnCallbackUrl: string;
      successUrl: string;
      cancelUrl: string;
    }
  ) {
    try {
      return await this.paymentGatewayService.createInvoice(
        body.priceAmount,
        body.priceCurrency,
        body.orderId,
        body.orderDescription,
        body.ipnCallbackUrl,
        body.successUrl,
        body.cancelUrl
      );
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  @Post('create-payment')
  async createPayment(
    @Body() body: {
      priceAmount: number;
      priceCurrency: string;
      payCurrency: string;
      orderId: string;
      orderDescription: string;
      ipnCallbackUrl: string;
    }
  ) {
    try {
      return await this.paymentGatewayService.createPayment(
        body.priceAmount,
        body.priceCurrency,
        body.payCurrency,
        body.orderId,
        body.orderDescription,
        body.ipnCallbackUrl
      );
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  @Get('payment-status/:paymentId')
  async getPaymentStatus(@Param('paymentId') paymentId: string) {
    try {
      return await this.paymentGatewayService.getPaymentStatus(paymentId);
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  @Post('callback')
  async handleCallback(@Body() callbackData: any) {
    try {
      await this.paymentGatewayService.handleCallback(callbackData);
      return { message: 'Callback processed successfully' };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }
}