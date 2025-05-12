import { Switch, Route, useLocation } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useTelegram } from "./lib/telegram";
import { useEffect } from "react";
import { apiRequest } from "./lib/queryClient";

// Pages
import Home from "@/pages/Home";
import Market from "@/pages/Market";
import Search from "@/pages/Search";
import Favorites from "@/pages/Favorites";
import NotFound from "@/pages/not-found";

// Layout components
import Sidebar from "@/components/layout/Sidebar";
import MobileNav from "@/components/layout/MobileNav";
import Footer from "@/components/layout/Footer";
import { Notification } from "@/components/ui/notification";

function App() {
  const [location] = useLocation();
  const { webApp } = useTelegram();

  // Initialize data on first load
  useEffect(() => {
    const initializeData = async () => {
      try {
        // Check if we have data before initializing
        const categoriesResponse = await apiRequest("GET", "/api/categories", undefined);
        const categories = await categoriesResponse.json();
        
        if (categories && categories.length > 0) {
          const pokemonCategory = categories.find((cat: any) => cat.code === "pokemon");
          if (pokemonCategory) {
            const cardsResponse = await apiRequest("GET", `/api/cards/category/${pokemonCategory.id}?limit=1`, undefined);
            const cards = await cardsResponse.json();
            
            // If no cards found, initialize data
            if (!cards || cards.length === 0) {
              await apiRequest("POST", "/api/initialize-data", undefined);
            }
          }
        }
      } catch (error) {
        console.error("Error initializing data:", error);
      }
    };

    initializeData();
  }, []);

  // Initialize Telegram Web App
  useEffect(() => {
    if (webApp) {
      webApp.ready();
      webApp.expand();
    }
  }, [webApp]);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <div className="flex flex-col min-h-screen bg-telegram-bg text-gray-800 font-roboto">
          <div className="flex flex-1">
            <Sidebar activePath={location} />
            
            <main className="flex-1 overflow-y-auto">
              <Notification />
              
              <Switch>
                <Route path="/" component={Home} />
                <Route path="/market" component={Market} />
                <Route path="/search" component={Search} />
                <Route path="/favorites" component={Favorites} />
                <Route component={NotFound} />
              </Switch>
            </main>
          </div>
          
          <Footer />
          <MobileNav activePath={location} />
          <Toaster />
        </div>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
