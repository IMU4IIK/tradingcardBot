import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import { 
  insertUserSchema, 
  insertCardSchema, 
  insertCardPriceSchema, 
  insertFavoriteSchema
} from "@shared/schema";
import { fetchPokemonCards, fetchYugiohCards, fetchTCGCards, fetchToppsCards, refreshCardPrices } from "./api/cardService";
import { initializeBot } from "./telegram/bot";

export async function registerRoutes(app: Express): Promise<Server> {
  // Initialize the Telegram bot
  const telegramBot = initializeBot();

  // Setup API routes
  // prefix all routes with /api
  
  // Categories
  app.get("/api/categories", async (req: Request, res: Response) => {
    try {
      const categories = await storage.getAllCategories();
      res.status(200).json(categories);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch categories" });
    }
  });

  app.get("/api/categories/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const category = await storage.getCategoryById(id);
      
      if (!category) {
        return res.status(404).json({ error: "Category not found" });
      }
      
      res.status(200).json(category);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch category" });
    }
  });

  // Cards
  app.get("/api/cards/search", async (req: Request, res: Response) => {
    try {
      const query = req.query.q as string || "";
      const categoryId = req.query.categoryId ? parseInt(req.query.categoryId as string) : undefined;
      
      const cards = await storage.searchCards(query, categoryId);
      res.status(200).json(cards);
    } catch (error) {
      res.status(500).json({ error: "Failed to search cards" });
    }
  });

  app.get("/api/cards/category/:categoryId", async (req: Request, res: Response) => {
    try {
      const categoryId = parseInt(req.params.categoryId);
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
      
      const cards = await storage.getCardsByCategoryId(categoryId, limit);
      res.status(200).json(cards);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch cards by category" });
    }
  });

  app.get("/api/cards/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const card = await storage.getCardDetails(id);
      
      if (!card) {
        return res.status(404).json({ error: "Card not found" });
      }
      
      res.status(200).json(card);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch card details" });
    }
  });

  // Market Trends
  app.get("/api/trends/gainers", async (req: Request, res: Response) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 3;
      const gainers = await storage.getTopGainers(limit);
      res.status(200).json(gainers);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch top gainers" });
    }
  });

  app.get("/api/trends/fallers", async (req: Request, res: Response) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 3;
      const fallers = await storage.getTopFallers(limit);
      res.status(200).json(fallers);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch top fallers" });
    }
  });

  app.get("/api/trends/viewed", async (req: Request, res: Response) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 3;
      const viewed = await storage.getMostViewed(limit);
      res.status(200).json(viewed);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch most viewed cards" });
    }
  });

  // Card Prices
  app.get("/api/prices/:cardId", async (req: Request, res: Response) => {
    try {
      const cardId = parseInt(req.params.cardId);
      const days = req.query.days ? parseInt(req.query.days as string) : 30;
      
      const prices = await storage.getPriceHistory(cardId, days);
      res.status(200).json(prices);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch price history" });
    }
  });

  app.get("/api/prices/:cardId/latest", async (req: Request, res: Response) => {
    try {
      const cardId = parseInt(req.params.cardId);
      const price = await storage.getLatestPrice(cardId);
      
      if (!price) {
        return res.status(404).json({ error: "Price not found" });
      }
      
      res.status(200).json(price);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch latest price" });
    }
  });

  // User favorites
  app.get("/api/favorites/:userId", async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.params.userId);
      const favorites = await storage.getFavorites(userId);
      res.status(200).json(favorites);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch favorites" });
    }
  });

  app.post("/api/favorites", async (req: Request, res: Response) => {
    try {
      const validatedData = insertFavoriteSchema.parse(req.body);
      const favorite = await storage.addFavorite(validatedData);
      res.status(201).json(favorite);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to add favorite" });
    }
  });

  app.delete("/api/favorites/:userId/:cardId", async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.params.userId);
      const cardId = parseInt(req.params.cardId);
      
      const success = await storage.removeFavorite(userId, cardId);
      if (!success) {
        return res.status(404).json({ error: "Favorite not found" });
      }
      
      res.status(200).json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to remove favorite" });
    }
  });

  // Recently viewed
  app.get("/api/recently-viewed/:userId", async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.params.userId);
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 5;
      
      const viewed = await storage.getRecentlyViewed(userId, limit);
      res.status(200).json(viewed);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch recently viewed" });
    }
  });

  app.post("/api/recently-viewed", async (req: Request, res: Response) => {
    try {
      const schema = z.object({
        userId: z.number(),
        cardId: z.number()
      });
      
      const validatedData = schema.parse(req.body);
      const viewed = await storage.addRecentlyViewed(validatedData);
      res.status(201).json(viewed);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to add recently viewed" });
    }
  });

  // Data initialization endpoint
  app.post("/api/initialize-data", async (req: Request, res: Response) => {
    try {
      await fetchPokemonCards();
      await fetchYugiohCards();
      await fetchTCGCards();
      await fetchToppsCards();
      
      res.status(200).json({ message: "Data initialized successfully" });
    } catch (error) {
      console.error("Failed to initialize data:", error);
      res.status(500).json({ error: "Failed to initialize data" });
    }
  });

  // Refresh prices endpoint
  app.post("/api/refresh-prices", async (req: Request, res: Response) => {
    try {
      await refreshCardPrices();
      res.status(200).json({ message: "Prices refreshed successfully" });
    } catch (error) {
      res.status(500).json({ error: "Failed to refresh prices" });
    }
  });

  // Initialize data on server startup
  setTimeout(async () => {
    try {
      const categories = await storage.getAllCategories();
      const pokemonCategory = await storage.getCategoryByCode("pokemon");
      
      if (pokemonCategory) {
        const cards = await storage.getCardsByCategoryId(pokemonCategory.id);
        
        if (cards.length === 0) {
          console.log("Initializing card data...");
          await fetchPokemonCards();
          await fetchYugiohCards();
          await fetchTCGCards();
          await fetchToppsCards();
          console.log("Card data initialized.");
        }
      }
    } catch (error) {
      console.error("Error initializing data:", error);
    }
  }, 1000);

  // Setup price refresh interval (every 6 hours)
  setInterval(async () => {
    try {
      console.log("Refreshing card prices...");
      await refreshCardPrices();
      console.log("Card prices refreshed.");
    } catch (error) {
      console.error("Error refreshing prices:", error);
    }
  }, 6 * 60 * 60 * 1000);

  const httpServer = createServer(app);
  return httpServer;
}
