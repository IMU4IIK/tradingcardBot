import axios from 'axios';
import { storage } from '../storage';
import { InsertCard, InsertCardPrice } from '@shared/schema';

// API configuration
const API_CONFIG = {
  tcgplayer: {
    baseUrl: 'https://api.tcgplayer.com/v1.37.0',
    apiKey: process.env.TCGPLAYER_API_KEY || '',
  },
  yugioh: {
    baseUrl: 'https://db.ygoprodeck.com/api/v7',
  },
  pokemonTCG: {
    baseUrl: 'https://api.pokemontcg.io/v2',
    apiKey: process.env.POKEMON_TCG_API_KEY || '',
  },
  // For Topps, we might need to scrape or use a different API
};

export async function fetchPokemonCards() {
  try {
    // Get the Pokemon category ID
    const pokemonCategory = await storage.getCategoryByCode("pokemon");
    if (!pokemonCategory) {
      throw new Error("Pokemon category not found");
    }

    const headers = API_CONFIG.pokemonTCG.apiKey ? 
      { 'X-Api-Key': API_CONFIG.pokemonTCG.apiKey } : {};

    const response = await axios.get(`${API_CONFIG.pokemonTCG.baseUrl}/cards`, { 
      params: { pageSize: 20, orderBy: "-set.releaseDate" },
      headers
    });

    if (response.data && response.data.data) {
      for (const card of response.data.data) {
        // Check if card already exists
        const existingCards = await storage.searchCards(card.name, pokemonCategory.id);
        if (existingCards.length > 0) continue;

        // Create the card
        const cardData: InsertCard = {
          name: card.name,
          categoryId: pokemonCategory.id,
          setName: card.set?.name || '',
          rarityName: card.rarity || '',
          cardNumber: card.number || '',
          imageUrl: card.images?.large || '',
          type: card.types?.[0] || '',
          releaseDate: card.set?.releaseDate ? new Date(card.set.releaseDate) : undefined,
          description: card.flavorText || '',
          illustrator: card.artist || '',
          additionalInfo: {
            hp: card.hp,
            subtypes: card.subtypes,
            evolvesFrom: card.evolvesFrom,
          }
        };

        const newCard = await storage.createCard(cardData);

        // Add price data
        if (card.tcgplayer?.prices) {
          let price = 0;
          if (card.tcgplayer.prices.holofoil) {
            price = card.tcgplayer.prices.holofoil.market || card.tcgplayer.prices.holofoil.mid;
          } else if (card.tcgplayer.prices.normal) {
            price = card.tcgplayer.prices.normal.market || card.tcgplayer.prices.normal.mid;
          } else if (card.tcgplayer.prices.reverseHolofoil) {
            price = card.tcgplayer.prices.reverseHolofoil.market || card.tcgplayer.prices.reverseHolofoil.mid;
          }

          if (price > 0) {
            await storage.addCardPrice({
              cardId: newCard.id,
              price,
              timestamp: new Date(),
              source: 'tcgplayer',
              marketChange: 0,
              percentChange: 0
            });

            // Add some historical price data
            await generateHistoricalPrices(newCard.id, price);
          }
        }
      }
    }

    return true;
  } catch (error) {
    console.error("Error fetching Pokemon cards:", error);
    throw error;
  }
}

