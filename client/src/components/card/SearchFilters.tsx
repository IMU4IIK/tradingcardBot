import { useState } from 'react';
import { Search, SlidersHorizontal } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { RARITY_OPTIONS, PRICE_RANGES } from '@/lib/constants';

interface SearchFiltersProps {
  onSearch: (query: string) => void;
  onFilterChange: (filters: FilterValues) => void;
}

export interface FilterValues {
  rarity: string;
  priceRange: string;
}

export default function SearchFilters({ onSearch, onFilterChange }: SearchFiltersProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<FilterValues>({
    rarity: '',
    priceRange: ''
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchQuery);
  };

  const handleFilterChange = (key: keyof FilterValues, value: string) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  return (
    <div className="mb-6 flex flex-col md:flex-row gap-4">
      <form onSubmit={handleSearch} className="flex-1">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <Search className="text-gray-400" size={16} />
          </div>
          <Input
            type="search"
            className="block w-full p-3 pl-10 text-sm border border-gray-300 rounded-lg bg-white"
            placeholder="Search cards..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </form>
      
      <div className="flex gap-2">
        <div className="relative">
          <Select
            value={filters.rarity}
            onValueChange={(value) => handleFilterChange('rarity', value)}
          >
            <SelectTrigger className="bg-white border border-gray-300 text-gray-700 text-sm rounded-lg w-full">
              <SelectValue placeholder="Rarity" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Rarities</SelectItem>
              {RARITY_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="relative">
          <Select
            value={filters.priceRange}
            onValueChange={(value) => handleFilterChange('priceRange', value)}
          >
            <SelectTrigger className="bg-white border border-gray-300 text-gray-700 text-sm rounded-lg w-full">
              <SelectValue placeholder="Price Range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Prices</SelectItem>
              {PRICE_RANGES.map((range) => (
                <SelectItem key={range.value} value={range.value}>
                  {range.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <Button variant="default" className="bg-telegram-blue hover:bg-blue-700 text-white">
          <SlidersHorizontal className="mr-2" size={16} />
          Filters
        </Button>
      </div>
    </div>
  );
}
