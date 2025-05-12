import { Link } from "wouter";
import {
  Home,
  LineChart,
  Search,
  Star,
  Bell,
  Settings,
  CreditCard,
  User
} from "lucide-react";
import { useTelegram } from "@/lib/telegram";

interface SidebarProps {
  activePath: string;
}

export default function Sidebar({ activePath }: SidebarProps) {
  const { user } = useTelegram();

  const isActive = (path: string) => {
    return activePath === path;
  };

  return (
    <aside className="hidden md:flex md:w-64 flex-col bg-telegram-sidebar text-white h-screen sticky top-0">
      <div className="p-4 border-b border-gray-700">
        <h1 className="text-xl font-bold font-inter flex items-center">
          <CreditCard className="mr-3" />
          CardBot
        </h1>
      </div>
      
      <nav className="flex-1 overflow-y-auto py-4">
        <ul>
          <li>
            <Link href="/">
              <a className={`px-4 py-2 hover:bg-telegram-blue cursor-pointer font-medium flex items-center ${isActive('/') ? 'bg-telegram-blue' : ''}`}>
                <Home className="mr-3 w-5" />
                <span>Home</span>
              </a>
            </Link>
          </li>
          <li>
            <Link href="/market">
              <a className={`px-4 py-2 hover:bg-telegram-blue cursor-pointer font-medium flex items-center ${isActive('/market') ? 'bg-telegram-blue' : ''}`}>
                <LineChart className="mr-3 w-5" />
                <span>Market</span>
              </a>
            </Link>
          </li>
          <li>
            <Link href="/search">
              <a className={`px-4 py-2 hover:bg-telegram-blue cursor-pointer font-medium flex items-center ${isActive('/search') ? 'bg-telegram-blue' : ''}`}>
                <Search className="mr-3 w-5" />
                <span>Search</span>
              </a>
            </Link>
          </li>
          <li>
            <Link href="/favorites">
              <a className={`px-4 py-2 hover:bg-telegram-blue cursor-pointer font-medium flex items-center ${isActive('/favorites') ? 'bg-telegram-blue' : ''}`}>
                <Star className="mr-3 w-5" />
                <span>Favorites</span>
              </a>
            </Link>
          </li>
          <li>
            <a className="px-4 py-2 hover:bg-telegram-blue cursor-pointer font-medium flex items-center">
              <Bell className="mr-3 w-5" />
              <span>Notifications</span>
            </a>
          </li>
          <li>
            <a className="px-4 py-2 hover:bg-telegram-blue cursor-pointer font-medium flex items-center">
              <Settings className="mr-3 w-5" />
              <span>Settings</span>
            </a>
          </li>
        </ul>
      </nav>
      
      <div className="p-4 border-t border-gray-700">
        <div className="flex items-center">
          <div className="w-10 h-10 rounded-full bg-gray-500 flex items-center justify-center">
            <User className="text-white" />
          </div>
          <div className="ml-3">
            <p className="font-medium">{user?.username || user?.first_name || "User"}</p>
            <p className="text-sm text-gray-300">Online</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
