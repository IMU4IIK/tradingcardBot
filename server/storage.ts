import { 
  users, type User, type InsertUser, 
  cardCategories, type CardCategory, type InsertCardCategory, 
  cards, type Card, type InsertCard, 
  cardPrices, type CardPrice, type InsertCardPrice,
  favorites, type Favorite, type InsertFavorite,
  recentlyViewed, type RecentlyViewed, type InsertRecentlyViewed,
  type CardWithPrice, type CardWithDetails, type MarketTrend
} from "@shared/schema";

export interface IStorage {
  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByTelegramId(telegramId: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Card Categories
  getAllCategories(): Promise<CardCategory[]>;
  getCategoryById(id: number): Promise<CardCategory | undefined>;
  getCategoryByCode(code: string): Promise<CardCategory | undefined>;
  createCategory(category: InsertCardCategory): Promise<CardCategory>;

  // Cards
  getCardById(id: number): Promise<Card | undefined>;
  searchCards(query: string, categoryId?: number, filters?: any): Promise<CardWithPrice[]>;
  createCard(card: InsertCard): Promise<Card>;
  updateCard(id: number, card: Partial<InsertCard>): Promise<Card | undefined>;
  getCardsByCategoryId(categoryId: number, limit?: number): Promise<CardWithPrice[]>;
  getCardDetails(cardId: number): Promise<CardWithDetails | undefined>;

  // Card Prices
  getLatestPrice(cardId: number): Promise<CardPrice | undefined>;
  getPriceHistory(cardId: number, days?: number): Promise<CardPrice[]>;
  addCardPrice(price: InsertCardPrice): Promise<CardPrice>;
  
  // Market Trends
  getTopGainers(limit?: number): Promise<MarketTrend[]>;
  getTopFallers(limit?: number): Promise<MarketTrend[]>;
  getMostViewed(limit?: number): Promise<MarketTrend[]>;
  
  // Favorites
  getFavorites(userId: number): Promise<CardWithPrice[]>;
  addFavorite(favorite: InsertFavorite): Promise<Favorite>;
  removeFavorite(userId: number, cardId: number): Promise<boolean>;
  isFavorite(userId: number, cardId: number): Promise<boolean>;
  
  // Recently Viewed
  getRecentlyViewed(userId: number, limit?: number): Promise<CardWithPrice[]>;
  addRecentlyViewed(viewed: InsertRecentlyViewed): Promise<RecentlyViewed>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private categories: Map<number, CardCategory>;
  private cards: Map<number, Card>;
  private cardPrices: Map<number, CardPrice[]>;
  private userFavorites: Map<number, Favorite[]>;
  private userRecentlyViewed: Map<number, RecentlyViewed[]>;
  private currentUserId: number;
  private currentCategoryId: number;
  private currentCardId: number;
  private currentPriceId: number;
  private currentFavoriteId: number;
  private currentViewedId: number;

  constructor() {
    this.users = new Map();
    this.categories = new Map();
    this.cards = new Map();
    this.cardPrices = new Map();
    this.userFavorites = new Map();
    this.userRecentlyViewed = new Map();
    this.currentUserId = 1;
    this.currentCategoryId = 1;
    this.currentCardId = 1;
    this.currentPriceId = 1;
    this.currentFavoriteId = 1;
    this.currentViewedId = 1;

    // Initialize with default card categories
    this.initializeDefaultData();
  }

  private initializeDefaultData() {
    // Initialize card categories
    const categories: InsertCardCategory[] = [
      { 
        name: "Pokémon",
        code: "pokemon",
        displayName: "Pokémon",
        iconName: "dragon",
        colorCode: "#EE8130" 
      },
      { 
        name: "Yu-Gi-Oh!",
        code: "yugioh", 
        displayName: "Yu-Gi-Oh!",
        iconName: "chess-king",
        colorCode: "#7F3FBF" 
      },
      { 
        name: "Trading Card Game",
        code: "tcg", 
        displayName: "TCG",
        iconName: "fire",
        colorCode: "#4592C4" 
      },
      { 
        name: "Topps",
        code: "topps", 
        displayName: "Topps",
        iconName: "baseball-ball",
        colorCode: "#D32F2F" 
      }
    ];

    categories.forEach(category => {
      this.createCategory(category);
    });
  }

  // Users
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }

