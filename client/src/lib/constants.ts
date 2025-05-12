export const CARD_CATEGORIES = [
  {
    id: 1,
    name: "Pokémon",
    code: "pokemon",
    displayName: "Pokémon",
    iconName: "dragon",
    colorCode: "#EE8130"
  },
  {
    id: 2,
    name: "Yu-Gi-Oh!",
    code: "yugioh",
    displayName: "Yu-Gi-Oh!",
    iconName: "chess-king",
    colorCode: "#7F3FBF"
  },
  {
    id: 3,
    name: "Trading Card Game",
    code: "tcg",
    displayName: "TCG",
    iconName: "fire",
    colorCode: "#4592C4"
  },
  {
    id: 4,
    name: "Topps",
    code: "topps",
    displayName: "Topps",
    iconName: "baseball-ball",
    colorCode: "#D32F2F"
  }
];

export const PRICE_RANGES = [
  { label: "$0 - $10", value: "0-10" },
  { label: "$10 - $50", value: "10-50" },
  { label: "$50 - $100", value: "50-100" },
  { label: "$100 - $500", value: "100-500" },
  { label: "$500+", value: "500+" }
];

export const RARITY_OPTIONS = [
  { label: "Common", value: "common" },
  { label: "Uncommon", value: "uncommon" },
  { label: "Rare", value: "rare" },
  { label: "Ultra Rare", value: "ultra-rare" },
  { label: "Secret Rare", value: "secret-rare" }
];

export const TIME_PERIODS = [
  { label: "7D", value: "7" },
  { label: "30D", value: "30" },
  { label: "3M", value: "90" },
  { label: "1Y", value: "365" }
];

export const BOT_COMMANDS = [
  { 
    command: "/search [card name]", 
    description: "Search for a card by name" 
  },
  { 
    command: "/price [card name]", 
    description: "Get current price for a specific card" 
  },
  { 
    command: "/trend [card name]", 
    description: "View price trend for a card" 
  },
  { 
    command: "/watch [card name]", 
    description: "Add a card to your watchlist" 
  },
  { 
    command: "/top [category]", 
    description: "View top trending cards in a category" 
  },
  { 
    command: "/help", 
    description: "List all available commands" 
  }
];
