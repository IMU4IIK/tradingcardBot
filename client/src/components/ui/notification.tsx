import { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import { X, Info } from 'lucide-react';
import { CSSTransition } from 'react-transition-group';

interface NotificationContextType {
  show: (title: string, message: string) => void;
  hide: () => void;
}

const NotificationContext = createContext<NotificationContextType>({
  show: () => {},
  hide: () => {}
});

interface NotificationState {
  visible: boolean;
  title: string;
  message: string;
}

export const NotificationProvider = ({ children }: { children: ReactNode }) => {
  const [notification, setNotification] = useState<NotificationState>({
    visible: false,
    title: '',
    message: ''
  });

  const show = (title: string, message: string) => {
    setNotification({
      visible: true,
      title,
      message
    });
    
    // Auto-hide after 5 seconds
    setTimeout(() => {
      hide();
    }, 5000);
  };

  const hide = () => {
    setNotification(prev => ({
      ...prev,
      visible: false
    }));
  };

  return (
    <NotificationContext.Provider value={{ show, hide }}>
      {children}
      <CSSTransition
        in={notification.visible}
        timeout={300}
        classNames="notification"
        unmountOnExit
      >
        <div className="notification fixed top-4 right-4 bg-white shadow-lg rounded-lg px-4 py-3 z-50 max-w-sm">
          <div className="flex items-center">
            <div className="flex-shrink-0 mr-3">
              <Info className="text-telegram-blue" size={20} />
            </div>
            <div>
              <p className="font-medium">{notification.title}</p>
              <p className="text-sm text-gray-600">{notification.message}</p>
            </div>
            <button 
              className="ml-4 text-gray-400 hover:text-gray-600" 
              onClick={hide}
              aria-label="Close notification"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      </CSSTransition>
    </NotificationContext.Provider>
  );
};

export const useNotification = () => useContext(NotificationContext);

// Standalone notification component that doesn't need provider
export const Notification = () => {
  const [notification, setNotification] = useState<NotificationState>({
    visible: false,
    title: '',
    message: ''
  });

  const show = (title: string, message: string) => {
    setNotification({
      visible: true,
      title,
      message
    });
    
    // Auto-hide after 5 seconds
    setTimeout(() => {
      hide();
    }, 5000);
  };

  const hide = () => {
    setNotification(prev => ({
      ...prev,
      visible: false
    }));
  };

  // Expose the show method to the window for use by other components
  useEffect(() => {
    if (typeof window !== 'undefined') {
      (window as any).showNotification = show;
    }
    
    return () => {
      if (typeof window !== 'undefined') {
        delete (window as any).showNotification;
      }
    };
  }, []);

  return (
    <div className={`fixed top-4 right-4 bg-white shadow-lg rounded-lg px-4 py-3 z-50 max-w-sm transition-all duration-300 ${notification.visible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-full'}`}>
      <div className="flex items-center">
        <div className="flex-shrink-0 mr-3">
          <Info className="text-telegram-blue" size={20} />
        </div>
        <div>
          <p className="font-medium">{notification.title}</p>
          <p className="text-sm text-gray-600">{notification.message}</p>
        </div>
        <button 
          className="ml-4 text-gray-400 hover:text-gray-600" 
          onClick={hide}
          aria-label="Close notification"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
};