export async function fetchYugiohCards() {
  try {
    // Get the Yugioh category ID
    const yugiohCategory = await storage.getCategoryByCode("yugioh");
    if (!yugiohCategory) {
      throw new Error("Yugioh category not found");
    }

    const response = await axios.get(`${API_CONFIG.yugioh.baseUrl}/cardinfo.php`, {
      params: { sort: 'name', num: 20, offset: 0 }
    });

    if (response.data && response.data.data) {
      for (const card of response.data.data) {
        // Check if card already exists
        const existingCards = await storage.searchCards(card.name, yugiohCategory.id);
        if (existingCards.length > 0) continue;

        // Create the card
        const cardData: InsertCard = {
          name: card.name,
          categoryId: yugiohCategory.id,
          setName: card.card_sets?.[0]?.set_name || '',
          rarityName: card.card_sets?.[0]?.set_rarity || '',
          cardNumber: card.card_sets?.[0]?.set_code || '',
          imageUrl: card.card_images?.[0]?.image_url || '',
          type: card.type || '',
          releaseDate: undefined, // API doesn't provide this directly
          description: card.desc || '',
          illustrator: '',
          additionalInfo: {
            attack: card.atk,
            defense: card.def,
            level: card.level,
            attribute: card.attribute,
            race: card.race
          }
        };

        const newCard = await storage.createCard(cardData);

        // Add price data if available
        if (card.card_prices && card.card_prices[0]) {
          const priceData = card.card_prices[0];
          const price = parseFloat(priceData.amazon_price) || 
                       parseFloat(priceData.tcgplayer_price) || 
                       parseFloat(priceData.ebay_price);

          if (price > 0) {
            await storage.addCardPrice({
              cardId: newCard.id,
              price,
              timestamp: new Date(),
              source: 'yugioh api',
              marketChange: 0,
              percentChange: 0
            });

            // Add some historical price data
            await generateHistoricalPrices(newCard.id, price);
          }
        }
      }
    }

    return true;
  } catch (error) {
    console.error("Error fetching Yugioh cards:", error);
    throw error;
  }
}

export async function fetchTCGCards() {
  try {
    // Get the TCG category ID
    const tcgCategory = await storage.getCategoryByCode("tcg");
    if (!tcgCategory) {
      throw new Error("TCG category not found");
    }

    // Normally we would use the TCGPlayer API here, but since we're just simulating data
    // we'll create some fake MTG cards for now
    const mtgCards = [
      {
        name: "Black Lotus",
        setName: "Alpha",
        rarityName: "Mythic Rare",
        cardNumber: "001",
        imageUrl: "https://gatherer.wizards.com/Handlers/Image.ashx?multiverseid=382866&type=card",
        type: "Artifact",
        description: "Tap, Sacrifice Black Lotus: Add three mana of any one color.",
        price: 45500
      },
      {
        name: "Force of Will",
        setName: "Alliances",
        rarityName: "Rare",
        cardNumber: "105",
        imageUrl: "https://gatherer.wizards.com/Handlers/Image.ashx?multiverseid=413591&type=card",
        type: "Instant",
        description: "You may pay 1 life and exile a blue card from your hand rather than pay this spell's mana cost.",
        price: 498.30
      }
    ];

    for (const card of mtgCards) {
      // Check if card already exists
      const existingCards = await storage.searchCards(card.name, tcgCategory.id);
      if (existingCards.length > 0) continue;

      // Create the card
      const cardData: InsertCard = {
        name: card.name,
        categoryId: tcgCategory.id,
        setName: card.setName,
        rarityName: card.rarityName,
        cardNumber: card.cardNumber,
        imageUrl: card.imageUrl,
        type: card.type,
        releaseDate: undefined,
        description: card.description,
        illustrator: '',
        additionalInfo: {}
      };

      const newCard = await storage.createCard(cardData);

      // Add price data
      await storage.addCardPrice({
        cardId: newCard.id,
        price: card.price,
        timestamp: new Date(),
        source: 'simulated data',
        marketChange: 0,
        percentChange: 0
      });

      // Add some historical price data
      await generateHistoricalPrices(newCard.id, card.price);
    }

    return true;
  } catch (error) {
    console.error("Error creating TCG cards:", error);
    throw error;
  }
}

