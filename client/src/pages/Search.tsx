import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { PageHeader } from "@/components/ui/page-header";
import SearchFilters, { FilterValues } from "@/components/card/SearchFilters";
import CardGrid from "@/components/card/CardGrid";
import CardDetails from "@/components/card/CardDetails";
import { Card, CardContent } from "@/components/ui/card";
import { Search as SearchIcon } from "lucide-react";
import { CardWithDetails, CardWithPrice } from "@shared/schema";

export default function Search() {
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [filters, setFilters] = useState<FilterValues>({
    rarity: "",
    priceRange: ""
  });
  const [selectedCardId, setSelectedCardId] = useState<number | null>(null);

  // Fetch selected card details
  const { data: selectedCard } = useQuery<CardWithDetails>({
    queryKey: selectedCardId ? [`/api/cards/${selectedCardId}`] : null,
    enabled: !!selectedCardId,
  });

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleFilterChange = (newFilters: FilterValues) => {
    setFilters(newFilters);
  };

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
        title="Search Cards"
        description="Find specific cards and check their current market value"
      />

      {selectedCardId && selectedCard && (
        <CardDetails 
          card={selectedCard} 
          onClose={handleCloseCardDetails} 
        />
      )}

      <SearchFilters 
        onSearch={handleSearch} 
        onFilterChange={handleFilterChange} 
      />

      {searchQuery ? (
        <CardGrid 
          title={`Search Results for "${searchQuery}"`}
          searchQuery={searchQuery}
          filters={filters}
          limit={20}
          onCardSelect={handleCardSelect}
        />
      ) : (
        <Card className="bg-white rounded-lg shadow p-6 mb-8">
          <CardContent className="p-0 flex flex-col items-center justify-center text-center">
            <SearchIcon size={64} className="text-gray-300 mb-4" />
            <h3 className="text-xl font-semibold mb-2">Search for Cards</h3>
            <p className="text-gray-600 max-w-md">
              Use the search box above to find cards by name. You can also filter results by rarity and price range.
            </p>
            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium mb-2">Search Tips:</h4>
                <p className="text-sm text-gray-600 text-left">Try searching for specific card names like "Charizard" or "Black Lotus"</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium mb-2">Popular Searches:</h4>
                <ul className="text-sm text-gray-600 text-left">
                  <li>• Charizard</li>
                  <li>• Pikachu</li>
                  <li>• Blue-Eyes</li>
                  <li>• Black Lotus</li>
                </ul>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium mb-2">Filter by Rarity:</h4>
                <p className="text-sm text-gray-600 text-left">Use the rarity filter to find common, rare, or ultra rare cards</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium mb-2">Filter by Price:</h4>
                <p className="text-sm text-gray-600 text-left">Use the price range filter to find cards within your budget</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
