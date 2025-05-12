import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { CardWithPrice } from "@shared/schema";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Star, ArrowUp, ArrowDown, Minus } from "lucide-react";
import { FilterValues } from "./SearchFilters";

interface CardGridProps {
  categoryId?: number;
  title: string;
  viewAll?: boolean;
  limit?: number;
  searchQuery?: string;
  filters?: FilterValues;
  onCardSelect?: (card: CardWithPrice) => void;
}

export default function CardGrid({
  categoryId,
  title,
  viewAll = false,
  limit = 4,
  searchQuery = "",
  filters,
  onCardSelect
}: CardGridProps) {
  let queryUrl = categoryId 
    ? `/api/cards/category/${categoryId}?limit=${limit}` 
    : `/api/cards/search?q=${searchQuery}`;

  if (filters?.rarity) {
    queryUrl += `&rarity=${filters.rarity}`;
  }
  
  if (filters?.priceRange) {
    queryUrl += `&priceRange=${filters.priceRange}`;
  }

  const { data: cards, isLoading, error } = useQuery<CardWithPrice[]>({
    queryKey: [queryUrl],
    staleTime: 60000, // 1 minute
  });

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(value);
  };

  const getTrendIcon = (percentChange: number) => {
    if (percentChange > 0) {
      return <ArrowUp className="text-trend-up mr-1" size={14} />;
    } else if (percentChange < 0) {
      return <ArrowDown className="text-trend-down mr-1" size={14} />;
    } else {
      return <Minus className="text-trend-neutral mr-1" size={14} />;
    }
  };

  const getTrendClass = (percentChange: number) => {
    if (percentChange > 0) return "text-trend-up";
    if (percentChange < 0) return "text-trend-down";
    return "text-trend-neutral";
  };

  if (isLoading) {
    return (
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold font-inter">{title}</h3>
          {viewAll && <Skeleton className="h-6 w-16" />}
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: limit }).map((_, i) => (
            <Card key={i} className="overflow-hidden">
              <Skeleton className="h-48 w-full" />
              <CardContent className="p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <Skeleton className="h-6 w-16 mb-2" />
                    <Skeleton className="h-5 w-32 mb-2" />
                  </div>
                  <Skeleton className="h-6 w-12" />
                </div>
                <Skeleton className="h-4 w-24 mt-1" />
                <div className="mt-3 flex justify-between items-center">
                  <Skeleton className="h-7 w-20" />
                  <Skeleton className="h-6 w-6 rounded-full" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold font-inter">{title}</h3>
        </div>
        <Card className="bg-red-50 border-red-200">
          <CardContent className="p-4">
            <p className="text-red-500">Error loading cards. Please try again later.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (cards && cards.length === 0) {
    return (
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold font-inter">{title}</h3>
        </div>
        <Card className="bg-gray-50">
          <CardContent className="p-4 text-center">
            <p className="text-gray-500">No cards found.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="mb-8">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-bold font-inter">{title}</h3>
        {viewAll && (
          <a href="#" className="text-telegram-blue hover:underline text-sm font-medium">
            View All
          </a>
        )}
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {cards?.map((card) => (
          <Card 
            key={card.id} 
            className="bg-white rounded-lg shadow overflow-hidden hover:shadow-md transition-shadow duration-300"
            onClick={() => onCardSelect && onCardSelect(card)}
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
                  <span className={`px-2 py-1 text-xs font-medium rounded-full text-white bg-[${card.category.colorCode}]`} style={{ backgroundColor: card.category.colorCode }}>
                    {card.category.displayName}
                  </span>
                  <h4 className="mt-2 text-lg font-semibold">{card.name}</h4>
                </div>
                <div className="flex items-center">
                  {getTrendIcon(card.percentChange)}
                  <span className={getTrendClass(card.percentChange)}>
                    {Math.abs(card.percentChange).toFixed(1)}%
                  </span>
                </div>
              </div>
              <p className="text-sm text-gray-600 mt-1">
                {card.setName} {card.rarityName ? `| ${card.rarityName}` : ''}
              </p>
              <div className="mt-3 flex justify-between items-center">
                <p className="font-bold text-xl">{formatCurrency(card.currentPrice)}</p>
                <button className="text-telegram-blue hover:text-blue-700">
                  <Star size={18} />
                </button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
