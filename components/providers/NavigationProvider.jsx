'use client';

import { createContext, useContext, useState, useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';

const NavigationContext = createContext();

export function NavigationProvider({ children }) {
  const pathname = usePathname();
  const [isAnimating, setIsAnimating] = useState(false);
  const previousPathname = useRef(pathname);
  const navigationTriggered = useRef(false);

  const triggerNavigation = () => {
    setIsAnimating(true);
    navigationTriggered.current = true;
  };

  useEffect(() => {
    if (pathname !== previousPathname.current) {
      // Page has changed, hide animation after a short delay
      const timer = setTimeout(() => {
        setIsAnimating(false);
        previousPathname.current = pathname;
        navigationTriggered.current = false;
      }, 300);

      return () => clearTimeout(timer);
    }
  }, [pathname]);

  return (
    <NavigationContext.Provider value={{ isAnimating, triggerNavigation }}>
      {children}
    </NavigationContext.Provider>
  );
}

export function useNavigation() {
  const context = useContext(NavigationContext);
  if (!context) {
    throw new Error('useNavigation must be used within NavigationProvider');
  }
  return context;
}
