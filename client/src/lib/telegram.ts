import React, { createContext, useContext, ReactNode, useState, useEffect } from "react";

interface WebAppUser {
  id: number;
  is_bot?: boolean;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
  is_premium?: boolean;
}

interface WebApp {
  initData: string;
  initDataUnsafe: {
    query_id?: string;
    user?: WebAppUser;
    auth_date: number;
    hash: string;
  };
  version: string;
  platform: string;
  colorScheme: string;
  themeParams: {
    bg_color: string;
    text_color: string;
    hint_color: string;
    link_color: string;
    button_color: string;
    button_text_color: string;
  };
  viewportHeight: number;
  viewportStableHeight: number;
  headerColor: string;
  backgroundColor: string;
  isClosingConfirmationEnabled: boolean;
  BackButton: {
    isVisible: boolean;
    onClick: (callback: Function) => void;
    offClick: (callback: Function) => void;
    show: () => void;
    hide: () => void;
  };
  MainButton: {
    text: string;
    color: string;
    textColor: string;
    isVisible: boolean;
    isActive: boolean;
    isProgressVisible: boolean;
    setText: (text: string) => void;
    onClick: (callback: Function) => void;
    offClick: (callback: Function) => void;
    show: () => void;
    hide: () => void;
    enable: () => void;
    disable: () => void;
    showProgress: (leaveActive?: boolean) => void;
    hideProgress: () => void;
  };
  HapticFeedback: {
    impactOccurred: (style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft') => void;
    notificationOccurred: (type: 'error' | 'success' | 'warning') => void;
    selectionChanged: () => void;
  };
  close: () => void;
  expand: () => void;
  ready: () => void;
  sendData: (data: any) => void;
  openLink: (url: string) => void;
  openTelegramLink: (url: string) => void;
  showPopup: (params: {
    title?: string;
    message: string;
    buttons?: Array<{
      id: string;
      type?: 'default' | 'ok' | 'close' | 'cancel' | 'destructive';
      text: string;
    }>;
  }, callback?: (buttonId: string) => void) => void;
  showAlert: (message: string, callback?: () => void) => void;
  showConfirm: (message: string, callback?: (confirmed: boolean) => void) => void;
}

interface TelegramContextType {
  webApp: WebApp | null;
  user: WebAppUser | null;
  isTelegram: boolean;
}

// Create context with default values
const TelegramContext = createContext<TelegramContextType>({
  webApp: null,
  user: null,
  isTelegram: false
});

interface TelegramProviderProps {
  children: ReactNode;
}

// Provider component
export const TelegramProvider = ({ children }: TelegramProviderProps) => {
  const [webApp, setWebApp] = useState<WebApp | null>(null);
  const [user, setUser] = useState<WebAppUser | null>(null);
  const [isTelegram, setIsTelegram] = useState<boolean>(false);

  useEffect(() => {
    // Check if Telegram WebApp is available
    if (window.Telegram && window.Telegram.WebApp) {
      setWebApp(window.Telegram.WebApp);
      setUser(window.Telegram.WebApp.initDataUnsafe.user || null);
      setIsTelegram(true);
    } else {
      console.log("Telegram WebApp not available, running in standalone mode");
      setIsTelegram(false);
      
      // Create a simulated user for testing
      setUser({
        id: 12345,
        first_name: "Test",
        last_name: "User",
        username: "testuser",
        language_code: "en"
      });
    }
  }, []);

  return React.createElement(
    TelegramContext.Provider,
    { value: { webApp, user, isTelegram } },
    children
  );
};

// Hook to use Telegram context
export const useTelegram = () => useContext(TelegramContext);

// Type declaration to extend the window object
declare global {
  interface Window {
    Telegram?: {
      WebApp: WebApp;
    };
  }
}
