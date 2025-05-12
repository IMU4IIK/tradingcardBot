import { useState, useEffect } from "react";
import { X, Star, ArrowUp, ArrowDown, Minus } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CardWithDetails } from "@shared/schema";
import PriceChart from "./PriceChart";
import { useTelegram } from "@/lib/telegram";
import { apiRequest } from "@/lib/queryClient";
import { useQuery, useQueryClient } from "@tanstack/react-query";

interface CardDetailsProps {
  card: CardWithDetails | null;
  onClose: () => void;
}

export default function CardDetails({ card, onClose }: CardDetailsProps) {
  const { user } = useTelegram();
  const queryClient = useQueryClient();
  const [isFavorite, setIsFavorite] = useState(false);

  // Check if card is in favorites
  const { data: favorites } = useQuery({
    queryKey: user ? [`/api/favorites/${user.id}`] : null,
    enabled: !!user && !!card,
  });

  useEffect(() => {
    if (favorites && card) {
      const isCardFavorite = favorites.some((fav: any) => fav.id === card.id);
      setIsFavorite(isCardFavorite);
    }
  }, [favorites, card]);

  // Record view if user is logged in
  useEffect(() => {
    const recordView = async () => {
      if (user && card) {
        try {
          await apiRequest("POST", "/api/recently-viewed", {
            userId: user.id,
            cardId: card.id
          });
        } catch (error) {
          console.error("Failed to record view:", error);
        }
      }
    };

    recordView();
  }, [user, card]);

  const handleFavoriteToggle = async () => {
    if (!user || !card) return;

    try {
      if (isFavorite) {
        await apiRequest("DELETE", `/api/favorites/${user.id}/${card.id}`, undefined);
      } else {
        await apiRequest("POST", "/api/favorites", {
          userId: user.id,
          cardId: card.id
        });
      }
      
      setIsFavorite(!isFavorite);
      queryClient.invalidateQueries({ queryKey: [`/api/favorites/${user.id}`] });
      
      // Show notification
      if (window.showNotification) {
        window.showNotification(
          isFavorite ? "Removed from favorites" : "Added to favorites",
          `${card.name} has been ${isFavorite ? "removed from" : "added to"} your favorites`
        );
      }
    } catch (error) {
      console.error("Failed to update favorites:", error);
    }
  };

  if (!card) return null;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(value);
  };

  const formatDate = (date: Date | undefined) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getTrendIcon = (percentChange: number) => {
    if (percentChange > 0) {
      return <ArrowUp className="mr-1" size={16} />;
    } else if (percentChange < 0) {
      return <ArrowDown className="mr-1" size={16} />;
    } else {
      return <Minus className="mr-1" size={16} />;
    }
  };

  const getTrendClass = (percentChange: number) => {
    if (percentChange > 0) return "text-trend-up";
    if (percentChange < 0) return "text-trend-down";
    return "text-trend-neutral";
  };

  return (
    <Card className="mb-8 bg-white rounded-lg shadow-lg overflow-hidden">
      <div className="p-4 bg-telegram-blue text-white flex justify-between items-center">
        <h3 className="text-lg font-bold">Card Details</h3>
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={onClose}
          className="text-white hover:text-gray-200 hover:bg-transparent"
        >
          <X size={18} />
        </Button>
      </div>
      
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row gap-6">
          <div className="md:w-1/3">
            {card.imageUrl ? (
              <img 
                src={card.imageUrl} 
                alt={`${card.name} detailed view`} 
                className="w-full rounded-lg shadow-md"
              />
            ) : (
              <div className="w-full h-80 bg-gray-200 rounded-lg shadow-md flex items-center justify-center text-gray-500">
                No Image Available
              </div>
            )}
          </div>
          
          <div className="md:w-2/3">
            <div className="flex justify-between items-start">
              <div>
                <span 
                  className="px-2 py-1 text-xs font-medium rounded-full text-white" 
                  style={{ backgroundColor: card.category.colorCode }}
                >
                  {card.category.displayName}
                </span>
                <h2 className="text-2xl font-bold mt-2">{card.name}</h2>
                <p className="text-gray-600">
                  {card.setName || 'Unknown Set'} 
                  {card.rarityName ? ` | ${card.rarityName}` : ''} 
                  {card.cardNumber ? ` | Card #${card.cardNumber}` : ''}
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleFavoriteToggle}
                className="text-telegram-blue hover:text-blue-700"
              >
                <Star size={20} className={isFavorite ? "fill-yellow-400 text-yellow-400" : ""} />
              </Button>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mt-6">
              <div>
                <p className="text-sm text-gray-500">Current Price</p>
                <p className="text-2xl font-bold">{formatCurrency(card.currentPrice)}</p>
                <div className={`flex items-center ${getTrendClass(card.percentChange)}`}>
                  {getTrendIcon(card.percentChange)}
                  <span>
                    {formatCurrency(Math.abs(card.priceChange))} 
                    ({Math.abs(card.percentChange).toFixed(1)}%) vs last week
                  </span>
                </div>
              </div>
              
              <div>
                <p className="text-sm text-gray-500">Average Price (30 days)</p>
                <p className="text-2xl font-bold">{formatCurrency(card.averagePrice)}</p>
              </div>
              
              <div>
                <p className="text-sm text-gray-500">Highest Price</p>
                <p className="text-xl font-bold">{formatCurrency(card.highestPrice.price)}</p>
                <p className="text-sm text-gray-500">
                  Recorded on {formatDate(card.highestPrice.timestamp)}
                </p>
              </div>
              
              <div>
                <p className="text-sm text-gray-500">Lowest Price</p>
                <p className="text-xl font-bold">{formatCurrency(card.lowestPrice.price)}</p>
                <p className="text-sm text-gray-500">
                  Recorded on {formatDate(card.lowestPrice.timestamp)}
                </p>
              </div>
            </div>
            
            <div className="mt-6">
              <h4 className="font-bold mb-2">Price History (Last 30 Days)</h4>
              <div className="chart-container border rounded-lg p-4">
                <PriceChart priceHistory={card.priceHistory} />
              </div>
            </div>
            
            <div className="mt-6">
              <h4 className="font-bold mb-2">Card Information</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Type</p>
                  <p>{card.type || 'N/A'}</p>
                </div>
                {card.additionalInfo && card.additionalInfo.hp && (
                  <div>
                    <p className="text-sm text-gray-500">HP</p>
                    <p>{card.additionalInfo.hp}</p>
                  </div>
                )}
                <div>
                  <p className="text-sm text-gray-500">Release Date</p>
                  <p>{formatDate(card.releaseDate)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Illustrator</p>
                  <p>{card.illustrator || 'Unknown'}</p>
                </div>
                {card.description && (
                  <div className="col-span-2">
                    <p className="text-sm text-gray-500">Description</p>
                    <p className="text-sm">{card.description}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
