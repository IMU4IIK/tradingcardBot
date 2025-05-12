import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { PageHeader } from "@/components/ui/page-header";
import CategoryTabs from "@/components/card/CategoryTabs";
import SearchFilters, { FilterValues } from "@/components/card/SearchFilters";
import CardGrid from "@/components/card/CardGrid";
import CardDetails from "@/components/card/CardDetails";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Button } from "@/components/ui/button";
import { TIME_PERIODS } from "@/lib/constants";
import { CardWithPrice, CardWithDetails, CardCategory } from "@shared/schema";

export default function Market() {
  const [activeCategory, setActiveCategory] = useState<string>("pokemon");
  const [activeCategoryId, setActiveCategoryId] = useState<number>(1);
  const [timePeriod, setTimePeriod] = useState<string>("7");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [filters, setFilters] = useState<FilterValues>({
    rarity: "",
    priceRange: ""
  });
  const [selectedCardId, setSelectedCardId] = useState<number | null>(null);

  // Fetch categories
  const { data: categories } = useQuery<CardCategory[]>({
    queryKey: ["/api/categories"],
    staleTime: Infinity
  });

  // Fetch selected card details
  const { data: selectedCard } = useQuery<CardWithDetails>({
    queryKey: selectedCardId ? [`/api/cards/${selectedCardId}`] : null,
    enabled: !!selectedCardId,
  });

  // Update active category ID when categories load
  useEffect(() => {
    if (categories) {
      const category = categories.find(cat => cat.code === activeCategory);
      if (category) {
        setActiveCategoryId(category.id);
      }
    }
  }, [categories, activeCategory]);

  // Handle category change
  const handleCategoryChange = (categoryId: number) => {
    if (categories) {
      const category = categories.find(cat => cat.id === categoryId);
      if (category) {
        setActiveCategory(category.code);
        setActiveCategoryId(categoryId);
        setSearchQuery("");
      }
    }
  };

  // Handle search
  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  // Handle filter changes
  const handleFilterChange = (newFilters: FilterValues) => {
    setFilters(newFilters);
  };

  // Handle card selection
  const handleCardSelect = (card: CardWithPrice) => {
    setSelectedCardId(card.id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Handle close card details
  const handleCloseCardDetails = () => {
    setSelectedCardId(null);
  };

  // Simulated market trend data for each category
  const marketTrendData = [
    { day: 'Mon', pokemon: 340, yugioh: 250, tcg: 180, topps: 120 },
    { day: 'Tue', pokemon: 345, yugioh: 245, tcg: 190, topps: 125 },
    { day: 'Wed', pokemon: 360, yugioh: 260, tcg: 185, topps: 130 },
    { day: 'Thu', pokemon: 370, yugioh: 265, tcg: 195, topps: 128 },
    { day: 'Fri', pokemon: 385, yugioh: 270, tcg: 200, topps: 135 },
    { day: 'Sat', pokemon: 390, yugioh: 285, tcg: 210, topps: 140 },
    { day: 'Sun', pokemon: 410, yugioh: 290, tcg: 215, topps: 138 }
  ];

  // Category colors from constants for the chart
  const categoryColors = {
    pokemon: "#EE8130",
    yugioh: "#7F3FBF",
    tcg: "#4592C4",
    topps: "#D32F2F"
  };

  return (
    <div className="container mx-auto px-4 py-6 pb-20 md:pb-6">
      <PageHeader
        title="Market Overview"
        description="Track price trends and market movements for trading cards"
      />

      {selectedCardId && selectedCard && (
        <CardDetails 
          card={selectedCard} 
          onClose={handleCloseCardDetails} 
        />
      )}

      <CategoryTabs 
        activeCategory={activeCategory} 
        onCategoryChange={handleCategoryChange} 
      />
      
      <SearchFilters 
        onSearch={handleSearch} 
        onFilterChange={handleFilterChange} 
      />

      {/* Market Trends Chart */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold font-inter">Market Trends</h3>
          <div className="flex space-x-2">
            {TIME_PERIODS.map(period => (
              <Button
                key={period.value}
                size="sm"
                variant={timePeriod === period.value ? "default" : "outline"}
                className={timePeriod === period.value ? "bg-telegram-blue text-white" : "bg-gray-200 text-gray-700"}
                onClick={() => setTimePeriod(period.value)}
              >
                {period.label}
              </Button>
            ))}
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={marketTrendData}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis 
                  label={{ value: 'Average Price Index', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle' } }}
                  width={80}
                />
                <Tooltip />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="pokemon" 
                  name="Pokémon" 
                  stroke={categoryColors.pokemon} 
                  activeDot={{ r: 8 }} 
                />
                <Line 
                  type="monotone" 
                  dataKey="yugioh" 
                  name="Yu-Gi-Oh!" 
                  stroke={categoryColors.yugioh} 
                />
                <Line 
                  type="monotone" 
                  dataKey="tcg" 
                  name="TCG" 
                  stroke={categoryColors.tcg} 
                />
                <Line 
                  type="monotone" 
                  dataKey="topps" 
                  name="Topps" 
                  stroke={categoryColors.topps} 
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Cards Grid */}
      <CardGrid 
        title={`${searchQuery ? 'Search Results' : `${activeCategory.charAt(0).toUpperCase() + activeCategory.slice(1)} Cards`}`}
        categoryId={searchQuery ? undefined : activeCategoryId}
        searchQuery={searchQuery}
        filters={filters}
        limit={12}
        onCardSelect={handleCardSelect}
      />
    </div>
  );
}
