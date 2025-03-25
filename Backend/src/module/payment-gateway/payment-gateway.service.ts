/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { Injectable, BadRequestException } from '@nestjs/common';
import axios from 'axios';
import * as crypto from 'crypto';

@Injectable()
export class PaymentGatewayService {
  private readonly apiKey = process.env.NOWPAYMENTS_API_KEY;
  private readonly ipnSecret = process.env.NOWPAYMENTS_IPN_SECRET;

  async createInvoice(priceAmount: number, priceCurrency: string, orderId: string, orderDescription: string, ipnCallbackUrl: string, successUrl: string, cancelUrl: string): Promise<any> {
    const invoiceData = {
      price_amount: priceAmount,
      price_currency: priceCurrency,
      order_id: orderId,
      order_description: orderDescription,
      ipn_callback_url: ipnCallbackUrl,
      success_url: successUrl,
      cancel_url: cancelUrl,
      is_fixed_rate: true,
      is_fee_paid_by_user: false,
    };

    console.log('Creating invoice with data:', invoiceData);

    try {
      const response = await axios.post('https://api.nowpayments.io/v1/invoice', invoiceData, {
        headers: {
          'x-api-key': this.apiKey,
          'Content-Type': 'application/json',
        },
      });
      console.log('Invoice created successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error creating invoice:', error.message);
      throw new BadRequestException('Invoice creation failed: ' + error.message);
    }
  }

  async createPayment(priceAmount: number, priceCurrency: string, payCurrency: string, orderId: string, orderDescription: string, ipnCallbackUrl: string): Promise<any> {
    const paymentData = {
      price_amount: priceAmount,
      price_currency: priceCurrency,
      pay_currency: payCurrency,
      order_id: orderId,
      order_description: orderDescription,
      ipn_callback_url: ipnCallbackUrl,
      is_fixed_rate: true,
      is_fee_paid_by_user: false,
    };

    console.log('Creating payment with data:', paymentData);

    try {
      const response = await axios.post('https://api.nowpayments.io/v1/payment', paymentData, {
        headers: {
          'x-api-key': this.apiKey,
          'Content-Type': 'application/json',
        },
      });
      console.log('Payment created successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error creating payment:', error.message);
      throw new BadRequestException('Payment creation failed: ' + error.message);
    }
  }

  async getPaymentStatus(paymentId: string): Promise<any> {
    console.log('Fetching payment status for ID:', paymentId);

    try {
      const response = await axios.get(`https://api.nowpayments.io/v1/payment/${paymentId}`, {
        headers: {
          'x-api-key': this.apiKey,
        },
      });
      console.log('Payment status retrieved successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching payment status:', error.message);
      throw new BadRequestException('Failed to get payment status: ' + error.message);
    }
  }

  handleCallback(callbackData: any): void {
    console.log('Received callback data:', callbackData);

    // Validate the callback data
    const receivedSignature = callbackData.headers['x-nowpayments-sig'];
    const sortedData = this.sortObject(callbackData.body);
    const signature = this.createHmacSignature(sortedData);

    console.log('Received signature:', receivedSignature);
    console.log('Calculated signature:', signature);

    if (signature !== receivedSignature) {
      console.error('Invalid signature');
      throw new BadRequestException('Invalid signature');
    }

    // Process the payment status update
    console.log('Processing payment status update:', callbackData.body);
    // Implement your logic to handle the callback, e.g., update your database
  }

  private sortObject(obj: any): any {
    return Object.keys(obj).sort().reduce((result, key) => {
      result[key] = (obj[key] && typeof obj[key] === 'object') ? this.sortObject(obj[key]) : obj[key];
      return result;
    }, {});
  }

  private createHmacSignature(data: any): string {
    if (!this.ipnSecret) {
      console.error('IPN secret is not defined');
      throw new BadRequestException('IPN secret is not defined');
    }
    const sortedDataString = JSON.stringify(data);
    const hmac = crypto.createHmac('sha512', this.ipnSecret);
    hmac.update(sortedDataString);
    const signature = hmac.digest('hex');
    console.log('Generated HMAC signature:', signature);
    return signature;
  }
}