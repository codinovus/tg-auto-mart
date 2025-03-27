/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable @typescript-eslint/no-unnecessary-type-assertion */
/* eslint-disable @typescript-eslint/require-await */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { Injectable, OnModuleInit } from '@nestjs/common';
import * as TelegramBot from 'node-telegram-bot-api';
import { PrismaService } from 'src/shared/prisma/prisma.service';
import { ProductCategoryService } from '../product-category/product-category.service';
import { ProductService } from '../product/product.service';
import { UserService } from '../user/user.service';
import { ConfigService } from '@nestjs/config';
import { ReferralService } from '../referral/referral.service';
import { CryptoWalletService } from '../crypto-wallet/crypto-wallet.service';
import { CryptoType } from '@prisma/client';
import { WalletService } from '../wallet/wallet.service';
import { OrderService } from '../order/order.service';
import { CreateDepositRequestDto } from '../deposit-request/model/deposit-request.dto';
import { DepositRequestService } from '../deposit-request/deposit-request.service';

@Injectable()
export class TelegramService implements OnModuleInit {
  private bot: TelegramBot;
  private currentPage = new Map<number, number>();
  private usersInReferralProcess = new Map<number, boolean>();
  private awaitingReferralCode = new Map<number, boolean>();
  private awaitingWalletInput = new Map<
    number,
    { telegramId: string; type: CryptoType }
  >();

  constructor(
    private configService: ConfigService,
    private prisma: PrismaService,
    private userService: UserService,
    private referralService: ReferralService,
    private productCategoryService: ProductCategoryService,
    private productService: ProductService,
    private walletservice: WalletService,
    private orderservice: OrderService,
    private depositservice : DepositRequestService,
    private readonly cryptowalletService: CryptoWalletService,
  ) {
    this.bot = new TelegramBot(this.configService.get('TELEGRAM_BOT_TOKEN'), {
      polling: true,
    });
  }

  onModuleInit() {
    this.listenToTelegram();
  }

  private listenToTelegram() {
    this.bot.onText(/\/start/, this.handleStart.bind(this));
    this.bot.onText(/Shop/, this.handleShop.bind(this));
    this.bot.onText(/My Profile/, this.handleProfile.bind(this));
    this.bot.onText(/💰 Wallet/, this.handleUserWallet.bind(this));
    this.bot.onText(/My Order List/, this.handleMyOrderList.bind(this));

    this.bot.on('message', this.handleMessage.bind(this));
    this.bot.on('callback_query', this.handleCallbackQuery.bind(this));
  }

  private async handleStart(msg: TelegramBot.Message) {
    const chatId = msg.chat.id;
    const telegramId = msg.from.id.toString();
    const username = msg.from.username || `user_${telegramId}`;
    let isNewUser = false;
    try {
      await this.getUserByTelegramId(telegramId);
    } catch (error) {
      isNewUser = true;
    }

    if (isNewUser) {
      this.bot.sendMessage(chatId, '🤝 Do you have a referral code?', {
        reply_markup: {
          inline_keyboard: [
            [{ text: '✅ Yes', callback_data: `referral_yes_${telegramId}` }],
            [{ text: '❌ No', callback_data: `referral_no_${telegramId}` }],
          ],
        },
      });
    } else {
      this.sendMainMenu(chatId, username);
    }
  }

  private sendMainMenu(chatId: number, username: string) {
    this.bot.sendMessage(
      chatId,
      `👋 Welcome, *${username}*! Choose an option:`,
      {
        parse_mode: 'Markdown',
        reply_markup: {
          keyboard: [
            [{ text: '🛍️ Shop' }, { text: '👤 My Profile' }],
            [{ text: '📌 Get My Referral Code' }],
            [{ text: '💰 Wallet' }, { text: '📜 My Order List' }],
          ],
          resize_keyboard: true,
          one_time_keyboard: true,
        },
      },
    );
  }