  async getUserByTelegramId(telegramId: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.telegramId === telegramId);
  }

  async createUser(user: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const newUser: User = { 
      ...user, 
      id,
      telegramId: user.telegramId || null 
    };
    this.users.set(id, newUser);
    return newUser;
  }

  // Card Categories
  async getAllCategories(): Promise<CardCategory[]> {
    return Array.from(this.categories.values());
  }

  async getCategoryById(id: number): Promise<CardCategory | undefined> {
    return this.categories.get(id);
  }

  async getCategoryByCode(code: string): Promise<CardCategory | undefined> {
    return Array.from(this.categories.values()).find(category => category.code === code);
  }

  async createCategory(category: InsertCardCategory): Promise<CardCategory> {
    const id = this.currentCategoryId++;
    const newCategory = { ...category, id };
    this.categories.set(id, newCategory);
    return newCategory;
  }

  // Cards
  async getCardById(id: number): Promise<Card | undefined> {
    return this.cards.get(id);
  }

  async searchCards(query: string, categoryId?: number, filters?: any): Promise<CardWithPrice[]> {
    let matchedCards = Array.from(this.cards.values()).filter(card => {
      let match = card.name.toLowerCase().includes(query.toLowerCase());
      if (categoryId !== undefined) {
        match = match && card.categoryId === categoryId;
      }
      // Add additional filter logic here
      return match;
    });

    return Promise.all(
      matchedCards.map(async card => {
        const latestPrice = await this.getLatestPrice(card.id);
        const category = await this.getCategoryById(card.categoryId);
        return {
          ...card,
          currentPrice: latestPrice?.price || 0,
          priceChange: latestPrice?.marketChange || 0,
          percentChange: latestPrice?.percentChange || 0,
          category: category!
        };
      })
    );
  }

  async createCard(card: InsertCard): Promise<Card> {
    const id = this.currentCardId++;
    const newCard: Card = { 
      ...card, 
      id,
      type: card.type || null,
      setName: card.setName || null,
      rarityName: card.rarityName || null,
      cardNumber: card.cardNumber || null,
      imageUrl: card.imageUrl || null,
      releaseDate: card.releaseDate || null,
      description: card.description || null,
      illustrator: card.illustrator || null,
      additionalInfo: card.additionalInfo || null
    };
    this.cards.set(id, newCard);
    return newCard;
  }

  async updateCard(id: number, card: Partial<InsertCard>): Promise<Card | undefined> {
    const existingCard = this.cards.get(id);
    if (!existingCard) return undefined;

    const updatedCard = { ...existingCard, ...card };
    this.cards.set(id, updatedCard);
    return updatedCard;
  }

  async getCardsByCategoryId(categoryId: number, limit: number = 10): Promise<CardWithPrice[]> {
    const categoryCards = Array.from(this.cards.values())
      .filter(card => card.categoryId === categoryId)
      .slice(0, limit);

    return Promise.all(
      categoryCards.map(async card => {
        const latestPrice = await this.getLatestPrice(card.id);
        const category = await this.getCategoryById(card.categoryId);
        return {
          ...card,
          currentPrice: latestPrice?.price || 0,
          priceChange: latestPrice?.marketChange || 0,
          percentChange: latestPrice?.percentChange || 0,
          category: category!
        };
      })
    );
  }

  async getCardDetails(cardId: number): Promise<CardWithDetails | undefined> {
    const card = await this.getCardById(cardId);
    if (!card) return undefined;

    const priceHistory = await this.getPriceHistory(cardId);
    const latestPrice = await this.getLatestPrice(cardId);
    const category = await this.getCategoryById(card.categoryId);

    if (!latestPrice || !category) return undefined;

    // Calculate high, low, and average prices
    const sortedPrices = [...priceHistory].sort((a, b) => b.price - a.price);
    const highestPrice = sortedPrices[0] || latestPrice;
    const lowestPrice = sortedPrices[sortedPrices.length - 1] || latestPrice;
    const averagePrice = priceHistory.reduce((sum, price) => sum + price.price, 0) / 
                          (priceHistory.length || 1);

    return {
      ...card,
      currentPrice: latestPrice.price,
      priceChange: latestPrice.marketChange || 0,
      percentChange: latestPrice.percentChange || 0,
      category: category,
      priceHistory: priceHistory,
      highestPrice: highestPrice,
      lowestPrice: lowestPrice,
      averagePrice: averagePrice
    };
  }

  // Card Prices
  async getLatestPrice(cardId: number): Promise<CardPrice | undefined> {
    const prices = this.cardPrices.get(cardId) || [];
    if (prices.length === 0) return undefined;
    
    // Sort by timestamp descending and get the first one
    return [...prices].sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    )[0];
  }

  async getPriceHistory(cardId: number, days: number = 30): Promise<CardPrice[]> {
    const prices = this.cardPrices.get(cardId) || [];
    if (days <= 0) return prices;

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    return prices.filter(price => 
      new Date(price.timestamp).getTime() >= cutoffDate.getTime()
    ).sort((a, b) => 
      new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );
  }

  async addCardPrice(price: InsertCardPrice): Promise<CardPrice> {
    const id = this.currentPriceId++;
    const newPrice: CardPrice = { 
      ...price, 
      id,
      timestamp: price.timestamp || new Date(),
      source: price.source || null,
      marketChange: price.marketChange || null,
      percentChange: price.percentChange || null
    };
    
    if (!this.cardPrices.has(price.cardId)) {
      this.cardPrices.set(price.cardId, []);
    }
    
    this.cardPrices.get(price.cardId)!.push(newPrice);
    return newPrice;
  }

  // Market Trends
  async getTopGainers(limit: number = 3): Promise<MarketTrend[]> {
    const allCards = Array.from(this.cards.values());
    const cardsWithPrices = await Promise.all(
      allCards.map(async card => {
        const latestPrice = await this.getLatestPrice(card.id);
        const category = await this.getCategoryById(card.categoryId);
        if (!latestPrice || !category) return null;

        return {
          cardId: card.id,
          name: card.name,
          categoryId: card.categoryId,
          categoryName: category.name,
          currentPrice: latestPrice.price,
          priceChange: latestPrice.marketChange || 0,
          percentChange: latestPrice.percentChange || 0
        };
      })
    );

    // Filter out nulls and sort by percentChange descending
    const filteredCards = cardsWithPrices.filter(Boolean) as MarketTrend[];
    return filteredCards
      .sort((a, b) => b.percentChange - a.percentChange)
      .slice(0, limit);
  }

  async getTopFallers(limit: number = 3): Promise<MarketTrend[]> {
    const allCards = Array.from(this.cards.values());
    const cardsWithPrices = await Promise.all(
      allCards.map(async card => {
        const latestPrice = await this.getLatestPrice(card.id);
        const category = await this.getCategoryById(card.categoryId);
        if (!latestPrice || !category) return null;

        return {
          cardId: card.id,
          name: card.name,
          categoryId: card.categoryId,
          categoryName: category.name,
          currentPrice: latestPrice.price,
          priceChange: latestPrice.marketChange || 0,
          percentChange: latestPrice.percentChange || 0
        };
      })
    );

    // Filter out nulls and sort by percentChange ascending
    const filteredCards = cardsWithPrices.filter(Boolean) as MarketTrend[];
    return filteredCards
      .sort((a, b) => a.percentChange - b.percentChange)
      .slice(0, limit);
  }

  async getMostViewed(limit: number = 3): Promise<MarketTrend[]> {
    // Group recently viewed by cardId and count occurrences
    const viewCounts = new Map<number, number>();
    
    Array.from(this.userRecentlyViewed.values()).flat().forEach(view => {
      const count = viewCounts.get(view.cardId) || 0;
      viewCounts.set(view.cardId, count + 1);
    });

    // Get the most viewed cards
    const mostViewedCardIds = [...viewCounts.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(([cardId]) => cardId);

    // Get card details for these ids
    const cardsWithTrends = await Promise.all(
      mostViewedCardIds.map(async cardId => {
        const card = await this.getCardById(cardId);
        if (!card) return null;

        const latestPrice = await this.getLatestPrice(cardId);
        const category = await this.getCategoryById(card.categoryId);
        if (!latestPrice || !category) return null;

        return {
          cardId: card.id,
          name: card.name,
          categoryId: card.categoryId,
          categoryName: category.name,
          currentPrice: latestPrice.price,
          priceChange: latestPrice.marketChange || 0,
          percentChange: latestPrice.percentChange || 0,
          viewCount: viewCounts.get(cardId)
        };
      })
    );

    return cardsWithTrends.filter(Boolean) as MarketTrend[];
  }

  // Favorites
  async getFavorites(userId: number): Promise<CardWithPrice[]> {
    const userFavs = this.userFavorites.get(userId) || [];
    
    return Promise.all(
      userFavs.map(async fav => {
        const card = await this.getCardById(fav.cardId);
        if (!card) throw new Error(`Card not found: ${fav.cardId}`);
        
        const latestPrice = await this.getLatestPrice(card.id);
        const category = await this.getCategoryById(card.categoryId);
        if (!category) throw new Error(`Category not found: ${card.categoryId}`);
        
        return {
          ...card,
          currentPrice: latestPrice?.price || 0,
          priceChange: latestPrice?.marketChange || 0,
          percentChange: latestPrice?.percentChange || 0,
          category: category
        };
      })
    );
  }

  async addFavorite(favorite: InsertFavorite): Promise<Favorite> {
    const id = this.currentFavoriteId++;
    const newFavorite = { 
      ...favorite, 
      id, 
      addedAt: new Date() 
    };
    
    if (!this.userFavorites.has(favorite.userId)) {
      this.userFavorites.set(favorite.userId, []);
    }
    
    this.userFavorites.get(favorite.userId)!.push(newFavorite);
    return newFavorite;
  }

  async removeFavorite(userId: number, cardId: number): Promise<boolean> {
    const userFavs = this.userFavorites.get(userId);
    if (!userFavs) return false;
    
    const initialLength = userFavs.length;
    const filteredFavs = userFavs.filter(fav => fav.cardId !== cardId);
    
    if (filteredFavs.length === initialLength) return false;
    
    this.userFavorites.set(userId, filteredFavs);
    return true;
  }

  async isFavorite(userId: number, cardId: number): Promise<boolean> {
    const userFavs = this.userFavorites.get(userId) || [];
    return userFavs.some(fav => fav.cardId === cardId);
  }

  // Recently Viewed
  async getRecentlyViewed(userId: number, limit: number = 5): Promise<CardWithPrice[]> {
    const userViewed = this.userRecentlyViewed.get(userId) || [];
    
    // Sort by viewedAt descending and take the most recent ones
    const recentViews = [...userViewed]
      .sort((a, b) => 
        new Date(b.viewedAt).getTime() - new Date(a.viewedAt).getTime()
      )
      .slice(0, limit);
    
    return Promise.all(
      recentViews.map(async view => {
        const card = await this.getCardById(view.cardId);
        if (!card) throw new Error(`Card not found: ${view.cardId}`);
        
        const latestPrice = await this.getLatestPrice(card.id);
        const category = await this.getCategoryById(card.categoryId);
        if (!category) throw new Error(`Category not found: ${card.categoryId}`);
        
        return {
          ...card,
          currentPrice: latestPrice?.price || 0,
          priceChange: latestPrice?.marketChange || 0,
          percentChange: latestPrice?.percentChange || 0,
          category: category
        };
      })
    );
  }

  async addRecentlyViewed(viewed: InsertRecentlyViewed): Promise<RecentlyViewed> {
    const id = this.currentViewedId++;
    const newViewed = { 
      ...viewed, 
      id, 
      viewedAt: new Date() 
    };
    
    if (!this.userRecentlyViewed.has(viewed.userId)) {
      this.userRecentlyViewed.set(viewed.userId, []);
    }
    
    // Remove any existing entries for this card
    const userViewed = this.userRecentlyViewed.get(viewed.userId)!;
    const filteredViewed = userViewed.filter(view => view.cardId !== viewed.cardId);
    
    // Add the new entry
    filteredViewed.push(newViewed);
    this.userRecentlyViewed.set(viewed.userId, filteredViewed);
    
    return newViewed;
  }
}

export const storage = new MemStorage();
