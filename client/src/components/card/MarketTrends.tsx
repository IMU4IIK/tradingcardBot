import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowUp, ArrowDown } from "lucide-react";
import { MarketTrend } from "@shared/schema";

export default function MarketTrends() {
  const { data: topGainers, isLoading: isLoadingGainers } = useQuery<MarketTrend[]>({
    queryKey: ["/api/trends/gainers"],
    staleTime: 300000, // 5 minutes
  });

  const { data: topFallers, isLoading: isLoadingFallers } = useQuery<MarketTrend[]>({
    queryKey: ["/api/trends/fallers"],
    staleTime: 300000, // 5 minutes
  });

  const { data: mostViewed, isLoading: isLoadingViewed } = useQuery<MarketTrend[]>({
    queryKey: ["/api/trends/viewed"],
    staleTime: 300000, // 5 minutes
  });

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(value);
  };

  const renderTrendCard = (
    title: string,
    cardName: string,
    metric: React.ReactNode,
    price: number,
    subtitle: string,
    isLoading: boolean
  ) => {
    if (isLoading) {
      return (
        <Card className="bg-white">
          <CardContent className="p-4">
            <div className="flex justify-between items-start">
              <div>
                <Skeleton className="h-4 w-24 mb-2" />
                <Skeleton className="h-6 w-40 mb-4" />
              </div>
              <Skeleton className="h-6 w-16 rounded-full" />
            </div>
            <Skeleton className="h-8 w-24 mb-2" />
            <Skeleton className="h-4 w-48" />
          </CardContent>
        </Card>
      );
    }

    return (
      <Card className="bg-white">
        <CardContent className="p-4">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-gray-500">{title}</p>
              <h3 className="text-xl font-semibold">{cardName}</h3>
            </div>
            {metric}
          </div>
          <div className="mt-2">
            <p className="text-2xl font-bold">{formatCurrency(price)}</p>
            <p className="text-sm text-gray-500">{subtitle}</p>
          </div>
        </CardContent>
      </Card>
    );
  };

  const topGainer = topGainers?.[0];
  const topFaller = topFallers?.[0];
  const mostViewedCard = mostViewed?.[0];

  return (
    <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
      {renderTrendCard(
        "Top Gainers",
        topGainer?.name || "",
        topGainer ? (
          <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-trend-up">
            +{topGainer.percentChange.toFixed(1)}%
          </span>
        ) : null,
        topGainer?.currentPrice || 0,
        topGainer ? `From ${formatCurrency(topGainer.currentPrice - topGainer.priceChange)} last week` : "",
        isLoadingGainers
      )}

      {renderTrendCard(
        "Most Viewed",
        mostViewedCard?.name || "",
        mostViewedCard ? (
          <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800">
            {mostViewedCard.viewCount || 0} views
          </span>
        ) : null,
        mostViewedCard?.currentPrice || 0,
        "Trending for 3 days",
        isLoadingViewed
      )}

      {renderTrendCard(
        "Top Fallers",
        topFaller?.name || "",
        topFaller ? (
          <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-trend-down">
            {topFaller.percentChange.toFixed(1)}%
          </span>
        ) : null,
        topFaller?.currentPrice || 0,
        topFaller ? `From ${formatCurrency(topFaller.currentPrice - topFaller.priceChange)} last week` : "",
        isLoadingFallers
      )}
    </div>
  );
}