  private async handleBuyProduct(
    chatId: number,
    telegramId: string,
    productId: string,
  ) {
    try {
      const user = await this.getUserByTelegramId(telegramId.toString());
      if (!user) {
        return this.sendMessage(
          chatId,
          '❌ User not found. Please start again with /start',
        );
      }
  
      const product = await this.getProductById(productId.toString());
      if (!product) {
        return this.sendMessage(
          chatId,
          '❌ Product not found or no longer available.',
        );
      }
      if (product.stock <= 0) {
        return this.sendMessage(
          chatId,
          '❌ Sorry, this product is out of stock.',
        );
      }
  
      const userWallet = await this.getUserWallet(telegramId.toString());
      if (userWallet.balance < product.price) {
        return this.handleInsufficientBalance(
          chatId,
          telegramId,
          product.price,
          userWallet.balance,
        );
      }
  
      const order = await this.createOrder(String(user.id), productId);
      await this.updateWalletBalance(
        String(user.id),
        userWallet.id,
        order.total,
      );
      await this.createPayment(order.id, order.total);
      await this.createTransaction(
        userWallet.id,
        String(user.id),
        order.id,
        order.total,
        product.name,
      );
  
      let message = `✅ Purchase successful! You bought ${product.name} for $${order.total.toFixed(2)}.`;
      if (order.productKey) {
        message += `\n🔑 Your product key: ${order.productKey}`;
      } else {
        message += `\n📦 Your product will be delivered shortly.`;
      }
  
      // Delete the previous message showing product details or list if necessary
      if (this.currentPage.has(chatId)) {
        const previousMessageId = this.currentPage.get(chatId);
        await this.bot.deleteMessage(chatId, previousMessageId);
      }
  
      this.sendMessage(chatId, message);
    } catch (error) {
      console.error('Error handling purchase:', error);
      this.sendMessage(
        chatId,
        '❌ An error occurred while processing your purchase. Please try again later.',
      );
    }
  }

  private async getUserByTelegramId(telegramId: string) {
    return await this.userService.getUserByTelegramId(telegramId);
  }

  private async getProductById(productId: string) {
    return await this.productService.getProductById(productId);
  }

  private async getUserWallet(telegramId: string) {
    return await this.walletservice.getWalletByTelegramId(telegramId);
  }

