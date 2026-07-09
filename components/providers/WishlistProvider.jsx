'use client';

import { createContext, useCallback, useContext, useMemo, useState, useEffect } from 'react';

const WishlistContext = createContext(null);

export function WishlistProvider({ children }) {
  const [items, setItems] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const savedWishlist = localStorage.getItem('makhsoos_wishlist');
    if (savedWishlist) {
      try {
        setItems(JSON.parse(savedWishlist));
      } catch (e) {
        console.error('Failed to parse wishlist from localStorage:', e);
      }
    }
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('makhsoos_wishlist', JSON.stringify(items));
    }
  }, [items, isLoaded]);

  const toggleWishlist = (product) => {
    setItems((current) => current.some((item) => item.id === product.id)
      ? current.filter((item) => item.id !== product.id)
      : [...current, product]);
  };

  const isWishlisted = useCallback((id) => items.some((item) => item.id === id), [items]);
  const value = useMemo(() => ({ items, count: items.length, toggleWishlist, isWishlisted }), [items, isWishlisted]);

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
}

export const useWishlist = () => useContext(WishlistContext);
