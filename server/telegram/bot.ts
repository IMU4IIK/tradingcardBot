import TelegramBot from 'node-telegram-bot-api';
import { storage } from '../storage';
import { refreshCardPrices } from '../api/cardService';

export class CardBot {
  private bot: TelegramBot;
  private initialized: boolean = false;

  constructor() {
    const token = process.env.7735096092:AAFedR-bOOi7L-N54C5XyShBnrIN2bsPiCg;
    const isDevelopment = process.env.NODE_ENV === 'development';
    
    if (!token) {
      console.warn('TELEGRAM_BOT_TOKEN not provided - bot functionality will be limited');
      // In development, create a mock bot instance
      if (isDevelopment) {
        this.bot = {} as TelegramBot;
        this.initialized = false;
        return;
      } else {
        console.error('TELEGRAM_BOT_TOKEN required in production');
        return;
      }
    }

    try {
      this.bot = new TelegramBot(token, { polling: true });
      this.initialized = true;
      this.setupCommands();
      console.log('Telegram bot initialized successfully');
    } catch (error) {
      console.error('Failed to initialize Telegram bot:', error);
      this.bot = {} as TelegramBot;
      this.initialized = false;
    }
  }

  private setupCommands() {
    if (!this.initialized) return;

    // Start command
    this.bot.onText(/\/start/, (msg) => {
      const chatId = msg.chat.id;
      this.bot.sendMessage(
        chatId, 
        `Welcome to CardBot! 🃏\n\nI can help you track market prices for trading cards. Try these commands:\n
/search [card name] - Search for a card
/price [card name] - Get current price for a card
/trend [card name] - View price trend for a card
/top [category] - View top trending cards in a category
/help - List all commands
        `
      );
    });

    // Help command
    this.bot.onText(/\/help/, (msg) => {
      const chatId = msg.chat.id;
      this.bot.sendMessage(
        chatId, 
        `CardBot Commands:\n
/search [card name] - Search for a card
/price [card name] - Get current price for a card
/trend [card name] - View price trend for a card
/watch [card name] - Add a card to your watchlist
/top [category] - View top trending cards in a category
/categories - List all card categories
/help - Show this help message
        `
      );
    });

    // Categories command
    this.bot.onText(/\/categories/, async (msg) => {
      const chatId = msg.chat.id;
      
      try {
        const categories = await storage.getAllCategories();
        const categoryList = categories.map(cat => `• ${cat.displayName}`).join('\n');
        
        this.bot.sendMessage(
          chatId, 
          `Available card categories:\n\n${categoryList}`
        );
      } catch (error) {
        this.bot.sendMessage(
          chatId, 
          'Error fetching categories. Please try again later.'
        );
      }
    });

    // Search command
    this.bot.onText(/\/search (.+)/, async (msg, match) => {
      const chatId = msg.chat.id;
      
      if (!match || !match[1]) {
        this.bot.sendMessage(chatId, 'Please provide a card name to search for.');
        return;
      }
      
      const query = match[1].trim();
      
      try {
        const results = await storage.searchCards(query);
        
        if (results.length === 0) {
          this.bot.sendMessage(chatId, `No cards found for "${query}"`);
          return;
        }
        
        const topResults = results.slice(0, 5); // Limit to 5 results
        let message = `Found ${results.length} cards matching "${query}":\n\n`;
        
        topResults.forEach((card, index) => {
          message += `${index + 1}. ${card.name} (${card.category.displayName})\n`;
          message += `   Set: ${card.setName || 'N/A'}\n`;
          message += `   Price: $${card.currentPrice.toFixed(2)}\n\n`;
        });
        
        if (results.length > 5) {
          message += `...and ${results.length - 5} more results.`;
        }
        
        this.bot.sendMessage(chatId, message);
      } catch (error) {
        this.bot.sendMessage(
          chatId, 
          'Error searching for cards. Please try again later.'
        );
      }
    });

    // Price command
    this.bot.onText(/\/price (.+)/, async (msg, match) => {
      const chatId = msg.chat.id;
      
      if (!match || !match[1]) {
        this.bot.sendMessage(chatId, 'Please provide a card name to get the price.');
        return;
      }
      
      const query = match[1].trim();
      
      try {
        const results = await storage.searchCards(query);
        
        if (results.length === 0) {
          this.bot.sendMessage(chatId, `No cards found for "${query}"`);
          return;
        }
        
        const card = results[0]; // Get the most relevant result
        const latestPrice = await storage.getLatestPrice(card.id);
        
        if (!latestPrice) {
          this.bot.sendMessage(chatId, `Price information not available for ${card.name}`);
          return;
        }
        
        let message = `📊 Price for ${card.name}:\n\n`;
        message += `Current Price: $${latestPrice.price.toFixed(2)}\n`;
        
        if (latestPrice.percentChange) {
          const changeSymbol = latestPrice.percentChange > 0 ? '📈' : '📉';
          message += `Price Change: ${changeSymbol} ${latestPrice.percentChange.toFixed(2)}%\n`;
        }
        
        message += `\nCategory: ${card.category.name}\n`;
        message += `Set: ${card.setName || 'N/A'}\n`;
        message += `Rarity: ${card.rarityName || 'N/A'}\n`;
        
        this.bot.sendMessage(chatId, message);
      } catch (error) {
        this.bot.sendMessage(
          chatId, 
          'Error fetching card price. Please try again later.'
        );
      }
    });

    // Trend command
    this.bot.onText(/\/trend (.+)/, async (msg, match) => {
      const chatId = msg.chat.id;
      
      if (!match || !match[1]) {
        this.bot.sendMessage(chatId, 'Please provide a card name to get the trend.');
        return;
      }
      
      const query = match[1].trim();
      
      try {
        const results = await storage.searchCards(query);
        
        if (results.length === 0) {
          this.bot.sendMessage(chatId, `No cards found for "${query}"`);
          return;
        }
        
        const card = results[0]; // Get the most relevant result
        const priceHistory = await storage.getPriceHistory(card.id, 30);
        
        if (priceHistory.length < 2) {
          this.bot.sendMessage(chatId, `Not enough price history available for ${card.name}`);
          return;
        }
        
        const oldestPrice = priceHistory[0];
        const newestPrice = priceHistory[priceHistory.length - 1];
        const priceDiff = newestPrice.price - oldestPrice.price;
        const percentChange = (priceDiff / oldestPrice.price) * 100;
        
        let message = `📈 Price Trend for ${card.name}:\n\n`;
        message += `30 Days Ago: $${oldestPrice.price.toFixed(2)}\n`;
        message += `Current Price: $${newestPrice.price.toFixed(2)}\n`;
        message += `30-Day Change: ${percentChange > 0 ? '+' : ''}${percentChange.toFixed(2)}%\n\n`;
        
        // Simple ASCII chart
        message += `Price Trend (Last 30 Days):\n`;
        
        // Calculate min and max for scaling
        const prices = priceHistory.map(p => p.price);
        const min = Math.min(...prices);
        const max = Math.max(...prices);
        const range = max - min;
        
        // Create a simple 5-line ASCII chart
        const chartHeight = 5;
        const charWidth = Math.min(30, priceHistory.length);
        
        const chart = Array(chartHeight).fill('').map(() => Array(charWidth).fill(' '));
        
        for (let i = 0; i < charWidth; i++) {
          const idx = Math.floor(i * priceHistory.length / charWidth);
          const price = priceHistory[idx].price;
          const normalizedHeight = Math.floor((price - min) / range * (chartHeight - 1));
          
          chart[chartHeight - 1 - normalizedHeight][i] = '*';
        }
        
        message += '```\n';
        chart.forEach(line => {
          message += line.join('') + '\n';
        });
        message += '```\n';
        
        message += `Min: $${min.toFixed(2)} | Max: $${max.toFixed(2)}\n`;
        
        this.bot.sendMessage(chatId, message, { parse_mode: 'Markdown' });
      } catch (error) {
        this.bot.sendMessage(
          chatId, 
          'Error fetching card trend. Please try again later.'
        );
      }
    });

    // Top cards command
    this.bot.onText(/\/top(?:\s+(.+))?/, async (msg, match) => {
      const chatId = msg.chat.id;
      const categoryName = match && match[1] ? match[1].trim().toLowerCase() : '';
      
      try {
        // If category specified, get cards for that category
        let topCards;
        let categoryTitle = '';
        
        if (categoryName) {
          const category = await storage.getCategoryByCode(categoryName);
          if (!category) {
            this.bot.sendMessage(
              chatId, 
              `Category "${categoryName}" not found. Try /categories to see available options.`
            );
            return;
          }
          
          topCards = await storage.getCardsByCategoryId(category.id, 5);
          categoryTitle = category.displayName;
        } else {
          // Otherwise get top gainers across all categories
          topCards = await storage.getTopGainers(5);
          categoryTitle = 'All Categories';
        }
        
        if (topCards.length === 0) {
          this.bot.sendMessage(chatId, `No top cards found`);
          return;
        }
        
        let message = `🏆 Top Cards (${categoryTitle}):\n\n`;
        
        topCards.forEach((card, index) => {
          message += `${index + 1}. ${card.name}\n`;
          message += `   Price: $${card.currentPrice.toFixed(2)}\n`;
          
          if ('percentChange' in card) {
            const changeSymbol = card.percentChange > 0 ? '📈' : '📉';
            message += `   Change: ${changeSymbol} ${card.percentChange.toFixed(2)}%\n`;
          }
          
          message += '\n';
        });
        
        this.bot.sendMessage(chatId, message);
      } catch (error) {
        this.bot.sendMessage(
          chatId, 
          'Error fetching top cards. Please try again later.'
        );
      }
    });

    // Watch command (to add card to favorites)
    this.bot.onText(/\/watch (.+)/, async (msg, match) => {
      const chatId = msg.chat.id;
      const telegramId = msg.from?.id.toString();
      
      if (!telegramId) {
        this.bot.sendMessage(chatId, 'Could not identify user.');
        return;
      }
      
      if (!match || !match[1]) {
        this.bot.sendMessage(chatId, 'Please provide a card name to watch.');
        return;
      }
      
      const query = match[1].trim();
      
      try {
        // First check if the user exists
        let user = await storage.getUserByTelegramId(telegramId);
        
        // If not, create a new user
        if (!user) {
          const username = msg.from?.username || `user_${telegramId}`;
          user = await storage.createUser({
            username,
            password: 'telegram_auth', // Placeholder password for Telegram users
            telegramId
          });
        }
        
        // Now search for the card
        const results = await storage.searchCards(query);
        
        if (results.length === 0) {
          this.bot.sendMessage(chatId, `No cards found for "${query}"`);
          return;
        }
        
        const card = results[0]; // Get the most relevant result
        
        // Check if already in favorites
        const isFavorite = await storage.isFavorite(user.id, card.id);
        
        if (isFavorite) {
          this.bot.sendMessage(chatId, `${card.name} is already in your watchlist.`);
          return;
        }
        
        // Add to favorites
        await storage.addFavorite({
          userId: user.id,
          cardId: card.id
        });
        
        this.bot.sendMessage(
          chatId, 
          `✅ Added ${card.name} to your watchlist.\n\nCurrent price: $${card.currentPrice.toFixed(2)}`
        );
      } catch (error) {
        this.bot.sendMessage(
          chatId, 
          'Error adding card to watchlist. Please try again later.'
        );
      }
    });

    // Handle errors
    this.bot.on('polling_error', (error) => {
      console.error('Telegram bot polling error:', error);
    });

    console.log('Telegram bot is running...');
  }

