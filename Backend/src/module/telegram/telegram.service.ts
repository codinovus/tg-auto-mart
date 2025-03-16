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
    this.bot.on('callback_query', this.handleCallbackQuery.bind(this));
    this.bot.onText(/💰 Wallet/, this.handleUserWallet.bind(this));
    this.bot.on('message', this.handleMessage.bind(this));
    this.bot.on('callback_query', async (query) => {
      const chatId = query.message.chat.id;
      const telegramId = query.data.split('_')[2];
    
      if (query.data.startsWith('add_balance_')) {
        this.bot.sendMessage(chatId, 'Please enter the amount you want to add:');
      }
    });
    this.bot.on('callback_query', async (query) => {
      const chatId = query.message.chat.id;
      const telegramId = query.from.id.toString();
      const data = query.data;

      if (data.startsWith('my_wallets_')) {
        const parts = data.split('_');
        const page = parseInt(parts[2], 10);
        await this.sendUserWallets(chatId, telegramId, page);
      } else if (data.startsWith('add_wallet_')) {
        await this.askWalletType(chatId, telegramId);
      } else if (data.startsWith('wallet_type_')) {
        const parts = data.split('_');
        const type = parts[2] as CryptoType;
        await this.handleWalletAddressInput(chatId, telegramId, type);
      }
    });
  }

  private async handleStart(msg: TelegramBot.Message) {
    const chatId = msg.chat.id;
    const telegramId = msg.from.id.toString();
    const username = msg.from.username || `user_${telegramId}`;
    let isNewUser = false;
    try {
      await this.userService.getUserByTelegramId(telegramId);
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
            [{ text: '💰 Wallet' }],
          ],
          resize_keyboard: true,
          one_time_keyboard: true,
        },
      },
    );
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
        const referrer =
          await this.userService.getUserByTelegramId(referralCode);
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
          rewardAmount: 10,
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

  private async handleProfile(msg: TelegramBot.Message) {
    await this.sendUserProfile(msg.chat.id, msg.from.id.toString());
  }

  private async handleCallbackQuery(callbackQuery: TelegramBot.CallbackQuery) {
    const chatId = callbackQuery.message.chat.id;
    const data = callbackQuery.data;
    const telegramId = callbackQuery.from.id.toString();

    if (data.startsWith('get_referral_')) {
      await this.sendReferralCode(chatId, telegramId);
    } else if (data.startsWith('my_referrals_')) {
      const page = parseInt(data.split('_')[2], 10) || 1;
      await this.sendUserReferrals(chatId, telegramId, page);
    } else if (
      data.startsWith('referral_yes_') ||
      data.startsWith('referral_no_')
    ) {
      await this.handleReferralResponse(callbackQuery);
    } else if (data.startsWith('category_')) {
      const categoryId = data.split('_')[1];
      this.currentPage.set(chatId, 1);
      await this.sendProductsByCategory(chatId, categoryId, 1);
    } else if (data.startsWith('product_page_')) {
      const [_, categoryId, direction] = data.split('_');
      let currentPage = this.currentPage.get(chatId) || 1;
      currentPage =
        direction === 'next' ? currentPage + 1 : Math.max(1, currentPage - 1);
      this.currentPage.set(chatId, currentPage);
      await this.sendProductsByCategory(chatId, categoryId, currentPage);
    }

    this.bot.answerCallbackQuery(callbackQuery.id);
  }

  private async sendReferralCode(chatId: number, telegramId: string) {
    try {
      const user = await this.userService.getUserByTelegramId(telegramId);
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
      this.bot.sendMessage(chatId, '❌ Error fetching referrals.');
    }
  }

  private async sendProductCategories(chatId: number, page: number) {
    try {
      const response =
        await this.productCategoryService.getAllProductCategories(page, 5);
      if (!response.data.length) {
        return this.bot.sendMessage(chatId, '❌ No categories available.');
      }

      const buttons = response.data.map((category) => [
        {
          text: `${category.name} (${category.productCount})`,
          callback_data: `category_${category.id}`,
        },
      ]);
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

      this.bot.sendMessage(chatId, `📋 *Categories - Page ${page}*`, {
        parse_mode: 'Markdown',
        reply_markup: { inline_keyboard: buttons },
      });
    } catch (error) {
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

      await this.bot.sendMessage(chatId, `🛒 *Products - Page ${page}*`, {
        parse_mode: 'Markdown',
        reply_markup: { inline_keyboard: buttons },
      });

      this.bot.on('callback_query', async (query) => {
        const productId = query.data.split('_')[1];
        const product = response.data.find((p) => p.id === productId);

        if (product) {
          const message = `
            📦 *Product Name:* 
            ${product.name}

            💲 *Price:* $${product.price.toFixed(2)} 

            🚚 *Auto Delivery:* ${product.autoDeliver}

            📦 *Quantity in Stock:* ${product.stock}
          `;

          const buyNowButton = {
            text: '🛒 Buy Now',
            callback_data: `buy_${product.id}`,
          };

          const goBackButton = {
            text: '🔙 Go Back',
            callback_data: `back_to_products_${categoryId}_${page}`,
          };

          await this.bot.sendMessage(query.message.chat.id, message, {
            parse_mode: 'Markdown',
            reply_markup: {
              inline_keyboard: [[buyNowButton], [goBackButton]],
            },
          });
        }
        this.bot.answerCallbackQuery(query.id);
      });

      this.bot.on('callback_query', async (query) => {
        if (query.data.startsWith('back_to_products_')) {
          await this.sendProductsByCategory(
            query.message.chat.id,
            categoryId,
            page,
          );
        }
      });
    } catch (error) {
      this.bot.sendMessage(chatId, '❌ Error fetching products.');
    }
  }

  private async sendUserProfile(chatId: number, telegramId: string) {
    try {
      const user = await this.userService.getUserByTelegramId(telegramId);

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
      const user = await this.userService.getUserByTelegramId(telegramId);
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
      const user = await this.userService.getUserByTelegramId(telegramId);

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
  
    console.log(
      `Received request for wallet information from user: ${telegramId}`,
    );
  
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
      this.bot.sendMessage(chatId, message, {
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
