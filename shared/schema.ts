import { pgTable, text, serial, integer, boolean, timestamp, doublePrecision, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  telegramId: text("telegram_id").unique(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  telegramId: true,
});

export const cardCategories = pgTable("card_categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  code: text("code").notNull().unique(), // "pokemon", "yugioh", "tcg", "topps"
  displayName: text("display_name").notNull(),
  iconName: text("icon_name").notNull(),
  colorCode: text("color_code").notNull(),
});

export const insertCardCategorySchema = createInsertSchema(cardCategories).pick({
  name: true,
  code: true,
  displayName: true,
  iconName: true,
  colorCode: true,
});

export const cards = pgTable("cards", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  categoryId: integer("category_id").notNull(),
  setName: text("set_name"),
  rarityName: text("rarity_name"),
  cardNumber: text("card_number"),
  imageUrl: text("image_url"),
  type: text("type"),
  releaseDate: timestamp("release_date"),
  description: text("description"),
  illustrator: text("illustrator"),
  additionalInfo: jsonb("additional_info"),
});

export const insertCardSchema = createInsertSchema(cards).pick({
  name: true,
  categoryId: true,
  setName: true,
  rarityName: true,
  cardNumber: true,
  imageUrl: true,
  type: true,
  releaseDate: true,
  description: true,
  illustrator: true,
  additionalInfo: true,
});

export const cardPrices = pgTable("card_prices", {
  id: serial("id").primaryKey(),
  cardId: integer("card_id").notNull(),
  price: doublePrecision("price").notNull(),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
  source: text("source"),
  marketChange: doublePrecision("market_change"),
  percentChange: doublePrecision("percent_change"),
});

export const insertCardPriceSchema = createInsertSchema(cardPrices).pick({
  cardId: true,
  price: true,
  timestamp: true,
  source: true,
  marketChange: true,
  percentChange: true,
});

export const favorites = pgTable("favorites", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  cardId: integer("card_id").notNull(),
  addedAt: timestamp("added_at").defaultNow().notNull(),
});

export const insertFavoriteSchema = createInsertSchema(favorites).pick({
  userId: true,
  cardId: true,
});

export const recentlyViewed = pgTable("recently_viewed", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  cardId: integer("card_id").notNull(),
  viewedAt: timestamp("viewed_at").defaultNow().notNull(),
});

export const insertRecentlyViewedSchema = createInsertSchema(recentlyViewed).pick({
  userId: true,
  cardId: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertCardCategory = z.infer<typeof insertCardCategorySchema>;
export type CardCategory = typeof cardCategories.$inferSelect;

export type InsertCard = z.infer<typeof insertCardSchema>;
export type Card = typeof cards.$inferSelect;

export type InsertCardPrice = z.infer<typeof insertCardPriceSchema>;
export type CardPrice = typeof cardPrices.$inferSelect;

export type InsertFavorite = z.infer<typeof insertFavoriteSchema>;
export type Favorite = typeof favorites.$inferSelect;

export type InsertRecentlyViewed = z.infer<typeof insertRecentlyViewedSchema>;
export type RecentlyViewed = typeof recentlyViewed.$inferSelect;

// Extended types for UI
export type CardWithPrice = Card & {
  currentPrice: number;
  priceChange: number;
  percentChange: number;
  category: CardCategory;
};

export type CardWithDetails = CardWithPrice & {
  priceHistory: CardPrice[];
  highestPrice: CardPrice;
  lowestPrice: CardPrice;
  averagePrice: number;
};

export type MarketTrend = {
  cardId: number;
  name: string;
  categoryId: number;
  categoryName: string;
  currentPrice: number;
  priceChange: number;
  percentChange: number;
  viewCount?: number;
};
