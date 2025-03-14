/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { Injectable, OnModuleInit } from '@nestjs/common';
import * as TelegramBot from 'node-telegram-bot-api';
import { PrismaService } from 'src/shared/prisma/prisma.service';
import { ProductCategoryService } from '../product-category/product-category.service';
import { ProductService } from '../product/product.service';
import { UserService } from '../user/user.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class TelegramService implements OnModuleInit {
  private bot: TelegramBot;
  private currentPage: number = 1;
  private categoryPages: Map<number, { categoryId: string; page: number }> = new Map();

  constructor(
    private configService: ConfigService,
    private prisma: PrismaService,
    private userService: UserService,
    private productCategoryService: ProductCategoryService,
    private productService: ProductService,
  ) {
    this.bot = new TelegramBot(this.configService.get('TELEGRAM_BOT_TOKEN'), { polling: true });
  }

  onModuleInit() {
    this.listenToTelegram();
  }

  private listenToTelegram() {
    this.bot.onText(/\/start/, async (msg) => {
      const telegramId = msg.from.id.toString();
      const username = msg.from.username || `user_${telegramId}`;

      // Register user
      await this.userService.registerUser({
        telegramId,
        username,
        role: 'CUSTOMER',
      });

      this.bot.sendMessage(msg.chat.id, `Welcome, ${username}! Please choose an option:`, {
        reply_markup: {
          keyboard: [
            [{ text: 'Shop' }],
          ],
          resize_keyboard: true,
          one_time_keyboard: true,
        },
      });
    });

    this.bot.onText(/Shop/, async (msg) => {
      this.currentPage = 1;
      await this.sendProductCategories(msg.chat.id, this.currentPage);
    });

    this.bot.on('callback_query', async (query) => {
      const chatId = query.message.chat.id;
      const action = query.data;

      if (action.startsWith('category_')) {
        const categoryId = action.split('_')[1];
        this.categoryPages.set(chatId, { categoryId, page: 1 });
        await this.sendProductsByCategory(chatId, categoryId, 1);
      } else if (action.startsWith('product_page_')) {
        const [categoryId, direction] = action.split('_');
        let currentPage = this.categoryPages.get(chatId)?.page || 1;
        
        if (direction === 'next') {
          currentPage++;
        } else if (direction === 'prev' && currentPage > 1) {
          currentPage--;
        }

        this.categoryPages.set(chatId, { categoryId, page: currentPage });
        await this.sendProductsByCategory(chatId, categoryId, currentPage);
      } else if (action.startsWith('product_')) {
        const productId = action.split('_')[1];
        this.bot.sendMessage(chatId, `You selected product ID: ${productId}`);
      } else if (action === 'next') {
        this.currentPage++;
        await this.sendProductCategories(chatId, this.currentPage);
      } else if (action === 'prev') {
        if (this.currentPage > 1) {
          this.currentPage--;
        }
        await this.sendProductCategories(chatId, this.currentPage);
      }

      // Acknowledge the callback query
      this.bot.answerCallbackQuery(query.id);
    });
  }

  private async sendProductCategories(chatId: number, page: number) {
    const categoriesResponse = await this.productCategoryService.getAllProductCategories(page, 5); // 5 categories per page

    if (categoriesResponse.data.length === 0) {
      this.bot.sendMessage(chatId, 'No more categories available.');
      return;
    }

    const categoryButtons = categoriesResponse.data.map(category => [
      { text: category.name, callback_data: `category_${category.id}` }
    ]);

    const paginationMessage = `Page ${page} of ${categoriesResponse.pagination.totalPages}`;

    const replyMarkup = {
      inline_keyboard: [
        ...categoryButtons, // Add category buttons
        [
          { text: 'Next ➡️', callback_data: 'next' },
          { text: 'Previous ⬅️', callback_data: 'prev' },
        ],
      ],
    };

    this.bot.sendMessage(chatId, paginationMessage, {
      reply_markup: replyMarkup,
    });
  }

  private async sendProductsByCategory(chatId: number, categoryId: string, page: number) {
    const productsResponse = await this.productService.getProductsByCategoryId(categoryId, page, 5); // 5 products per page

    if (productsResponse.data.length === 0) {
      this.bot.sendMessage(chatId, 'No products available in this category.');
      return;
    }

    const productButtons = productsResponse.data.map(product => [
      { text: product.name, callback_data: `product_${product.id}` }
    ]);

    const paginationMessage = `Products in category (Page ${page} of ${productsResponse.pagination.totalPages})`;

    const replyMarkup = {
      inline_keyboard: [
        ...productButtons,
        [
          { text: 'Next ➡️', callback_data: `product_page_${categoryId}_next` },
          { text: 'Previous ⬅️', callback_data: `product_page_${categoryId}_prev` },
        ],
      ],
    };

    this.bot.sendMessage(chatId, paginationMessage, {
      reply_markup: replyMarkup,
    });
  }
}
