import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Crown, Sword, Flame, CircleDashed } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { CardCategory } from "@shared/schema";

interface CategoryTabsProps {
  activeCategory: string;
  onCategoryChange: (categoryId: number) => void;
}

export default function CategoryTabs({ activeCategory, onCategoryChange }: CategoryTabsProps) {
  const { data: categories, isLoading, error } = useQuery({
    queryKey: ["/api/categories"],
    staleTime: Infinity // Categories rarely change
  });

  const getCategoryIcon = (iconName: string) => {
    switch (iconName) {
      case "dragon":
        return <Crown className="mr-2" size={16} />;
      case "chess-king":
        return <Sword className="mr-2" size={16} />;
      case "fire":
        return <Flame className="mr-2" size={16} />;
      case "baseball-ball":
        return <CircleDashed className="mr-2" size={16} />;
      default:
        return <CircleDashed className="mr-2" size={16} />;
    }
  };

  if (isLoading) {
    return (
      <div className="mb-6 border-b border-gray-200">
        <ul className="flex flex-wrap -mb-px text-sm font-medium text-center">
          {[1, 2, 3, 4].map((i) => (
            <li key={i} className="mr-2">
              <Skeleton className="h-10 w-24" />
            </li>
          ))}
        </ul>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mb-6 text-red-500">
        Error loading categories. Please try again.
      </div>
    );
  }

  return (
    <div className="mb-6 border-b border-gray-200">
      <ul className="flex flex-wrap -mb-px text-sm font-medium text-center">
        {categories.map((category: CardCategory) => (
          <li key={category.id} className="mr-2">
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                onCategoryChange(category.id);
              }}
              className={`inline-block p-4 border-b-2 rounded-t-lg ${
                activeCategory === category.code
                  ? "border-telegram-blue text-telegram-blue"
                  : "border-transparent hover:text-gray-600 hover:border-gray-300"
              }`}
              aria-current={activeCategory === category.code ? "page" : undefined}
            >
              {getCategoryIcon(category.iconName)}
              {category.displayName}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
