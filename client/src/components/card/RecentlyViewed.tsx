import { useQuery } from "@tanstack/react-query";
import { CardWithPrice } from "@shared/schema";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useTelegram } from "@/lib/telegram";

interface RecentlyViewedProps {
  onCardSelect: (card: CardWithPrice) => void;
}

export default function RecentlyViewed({ onCardSelect }: RecentlyViewedProps) {
  const { user } = useTelegram();

  const { data: recentlyViewed, isLoading, error } = useQuery<CardWithPrice[]>({
    queryKey: user ? [`/api/recently-viewed/${user.id}?limit=5`] : null,
    enabled: !!user,
    staleTime: 60000, // 1 minute
  });

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(value);
  };

  if (isLoading) {
    return (
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold font-inter">Recently Viewed</h3>
          <Skeleton className="h-5 w-16" />
        </div>
        
        <div className="overflow-x-auto pb-2">
          <div className="flex space-x-4" style={{ minWidth: "max-content" }}>
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="w-48">
                <Skeleton className="h-24 w-full rounded-t-lg" />
                <div className="p-3 bg-white rounded-b-lg">
                  <Skeleton className="h-5 w-32 mb-1" />
                  <Skeleton className="h-4 w-24 mb-1" />
                  <Skeleton className="h-5 w-16 mt-1" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mb-8">
        <h3 className="text-xl font-bold font-inter mb-4">Recently Viewed</h3>
        <p className="text-red-500">Error loading recently viewed cards</p>
      </div>
    );
  }

  if (!recentlyViewed || recentlyViewed.length === 0) {
    return (
      <div className="mb-8">
        <h3 className="text-xl font-bold font-inter mb-4">Recently Viewed</h3>
        <p className="text-gray-500">No recently viewed cards</p>
      </div>
    );
  }

  return (
    <div className="mb-8">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-bold font-inter">Recently Viewed</h3>
        <a href="#" className="text-telegram-blue hover:underline text-sm font-medium">
          View All
        </a>
      </div>
      
      <div className="overflow-x-auto pb-2">
        <div className="flex space-x-4" style={{ minWidth: "max-content" }}>
          {recentlyViewed.map((card) => (
            <Card 
              key={card.id} 
              className="bg-white rounded-lg shadow w-48 hover:shadow-md transition-shadow duration-300"
              onClick={() => onCardSelect(card)}
            >
              {card.imageUrl ? (
                <img 
                  src={card.imageUrl} 
                  alt={`${card.name} card`} 
                  className="w-full h-24 object-cover rounded-t-lg" 
                />
              ) : (
                <div className="w-full h-24 bg-gray-200 flex items-center justify-center text-gray-400 rounded-t-lg">
                  No Image
                </div>
              )}
              <CardContent className="p-3">
                <h5 className="font-medium truncate" title={card.name}>{card.name}</h5>
                <p className="text-sm text-gray-600 truncate">
                  {card.setName} {card.rarityName ? `| ${card.rarityName}` : ''}
                </p>
                <p className="font-bold mt-1">{formatCurrency(card.currentPrice)}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