export async function fetchToppsCards() {
  try {
    // Get the Topps category ID
    const toppsCategory = await storage.getCategoryByCode("topps");
    if (!toppsCategory) {
      throw new Error("Topps category not found");
    }

    // Since there's no direct Topps API, we'll create some sample data
    const toppsCards = [
      {
        name: "Mickey Mantle",
        setName: "1952 Topps",
        rarityName: "Rare",
        cardNumber: "#311",
        imageUrl: "https://example.com/mickey-mantle.jpg",
        type: "Baseball",
        description: "New York Yankees centerfielder, Hall of Fame member",
        price: 5820
      },
      {
        name: "Babe Ruth",
        setName: "1933 Goudey",
        rarityName: "Rare",
        cardNumber: "#53",
        imageUrl: "https://example.com/babe-ruth.jpg",
        type: "Baseball",
        description: "New York Yankees outfielder and pitcher, Hall of Fame member",
        price: 3250
      }
    ];

    for (const card of toppsCards) {
      // Check if card already exists
      const existingCards = await storage.searchCards(card.name, toppsCategory.id);
      if (existingCards.length > 0) continue;

      // Create the card
      const cardData: InsertCard = {
        name: card.name,
        categoryId: toppsCategory.id,
        setName: card.setName,
        rarityName: card.rarityName,
        cardNumber: card.cardNumber,
        imageUrl: card.imageUrl,
        type: card.type,
        releaseDate: undefined,
        description: card.description,
        illustrator: '',
        additionalInfo: {}
      };

      const newCard = await storage.createCard(cardData);

      // Add price data
      await storage.addCardPrice({
        cardId: newCard.id,
        price: card.price,
        timestamp: new Date(),
        source: 'simulated data',
        marketChange: 0,
        percentChange: 0
      });

      // Add some historical price data
      await generateHistoricalPrices(newCard.id, card.price);
    }

    return true;
  } catch (error) {
    console.error("Error creating Topps cards:", error);
    throw error;
  }
}

// Create simulated historical price data for a card
async function generateHistoricalPrices(cardId: number, currentPrice: number) {
  const priceData: InsertCardPrice[] = [];
  const now = new Date();
  
  // Generate 30 days of data with small fluctuations
  for (let i = 30; i > 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    
    // Generate a random fluctuation between -5% and +5%
    const fluctuation = (Math.random() * 0.1) - 0.05;
    const factor = 1 + (i > 10 ? -fluctuation : fluctuation); // Trend up in recent days
    
    // Calculate the price based on current price and fluctuation
    const price = currentPrice * Math.pow(factor, (30 - i) / 5);
    
    priceData.push({
      cardId,
      price,
      timestamp: date,
      source: 'simulated data',
      marketChange: 0,
      percentChange: 0
    });
  }
  
  // Calculate the price changes
  for (let i = 1; i < priceData.length; i++) {
    const prev = priceData[i - 1];
    const curr = priceData[i];
    
    curr.marketChange = curr.price - prev.price;
    curr.percentChange = (curr.marketChange / prev.price) * 100;
  }
  
  // Store the historical prices
  for (const price of priceData) {
    await storage.addCardPrice(price);
  }
  
  return priceData;
}

// Function to update card prices periodically
export async function refreshCardPrices() {
  try {
    // Get all cards
    const categories = await storage.getAllCategories();
    
    for (const category of categories) {
      const cards = await storage.getCardsByCategoryId(category.id, 100);
      
      for (const card of cards) {
        const latestPrice = await storage.getLatestPrice(card.id);
        if (!latestPrice) continue;
        
        // Generate a random price fluctuation between -3% and +3%
        const fluctuation = (Math.random() * 0.06) - 0.03;
        const newPrice = latestPrice.price * (1 + fluctuation);
        const marketChange = newPrice - latestPrice.price;
        const percentChange = (marketChange / latestPrice.price) * 100;
        
        // Add the new price
        await storage.addCardPrice({
          cardId: card.id,
          price: newPrice,
          timestamp: new Date(),
          source: 'price update',
          marketChange,
          percentChange
        });
      }
    }
    
    return true;
  } catch (error) {
    console.error("Error refreshing card prices:", error);
    throw error;
  }
}
