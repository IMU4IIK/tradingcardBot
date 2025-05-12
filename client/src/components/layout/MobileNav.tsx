import { Link } from "wouter";
import { Home, LineChart, Search, Star, User } from "lucide-react";

interface MobileNavProps {
  activePath: string;
}

export default function MobileNav({ activePath }: MobileNavProps) {
  const isActive = (path: string) => {
    return activePath === path;
  };

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-10">
      <div className="flex justify-around">
        <Link href="/">
          <a className="flex flex-col items-center py-2 px-3">
            <Home className={isActive('/') ? 'text-telegram-blue' : 'text-gray-500'} size={20} />
            <span className="text-xs mt-1">Home</span>
          </a>
        </Link>
        <Link href="/market">
          <a className="flex flex-col items-center py-2 px-3">
            <LineChart className={isActive('/market') ? 'text-telegram-blue' : 'text-gray-500'} size={20} />
            <span className="text-xs mt-1">Market</span>
          </a>
        </Link>
        <Link href="/search">
          <a className="flex flex-col items-center py-2 px-3">
            <Search className={isActive('/search') ? 'text-telegram-blue' : 'text-gray-500'} size={20} />
            <span className="text-xs mt-1">Search</span>
          </a>
        </Link>
        <Link href="/favorites">
          <a className="flex flex-col items-center py-2 px-3">
            <Star className={isActive('/favorites') ? 'text-telegram-blue' : 'text-gray-500'} size={20} />
            <span className="text-xs mt-1">Favorites</span>
          </a>
        </Link>
        <a className="flex flex-col items-center py-2 px-3">
          <User className="text-gray-500" size={20} />
          <span className="text-xs mt-1">Profile</span>
        </a>
      </div>
    </nav>
  );
}