  public async sendPriceAlert(telegramId: string, cardName: string, oldPrice: number, newPrice: number) {
    if (!this.initialized) return;
    
    try {
      const change = ((newPrice - oldPrice) / oldPrice) * 100;
      const changeSymbol = change > 0 ? '📈' : '📉';
      
      const message = `🚨 Price Alert!\n\n${cardName}\n${changeSymbol} ${Math.abs(change).toFixed(2)}%\nOld price: $${oldPrice.toFixed(2)}\nNew price: $${newPrice.toFixed(2)}`;
      
      await this.bot.sendMessage(telegramId, message);
    } catch (error) {
      console.error('Error sending price alert:', error);
    }
  }

  public async sendMarketUpdate(telegramId: string) {
    if (!this.initialized) return;
    
    try {
      const topGainers = await storage.getTopGainers(3);
      const topFallers = await storage.getTopFallers(3);
      
      let message = `📊 Daily Market Update\n\n`;
      
      message += `📈 Top Gainers:\n`;
      topGainers.forEach((card, i) => {
        message += `${i+1}. ${card.name}: +${card.percentChange.toFixed(2)}% ($${card.currentPrice.toFixed(2)})\n`;
      });
      
      message += `\n📉 Top Fallers:\n`;
      topFallers.forEach((card, i) => {
        message += `${i+1}. ${card.name}: ${card.percentChange.toFixed(2)}% ($${card.currentPrice.toFixed(2)})\n`;
      });
      
      await this.bot.sendMessage(telegramId, message);
    } catch (error) {
      console.error('Error sending market update:', error);
    }
  }
}

let botInstance: CardBot | null = null;

export function initializeBot() {
  if (!botInstance) {
    botInstance = new CardBot();
  }
  return botInstance;
}

export function getBot() {
  return botInstance;
}