  private async handleInsufficientBalance(
    chatId: number,
    telegramId: string,
    productPrice: number,
    userBalance: number,
  ) {
    const message = `❌ Insufficient balance. You need $${productPrice.toFixed(2)} but have only $${userBalance.toFixed(2)}.`;
    const replyMarkup = {
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: '💰 Add Balance',
              callback_data: `add_balance_${telegramId}`,
            },
          ],
        ],
      },
    };
    return this.sendMessage(chatId, message, replyMarkup);
  }

  private async createOrder(userId: string, productId: string) {
    return await this.orderservice.createOrder({
      userId: String(userId),
      productId: productId,
      quantity: 1,
    });
  }

  private async updateWalletBalance(
    userId: string,
    walletId: string,
    amount: number,
  ) {
    await this.walletservice.updateWalletByUserId(String(userId), {
      balance:
        (await this.walletservice.getWalletById(walletId)).balance - amount,
    });
  }

  private async createPayment(orderId: string, amount: number) {
    return await this.prisma.payment.create({
      data: {
        orderId: orderId,
        amount: amount,
        method: 'WALLET',
        status: 'PENDING',
      },
    });
  }

  private async createTransaction(
    walletId: string,
    userId: string,
    orderId: string,
    amount: number,
    productName: string,
  ) {
    return await this.prisma.transaction.create({
      data: {
        walletId: String(walletId),
        userId: String(userId),
        amount: amount,
        type: 'PURCHASE',
        status: 'SUCCESS',
        description: `Purchase of ${productName}`,
        orderId: String(orderId),
      },
    });
  }

  private sendMessage(chatId: number, message: string, replyMarkup?: any) {
    return this.bot.sendMessage(chatId, message, replyMarkup);
  }

  private async handleReferralResponse(
    callbackQuery: TelegramBot.CallbackQuery,
  ) {
    const chatId = callbackQuery.message.chat.id;
    const data = callbackQuery.data;
    const telegramId = callbackQuery.from.id.toString();

    if (data.startsWith('referral_yes_')) {
      this.awaitingReferralCode.set(chatId, true);
      this.bot.sendMessage(
        chatId,
        '🔢 Please enter the referral code (Telegram ID):',
      );
    } else if (data.startsWith('referral_no_')) {
      await this.registerUser(chatId, telegramId);
    }

    this.bot.answerCallbackQuery(callbackQuery.id);
  }

  private async handleMessage(msg: TelegramBot.Message) {
    const chatId = msg.chat.id;
    const telegramId = msg.from.id.toString();
    if (this.awaitingWalletInput.has(chatId)) {
      const address = msg.text.trim();
      await this.saveWallet(chatId, address);
      return;
    }
    if (msg.text === '📌 Get My Referral Code') {
      await this.sendReferralCode(chatId, telegramId);
      return;
    }

    if (this.awaitingReferralCode.has(chatId)) {
      const referralCode = msg.text.trim();
      this.awaitingReferralCode.delete(chatId);

      try {
        const referrer = await this.getUserByTelegramId(referralCode);
        if (!referrer || !referrer.telegramId) {
          return this.bot.sendMessage(
            chatId,
            '❌ Invalid referral code. Proceeding without a referral.',
          );
        }
        const user = await this.registerUser(chatId, telegramId);

        let userId: string | undefined;

        if ('id' in user) {
          userId = user.id;
        } else if ('user' in user && 'id' in user.user) {
          userId = user.user.id;
        }

        if (!userId) {
          return this.bot.sendMessage(
            chatId,
            '❌ Error registering user. Please try again.',
          );
        }
        await this.referralService.createReferral({
          referredById: String(referrer.id),
          referredUserId: userId,
          rewardAmount: 0,
        });
        this.bot.sendMessage(
          chatId,
          '🎉 You have been referred successfully! Thank you for joining.',
        );
      } catch (error) {
        this.bot.sendMessage(
          chatId,
          '❌ Error processing referral. Please try again.',
        );
      }
    }
  }

  private async registerUser(chatId: number, telegramId: string) {
    const username = `user_${telegramId}`;
    const user = await this.userService.registerUser({
      telegramId,
      username,
      role: 'CUSTOMER',
    });

    this.bot.sendMessage(
      chatId,
      `👋 Welcome, to our Automated Bot! Choose an option:`,
      {
        parse_mode: 'Markdown',
        reply_markup: {
          keyboard: [[{ text: '🛍️ Shop' }, { text: '👤 My Profile' }]],
          resize_keyboard: true,
          one_time_keyboard: true,
        },
      },
    );

    return user;
  }

  private async handleShop(msg: TelegramBot.Message) {
    const chatId = msg.chat.id;
    this.currentPage.set(chatId, 1);
    await this.sendProductCategories(chatId, 1);
  }

  private async handleMyOrderList(msg: TelegramBot.Message) {
    const chatId = msg.chat.id;
    const telegramId = msg.from.id.toString();
    const page = 1; // Default to the first page
    const limit = 10; // Set a limit for the number of orders to fetch

    try {
      const ordersResponse = await this.orderservice.getOrdersByTelegramId(
        telegramId,
        page,
        limit,
      );
      const orders = ordersResponse.data;

      if (orders.length === 0) {
        this.bot.sendMessage(chatId, '📜 You have no orders yet.');
        return;
      }

      const orderMessages = orders
        .map((order) => {
          const deliveryType = order.product.autoDeliver
            ? 'Automatic Delivery'
            : 'Manual Delivery';
          return `🆔 Order ID: ${order.id}\n📦 Product: ${order.product.name}\n💲 Total: $${order.total.toFixed(2)}\n📅 Date: ${new Date(order.createdAt).toLocaleDateString()}`;
        })
        .join('\n\n');

      this.bot.sendMessage(chatId, `📜 Your Orders:\n\n${orderMessages}`);
    } catch (error) {
      console.error('Error fetching orders:', error);
      this.bot.sendMessage(
        chatId,
        '❌ An error occurred while fetching your orders. Please try again later.',
      );
    }
  }

  private async handleProfile(msg: TelegramBot.Message) {
    await this.sendUserProfile(msg.chat.id, msg.from.id.toString());
  }

  private async handleCallbackQuery(query: TelegramBot.CallbackQuery) {
    const chatId = query.message.chat.id;
    const telegramId = query.from.id.toString();
    const data = query.data;

    try {
      if (data.startsWith('add_balance_')) {
        this.handleAddBalance(chatId);
        return;
      }

      if (data.startsWith('my_wallets_')) {
        const page = parseInt(data.split('_')[2], 10);
        await this.sendUserWallets(chatId, telegramId, page);
        return;
      }

      if (data.startsWith('add_wallet_')) {
        await this.askWalletType(chatId, telegramId);
        return;
      }

      if (data.startsWith('wallet_type_')) {
        const type = data.split('_')[2] as CryptoType;
        await this.handleWalletAddressInput(chatId, telegramId, type);
        return;
      }

      if (data.startsWith('product_') && !data.includes('page')) {
        await this.handleProductDetails(query);
        return;
      }

      if (data.startsWith('back_to_products_')) {
        await this.handleBackToProducts(query);
        return;
      }

      if (data.startsWith('back_to_categories')) {
        await this.handleBackToCategories(chatId);
        return;
      }

      if (data.startsWith('buy_')) {
        await this.handleBuyProductCallback(query);
        return;
      }

      if (data.startsWith('get_referral_')) {
        await this.sendReferralCode(chatId, telegramId);
        return;
      }

      if (data.startsWith('my_referrals_')) {
        const page = parseInt(data.split('_')[2], 10) || 1;
        await this.sendUserReferrals(chatId, telegramId, page);
        return;
      }

      if (data.startsWith('referral_yes_') || data.startsWith('referral_no_')) {
        await this.handleReferralResponse(query);
        return;
      }

      if (data.startsWith('category_')) {
        const categoryId = data.split('_')[1];
        // this.currentPage.set(chatId, 1); // Commenting out to retain current page
        await this.sendProductsByCategory(chatId, categoryId, 1);
        return;
      }

      if (data.startsWith('categories_')) {
        const page = parseInt(data.split('_')[1], 10);
        await this.sendProductCategories(chatId, page);
        return;
      }

      if (data.startsWith('product_page_')) {
        const [_, categoryId, direction] = data.split('_');
        let currentPage = this.currentPage.get(chatId) || 1; // Retain current page
        currentPage =
          direction === 'next' ? currentPage + 1 : Math.max(1, currentPage - 1);
        // this.currentPage.set(chatId, currentPage); // Commenting out to retain current page
        await this.sendProductsByCategory(chatId, categoryId, currentPage);
        return;
      }

      this.bot.answerCallbackQuery(query.id);
    } catch (error) {
      console.error('Error handling callback query:', error);
      this.bot.sendMessage(
        chatId,
        'Sorry, an error occurred. Please try again later.',
      );
      this.bot.answerCallbackQuery(query.id, { text: 'An error occurred' });
    }
  }

  private async handleAddBalance(chatId: number): Promise<void> {
    const initialMessage = await this.bot.sendMessage(chatId, 'Please enter the amount you want to add:');
  
    const messageListener = this.bot.on('message', async (msg) => {
      const amount = parseFloat(msg.text.trim());
      console.log(`User  entered amount: ${amount}`);
  
      await this.bot.deleteMessage(chatId, initialMessage.message_id);
  
      if (isNaN(amount) || amount <= 0 || amount > 1000) {
        this.bot.sendMessage(chatId, '❌ Please enter a valid amount (greater than 0 and less than or equal to $1000).');
        return;
      }
  
      try {
        const telegramId = msg.from.id.toString();
        const user = await this.userService.getUserByTelegramId(telegramId);
        const createDto: CreateDepositRequestDto = {
          userId: user.id.toString(),
          amount: amount,
        };
  
        console.log(`Creating deposit request with DTO: ${JSON.stringify(createDto)}`);
        const response = await this.depositservice.createDepositRequest(createDto);
  
        if (response.paymentLink) {
          const paymentLink = response.paymentLink;
          this.bot.sendMessage(chatId, `Processing your request to add $${amount}...`);
          this.bot.sendMessage(
            chatId,
            `✅ Click the link below to proceed with the payment of $${amount}:\n${paymentLink}`,
            {
              reply_markup: {
                inline_keyboard: [
                  [
                    {
                      text: '💳 Proceed to Payment',
                      url: paymentLink,
                    },
                  ],
                  // [
                  //   {
                  //     text: '✅ Mark as Done',
                  //     callback_data: `mark_done_${telegramId}`,
                  //   },
                  // ],
                ],
              },
            },
          );
        } else {
          this.bot.sendMessage(chatId, '❌ Something went wrong. Please try again later.');
        }
      } catch (error) {
        console.error('Error processing add balance request:', error);
        this.bot.sendMessage(chatId, '❌ An error occurred while processing your request. Please try again later.');
      } finally {
        this.bot.off('message', messageListener); // Remove the listener after processing
      }
    });
  }
  
  private async handleMarkAsDone(callbackQuery: TelegramBot.CallbackQuery): Promise<void> {
    const chatId = callbackQuery.message.chat.id;
    const telegramId = callbackQuery.from.id.toString();
  
    // Optionally, you can perform any additional logic here, such as updating the user's status or logging the action.
  
    this.bot.sendMessage(chatId, '✅ Your payment will be processed shortly.');
    this.bot.answerCallbackQuery(callbackQuery.id);
  }

  private async handleProductDetails(query: TelegramBot.CallbackQuery): Promise<void> {
    const chatId = query.message.chat.id;
    const productId = query.data.split('_')[1];
  
    const product = await this.productService.getProductById(productId);
    if (!product) {
      this.bot.answerCallbackQuery(query.id, { text: 'Product not found' });
      return;
    }
  
    const categoryId = product.categoryId;
    const page = this.currentPage.get(chatId) || 1;
  
    const message = `
      📦 *Product Name:* 
      ${product.name}
  
      💲 *Price:* $${product.price.toFixed(2)} 
  
      🚚 *Auto Delivery:* ${product.autoDeliver ? 'Yes' : 'No'}
  
      📦 *Quantity in Stock:* ${product.stock}
    `;
  
    const keyboard = {
      inline_keyboard: [
        [{ text: '🛒 Buy Now', callback_data: `buy_${product.id}` }],
        [
          {
            text: '🔙 Go Back to Products',
            callback_data: `back_to_products_${categoryId}_${page}`,
          },
        ],
        [
          {
            text: '🏠 Back to Categories',
            callback_data: 'back_to_categories',
          },
        ],
      ],
    };
  
    if (this.currentPage.has(chatId)) {
      const previousMessageId = this.currentPage.get(chatId);
      await this.bot.deleteMessage(chatId, previousMessageId);
    }
  
    await this.bot.sendMessage(chatId, message, {
      parse_mode: 'Markdown',
      reply_markup: keyboard,
    });
  
    this.currentPage.set(chatId, query.message.message_id);
    this.bot.answerCallbackQuery(query.id);
  }

  private async handleBackToCategories(query: TelegramBot.CallbackQuery): Promise<void> {
    const chatId = query.message.chat.id;
  
    await this.bot.deleteMessage(chatId, query.message.message_id);
    
    await this.sendProductCategories(chatId, 1);
    this.bot.answerCallbackQuery(query.id);
  }

  private async handleBackToProducts(query: TelegramBot.CallbackQuery): Promise<void> {
    const parts = query.data.split('_');
    const categoryId = parts[3];
    const page = parseInt(parts[4], 10);
  
    await this.bot.deleteMessage(query.message.chat.id, query.message.message_id);
    
    await this.sendProductsByCategory(query.message.chat.id, categoryId, page);
    this.bot.answerCallbackQuery(query.id);
  }

  private async handleBuyProductCallback(query: any): Promise<void> {
    const productId = query.data.split('_')[1];
    await this.handleBuyProduct(
      query.message.chat.id,
      query.from.id.toString(),
      productId,
    );
    this.bot.answerCallbackQuery(query.id, {
      text: 'Processing your order...',
    });
  }

  private async sendReferralCode(chatId: number, telegramId: string) {
    try {
      const user = await this.getUserByTelegramId(telegramId);
      const referralCode = `${telegramId}`;

      const message = `
  🔗 <b>Your Referral Code:</b>
  <code>${referralCode}</code>
  
  📩 Share this code with your friends and earn rewards when they sign up using it!
  `;

      this.bot.sendMessage(chatId, message, { parse_mode: 'HTML' });
    } catch (error) {
      this.bot.sendMessage(
        chatId,
        '❌ <b>Error:</b> Unable to retrieve your referral code.',
        { parse_mode: 'HTML' },
      );
    }
  }

  private async sendUserReferrals(
    chatId: number,
    telegramId: string,
    page: number,
  ) {
    try {
      const response = await this.referralService.getAllReferralsByTelegramId(
        telegramId,
        page,
        10,
      );
      if (!response.data.length) {
        return this.bot.sendMessage(chatId, '❌ No referrals found.');
      }

      const message = response.data
        .map(
          (r, index) =>
            `#${index + 1} 🆔 ${r.id}\n👤 User: ${r.referredUserId}\n💰 Reward: ${r.rewardAmount}\n📅 ${new Date(r.createdAt).toLocaleDateString()}`,
        )
        .join('\n\n');

      this.bot.sendMessage(
        chatId,
        `📜 *Your Referrals (Page ${page})*:\n\n
        ${message}`,
        { parse_mode: 'Markdown' },
      );
    } catch (error) {
      this.bot.sendMessage(chatId, '❌ No referrals found.');
    }
  }

  private async sendProductCategories(chatId: number, page: number) {
    try {
      const response =
        await this.productCategoryService.getAllProductCategories(page, 5);
      if (!response.data.length) {
        return this.bot.sendMessage(chatId, '❌ No categories available.');
      }

      const buttons = response.data.map((category) => {
        return [
          {
            text: `${category.name} (${category.productCount})`,
            callback_data: `category_${category.id}`,
          },
        ];
      });

      if (page > 1 || page < response.pagination.totalPages) {
        buttons.push([
          ...(page > 1
            ? [{ text: '⬅️ Previous', callback_data: `categories_${page - 1}` }]
            : []),
          ...(page < response.pagination.totalPages
            ? [{ text: '➡️ Next', callback_data: `categories_${page + 1}` }]
            : []),
        ]);
      }

      const categoryMessage = await this.bot.sendMessage(
        chatId,
        `📋 *Categories - Page ${page}*`,
        {
          parse_mode: 'Markdown',
          reply_markup: { inline_keyboard: buttons },
        },
      );
      // eslint-disable-next-line @typescript-eslint/no-misused-promises
      setTimeout(async () => {
        await this.bot.deleteMessage(chatId, categoryMessage.message_id);
      }, 5000);
    } catch (error) {
      console.error('Error fetching categories:', error);
      this.bot.sendMessage(chatId, '❌ Error fetching categories.');
    }
  }

  private async sendProductsByCategory(
    chatId: number,
    categoryId: string,
    page: number,
  ) {
    try {
      const response = await this.productService.getProductsByCategoryId(
        categoryId,
        page,
        5,
      );
  
      if (!response.data.length) {
        return this.bot.sendMessage(chatId, '❌ No products in this category.');
      }
  
      const buttons = response.data.map((product) => [
        {
          text: product.name,
          callback_data: `product_${product.id}`,
        },
      ]);
  
      buttons.push([
        {
          text: '🔙 Back to Categories',
          callback_data: 'back_to_categories',
        },
      ]);
  
      if (page > 1 || page < response.pagination.totalPages) {
        buttons.push([
          ...(page > 1
            ? [
                {
                  text: '⬅️ Previous',
                  callback_data: `product_page_${categoryId}_prev`,
                },
              ]
            : []),
          ...(page < response.pagination.totalPages
            ? [
                {
                  text: '➡️ Next',
                  callback_data: `product_page_${categoryId}_next`,
                },
              ]
            : []),
        ]);
      }
  
      if (this.currentPage.has(chatId)) {
        const previousMessageId = this.currentPage.get(chatId);
        await this.bot.deleteMessage(chatId, previousMessageId);
      }
  
      const previousMessage = await this.bot.sendMessage(chatId, `🛒 *Products - Page ${page}*`, {
        parse_mode: 'Markdown',
        reply_markup: { inline_keyboard: buttons },
      });
  
      this.currentPage.set(chatId, previousMessage.message_id);
    } catch (error) {
      this.bot.sendMessage(chatId, '❌ Error fetching products.');
    }
  }

  private async sendUserProfile(chatId: number, telegramId: string) {
    try {
      const user = await this.getUserByTelegramId(telegramId);

      const message = `
  👤 <b>Your Profile</b>:
  
  🆔 <b>User ID:</b> <code>${user.telegramId}</code>
  📛 <b>Username:</b> ${user.username ? `@${user.username}` : 'N/A'}

  💰 <b>Wallet Balance:</b> $${user.balance.toFixed(2)}

  📦 <b>Total Orders:</b> ${user.orderCount}

  📅 <b>Joined:</b> ${new Date(user.createdAt).toLocaleDateString()}
  `;

      const options = {
        parse_mode: 'HTML',
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: '📌 Get My Referral Code',
                callback_data: `get_referral_${telegramId}`,
              },
            ],
            [{ text: '👥 My Referrals', callback_data: `my_referrals_1` }],
            [
              {
                text: '💳 My Refund Wallets',
                callback_data: `my_wallets_1_${telegramId}`,
              },
            ],
            [
              {
                text: '➕ Add Refund Wallet',
                callback_data: `add_wallet_${telegramId}`,
              },
            ],
          ],
        },
      };

      this.bot.sendMessage(chatId, message, options);
    } catch (error) {
      this.bot.sendMessage(chatId, '❌ Error fetching profile.', {
        parse_mode: 'HTML',
      });
    }
  }

  private async sendUserWallets(
    chatId: number,
    telegramId: string,
    page: number = 1,
  ) {
    try {
      const user = await this.getUserByTelegramId(telegramId);
      const userId = user.id;
      const walletsResponse =
        await this.cryptowalletService.getAllCryptoWalletsByUserIdentifier(
          String(userId),
          page,
          5,
        );
      const wallets = walletsResponse.data;

      if (!wallets || wallets.length === 0) {
        this.bot.sendMessage(chatId, '❌ No wallets found.', {
          parse_mode: 'HTML',
          reply_markup: {
            inline_keyboard: [
              [
                {
                  text: '➕ Add Wallet',
                  callback_data: `add_wallet_${telegramId}`,
                },
              ],
            ],
          },
        });
        return;
      }

      let message = `<b>💳 Your Wallets (Page ${walletsResponse.pagination.currentPage} of ${walletsResponse.pagination.totalPages})</b>\n\n`;

      wallets.forEach((wallet, index) => {
        message += `#${index + 1} - <b>${wallet.type}</b>\n<code>${wallet.address}</code>\n\n`;
      });

      const paginationButtons: { text: string; callback_data: string }[] = [];

      if (walletsResponse.pagination.currentPage > 1) {
        paginationButtons.push({
          text: '⬅️ Prev',
          callback_data: `my_wallets_${page - 1}_${telegramId}`,
        });
      }

      if (
        walletsResponse.pagination.currentPage <
        walletsResponse.pagination.totalPages
      ) {
        paginationButtons.push({
          text: '➡️ Next',
          callback_data: `my_wallets_${page + 1}_${telegramId}`,
        });
      }

      const options = {
        parse_mode: 'HTML',
        reply_markup: {
          inline_keyboard: [
            paginationButtons,
            [
              {
                text: '➕ Add Wallet',
                callback_data: `add_wallet_${telegramId}`,
              },
            ],
          ],
        },
      };
      this.bot.sendMessage(chatId, message, options);
    } catch (error) {
      this.bot.sendMessage(chatId, '❌ Error fetching wallets.', {
        parse_mode: 'HTML',
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: '➕ Add Wallet',
                callback_data: `add_wallet_${telegramId}`,
              },
            ],
          ],
        },
      });
    }
  }

  private async askWalletType(chatId: number, telegramId: string) {
    const options = {
      parse_mode: 'HTML',
      reply_markup: {
        inline_keyboard: Object.values(CryptoType).map((type) => [
          { text: type, callback_data: `wallet_type_${type}_${telegramId}` },
        ]),
      },
    };

    this.bot.sendMessage(chatId, '🛠 Select wallet type:', options);
  }

  private async handleWalletAddressInput(
    chatId: number,
    telegramId: string,
    type: CryptoType,
  ) {
    this.awaitingWalletInput.set(chatId, { telegramId, type });

    this.bot.sendMessage(chatId, '📥 Please enter your wallet address:', {
      parse_mode: 'HTML',
    });
  }

  private async saveWallet(chatId: number, address: string) {
    const walletInput = this.awaitingWalletInput.get(chatId);

    if (!walletInput) {
      return this.bot.sendMessage(
        chatId,
        '❌ Unexpected input. Please start again.',
      );
    }

    const { telegramId, type } = walletInput;
    this.awaitingWalletInput.delete(chatId);

    try {
      const user = await this.getUserByTelegramId(telegramId);

      await this.cryptowalletService.createCryptoWallet({
        type: type as CryptoType,
        address,
        userId: String(user.id),
      });

      this.bot.sendMessage(
        chatId,
        `✅ Wallet added successfully!\n\n<b>Type:</b> ${type}\n<b>Address:</b> <code>${address}</code>`,
        { parse_mode: 'HTML' },
      );
    } catch (error) {
      this.bot.sendMessage(
        chatId,
        '❌ Error adding wallet. Address may already exist.',
        { parse_mode: 'HTML' },
      );
    }
  }

  private async handleUserWallet(msg: TelegramBot.Message) {
    const chatId = msg.chat.id;
    const telegramId = msg.from.id.toString();
    
    try {
      const wallet = await this.walletservice.getWalletByTelegramId(telegramId);
      const balance = wallet.balance.toFixed(2).replace('.', '\\.');
      const userId = telegramId.replace(/([_*[\]()~`>#+\-=|{}.!\\])/g, '\\$1');
      const username = (wallet.username || 'N/A').replace(
        /([_*[\]()~`>#+\-=|{}.!\\])/g,
        '\\$1',
      );
      const telegramIdDisplay = (wallet.telegramId || 'N/A').replace(
        /([_*[\]()~`>#+\-=|{}.!\\])/g,
        '\\$1',
      );
  
      const message = `
  💰 *Your Wallet*:
  
  💲 *Balance:* $${balance}
  
  🔗 *Telegram ID:* ${telegramIdDisplay}
      `;
      const keyboard = {
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: 'Add Balance',
                callback_data: `add_balance_${telegramId}`,
              },
            ],
          ],
        },
      };
  
      if (this.currentPage.has(chatId)) {
        const previousMessageId = this.currentPage.get(chatId);
        await this.bot.deleteMessage(chatId, previousMessageId);
      }
  
      await this.bot.sendMessage(chatId, message, {
        parse_mode: 'MarkdownV2',
        reply_markup: keyboard.reply_markup,
      });
    } catch (error) {
      console.error(
        `Error fetching wallet information for user ${telegramId}:`,
        error,
      );
      this.bot.sendMessage(chatId, '❌ Error fetching wallet information.');
    }
  }
}

