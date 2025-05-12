import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { PageHeader } from "@/components/ui/page-header";
import CardGrid from "@/components/card/CardGrid";
import CardDetails from "@/components/card/CardDetails";
import { Card, CardContent } from "@/components/ui/card";
import { Star, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTelegram } from "@/lib/telegram";
import { CardWithDetails, CardWithPrice } from "@shared/schema";

export default function Favorites() {
  const { user, webApp, isTelegram } = useTelegram();
  const [selectedCardId, setSelectedCardId] = useState<number | null>(null);

  // Fetch user's favorites
  const { data: favorites, isLoading, error } = useQuery<CardWithPrice[]>({
    queryKey: user ? [`/api/favorites/${user.id}`] : null,
    enabled: !!user,
  });

  // Fetch selected card details
  const { data: selectedCard } = useQuery<CardWithDetails>({
    queryKey: selectedCardId ? [`/api/cards/${selectedCardId}`] : null,
    enabled: !!selectedCardId,
  });

  const handleCardSelect = (card: CardWithPrice) => {
    setSelectedCardId(card.id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleCloseCardDetails = () => {
    setSelectedCardId(null);
  };

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-6 pb-20 md:pb-6">
        <PageHeader
          title="Your Favorites"
          description="Track and manage your favorite cards"
        />
        
        <Card className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <CardContent className="p-0 flex flex-col items-center justify-center text-center">
            <Star size={64} className="text-gray-300 mb-4" />
            <h3 className="text-xl font-semibold mb-2">Sign in to View Favorites</h3>
            <p className="text-gray-600 max-w-md mb-6">
              You need to sign in via Telegram to access your favorites. Open this app through the Telegram bot to track your favorite cards.
            </p>
            {!isTelegram && (
              <Button className="bg-telegram-blue hover:bg-blue-700">
                <ExternalLink className="mr-2" size={16} />
                Open in Telegram
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 pb-20 md:pb-6">
      <PageHeader
        title="Your Favorites"
        description="Track and manage your favorite cards"
      />

      {selectedCardId && selectedCard && (
        <CardDetails 
          card={selectedCard} 
          onClose={handleCloseCardDetails} 
        />
      )}

      {isLoading ? (
        <div className="text-center py-12">
          <div className="loading-skeleton h-8 w-48 mx-auto mb-4"></div>
          <div className="loading-skeleton h-4 w-64 mx-auto"></div>
        </div>
      ) : error ? (
        <Card className="bg-red-50 border-red-200 mb-8">
          <CardContent className="p-4">
            <p className="text-red-500 text-center">Error loading favorites. Please try again later.</p>
          </CardContent>
        </Card>
      ) : favorites && favorites.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
          {favorites.map((card) => (
            <Card 
              key={card.id} 
              className="bg-white rounded-lg shadow overflow-hidden hover:shadow-md transition-shadow duration-300"
              onClick={() => handleCardSelect(card)}
            >
              {card.imageUrl ? (
                <img 
                  src={card.imageUrl} 
                  alt={`${card.name} card`} 
                  className="w-full h-48 object-cover"
                />
              ) : (
                <div className="w-full h-48 bg-gray-200 flex items-center justify-center text-gray-400">
                  No Image
                </div>
              )}
              <CardContent className="p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <span 
                      className="px-2 py-1 text-xs font-medium rounded-full text-white" 
                      style={{ backgroundColor: card.category.colorCode }}
                    >
                      {card.category.displayName}
                    </span>
                    <h4 className="mt-2 text-lg font-semibold">{card.name}</h4>
                  </div>
                  <Star className="text-yellow-400 fill-yellow-400" size={18} />
                </div>
                <p className="text-sm text-gray-600 mt-1">
                  {card.setName} {card.rarityName ? `| ${card.rarityName}` : ''}
                </p>
                <p className="font-bold text-xl mt-3">
                  {new Intl.NumberFormat('en-US', {
                    style: 'currency',
                    currency: 'USD'
                  }).format(card.currentPrice)}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="bg-white rounded-lg shadow p-6 mb-8">
          <CardContent className="p-0 flex flex-col items-center justify-center text-center">
            <Star size={64} className="text-gray-300 mb-4" />
            <h3 className="text-xl font-semibold mb-2">No Favorites Yet</h3>
            <p className="text-gray-600 max-w-md mb-6">
              You haven't added any cards to your favorites yet. Browse the market and click the star icon to add cards to your favorites.
            </p>
            <Button className="bg-telegram-blue hover:bg-blue-700" onClick={() => window.location.href = "/"}>
              Browse Cards
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Add recommendations section */}
      {favorites && favorites.length > 0 && (
        <div className="mt-8">
          <h3 className="text-xl font-bold font-inter mb-4">Recommended For You</h3>
          <CardGrid 
            title="Based on your favorites"
            limit={4}
            categoryId={favorites[0]?.categoryId}
            onCardSelect={handleCardSelect}
          />
        </div>
      )}
    </div>
  );
}
