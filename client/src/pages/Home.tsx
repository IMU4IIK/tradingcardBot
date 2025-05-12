import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { PageHeader } from "@/components/ui/page-header";
import { useTelegram } from "@/lib/telegram";
import MarketTrends from "@/components/card/MarketTrends";
import CardGrid from "@/components/card/CardGrid";
import RecentlyViewed from "@/components/card/RecentlyViewed";
import BotCommands from "@/components/telegram/BotCommands";
import CardDetails from "@/components/card/CardDetails";
import { AboutCredits } from "@/components/ui/about-credits";
import { CardWithPrice, CardWithDetails } from "@shared/schema";

export default function Home() {
  const [selectedCardId, setSelectedCardId] = useState<number | null>(null);
  const { user } = useTelegram();

  // Fetch card details when a card is selected
  const { data: selectedCard } = useQuery<CardWithDetails>({
    queryKey: [`/api/cards/${selectedCardId || 'undefined'}`],
    enabled: !!selectedCardId,
  });

  const handleCardSelect = (card: CardWithPrice) => {
    setSelectedCardId(card.id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleCloseCardDetails = () => {
    setSelectedCardId(null);
  };

  return (
    <div className="container mx-auto px-4 py-6 pb-20 md:pb-6">
      <PageHeader
        title="Trading Card Market"
        description="Track prices and trends for your favorite collectible cards"
      />

      {selectedCardId && selectedCard && (
        <CardDetails 
          card={selectedCard} 
          onClose={handleCloseCardDetails} 
        />
      )}

      <MarketTrends />
      
      <CardGrid 
        title="Featured Pokémon Cards" 
        categoryId={1} 
        viewAll={true} 
        onCardSelect={handleCardSelect} 
      />

      <CardGrid 
        title="Featured Yu-Gi-Oh! Cards" 
        categoryId={2} 
        viewAll={true} 
        onCardSelect={handleCardSelect} 
      />

      {user && <RecentlyViewed onCardSelect={handleCardSelect} />}

      <BotCommands />
      
      <AboutCredits />
    </div>
  );
}
