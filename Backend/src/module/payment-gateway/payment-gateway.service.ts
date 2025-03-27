import {
    Injectable,
    BadRequestException,
    NotFoundException,
  } from '@nestjs/common';
  import axios from 'axios';
  import { config } from 'dotenv';
  import { PrismaService } from 'src/shared/prisma/prisma.service';
  import { PaymentStatus, TransactionType } from '@prisma/client';
  import { CreateDepositRequestDto, DepositRequestResponseDto } from '../deposit-request/model/deposit-request.dto';
  
  config();
  
  @Injectable()
  export class PaymentGatewayService {
    private readonly oxapayMerchantKey: string;
    private readonly oxapayBaseUrl: string;
    private readonly ipnCallbackUrl: string;
    private readonly successUrl: string;
    private readonly cancelUrl: string;
    private readonly updateAdmin: boolean;
    private readonly telegramBotToken: string;
  
    constructor(private readonly prisma: PrismaService) {
      this.oxapayMerchantKey = process.env.OXAPAY_MERCHANT_API || "SANDBOX";
      this.oxapayBaseUrl = process.env.OXAPAY_BASE_URL || 'https://api.oxapay.com/merchants/request';
      this.ipnCallbackUrl = process.env.IPN_CALLBACK_URL || 'http://localhost:3000/payment-gateway/ipn-callback';
      this.successUrl = process.env.SUCCESS_URL || 'http://localhost:3000/success';
      this.cancelUrl = process.env.CANCEL_URL || 'http://localhost:3000/cancel';
      this.updateAdmin = process.env.UPDATE_ADMIN === 'false';
      this.telegramBotToken = process.env.TELEGRAM_BOT_TOKEN || '';
    }
  
    async addBalance(createDto: CreateDepositRequestDto): Promise<DepositRequestResponseDto> {
        const { userId, amount } = createDto;
      
        if (!userId || !amount) {
          throw new BadRequestException('userId and amount are required');
        }
      
        return await this.prisma.$transaction(async (prisma) => {
          const depositRequest = await prisma.depositRequest.create({
            data: {
              userId,
              amount,
              status: PaymentStatus.PENDING,
            },
          });
      
          const paymentLinkResponse = await this.createInvoice(
            amount,
            'usd',
            depositRequest.id,
            `Deposit request for user ${userId}`,
            this.ipnCallbackUrl,
            this.successUrl,
            this.cancelUrl,
          );
      
          if (!paymentLinkResponse || !paymentLinkResponse.payLink) {
            throw new BadRequestException('Something went wrong, please try again later.');
          }
      
          await prisma.depositRequest.update({
            where: { id: depositRequest.id },
            data: { paymentLink: paymentLinkResponse.payLink },
          });
      
          await prisma.gatewayTransaction.create({
            data: {
              depositRequestId: depositRequest.id,
              amount,
              status: PaymentStatus.PENDING,
            },
          });
      
          const updatedDepositRequest = await prisma.depositRequest.findUnique({
            where: { id: depositRequest.id },
            include: { Transaction: true },
          });
      
          return this.mapDepositRequestToResponse(updatedDepositRequest);
        });
      }
  
    async createInvoice(
      amount: number,
      currency: string,
      orderId: string,
      orderDescription: string,
      ipnCallbackUrl: string,
      successUrl: string,
      cancelUrl: string,
    ): Promise<any> {
      if (!amount || !currency || !orderId || !orderDescription) {
        throw new BadRequestException('All parameters are required to create an invoice.');
      }
  
      const requestData = {
        merchant: this.oxapayMerchantKey,
        amount,
        currency,
        lifeTime: 60,
        feePaidByPayer: 1,
        underPaidCover: 1,
        callbackUrl: ipnCallbackUrl,
        returnUrl: successUrl,
        cancelUrl: cancelUrl,
        description: orderDescription,
        orderId,
      };
  
      try {
        const response = await axios.post(this.oxapayBaseUrl, requestData, {
          headers: {
            'Content-Type': 'application/json',
          },
        });
        return response.data;
      } catch (error) {
        throw new BadRequestException('Failed to create invoice: ' + error.message);
      }
    }
  
    async handleWebhook(data: any): Promise<void> {
      const { type, status, trackId } = data;
  
      if (type !== 'payment') {
        throw new BadRequestException('Invalid data type');
      }
  
      const depositRequest = await this.prisma.depositRequest.findUnique({
        where: { id: trackId },
        include: { user: true },
      });
  
      if (!depositRequest) {
        throw new NotFoundException(`Deposit request with ID ${trackId} not found`);
      }
  
      const user = depositRequest.user;
  
      if (status === 'Paid') {
        await this.prisma.$transaction(async (prisma) => {
          await prisma.depositRequest.update({
            where : { id: trackId },
            data: { status: PaymentStatus.SUCCESS },
          });
  
          await prisma.gatewayTransaction.updateMany({
            where: { depositRequestId: trackId },
            data: { status: PaymentStatus.SUCCESS },
          });
  
          const wallet = await prisma.wallet.findUnique({
            where: { userId: user.id },
          });
  
          if (!wallet) {
            throw new NotFoundException(`Wallet for user ID ${user.id} not found`);
          }
  
          await prisma.wallet.update({
            where: { userId: user.id },
            data: {
              balance: {
                increment: depositRequest.amount,
              },
            },
          });
  
          await prisma.transaction.create({
            data: {
              walletId: wallet.id,
              userId: user.id,
              amount: depositRequest.amount,
              type: TransactionType.DEPOSIT,
              status: PaymentStatus.SUCCESS,
              depositRequestId: depositRequest.id,
            },
          });
        });
      } else {
        await this.notifyAdmin(data);
      }
    }
  
    private async notifyAdmin(data: any): Promise<void> {
      if (this.updateAdmin && this.telegramBotToken) {
        const message = this.formatWebhookMessage(data);
        await axios.post(`https://api.telegram.org/bot${this.telegramBotToken}/sendMessage`, {
          chat_id: process.env.TELEGRAM_CHAT_ID,
          text: message,
        });
      }
    }
  
    private formatWebhookMessage(data: any): string {
      const { type, status, trackId } = data;
      return `Webhook Notification:\nType: ${type}\nStatus: ${status}\nTrack ID: ${trackId}`;
    }
  
    private mapDepositRequestToResponse(depositRequest: any): DepositRequestResponseDto {
      return {
        id: depositRequest.id,
        user: depositRequest.user,
        userId: depositRequest.userId,
        amount: depositRequest.amount,
        status: depositRequest.status,
        paymentLink: depositRequest.paymentLink,
        createdAt: depositRequest.createdAt,
        updatedAt: depositRequest.updatedAt,
        transactions: depositRequest.Transaction ? depositRequest.Transaction.map(transaction => ({
          id: transaction.id,
          amount: transaction.amount,
          status: transaction.status,
          createdAt: transaction.createdAt,
          updatedAt: transaction.updatedAt,
        })) : [],
      };
    }
  }