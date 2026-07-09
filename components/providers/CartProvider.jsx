'use client';

import { createContext, useContext, useMemo, useState, useEffect } from 'react';
import { useToast } from './ToastProvider';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [items, setItems] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    const savedCart = localStorage.getItem('makhsoos_cart');
    if (savedCart) {
      try {
        setItems(JSON.parse(savedCart));
      } catch (e) {
        console.error('Failed to parse cart from localStorage:', e);
      }
    }
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('makhsoos_cart', JSON.stringify(items));
    }
  }, [items, isLoaded]);

  const addToCart = (product, size = 'M', color = '') => {
    setItems((current) => {
      const key = `${product.id}-${size}-${color}`;
      const existing = current.find((item) => item.key === key);
      if (existing) {
        showToast(`${product.name} quantity updated in cart`);
        return current.map((item) => item.key === key ? { ...item, quantity: item.quantity + 1 } : item);
      }
      showToast(`${product.name} added to cart`);
      return [...current, { ...product, key, size, color, quantity: 1 }];
    });
  };

  const removeFromCart = (key) => {
    setItems((current) => current.filter((item) => item.key !== key));
  };

  const updateQuantity = (key, quantity) => {
    if (quantity <= 0) {
      removeFromCart(key);
      return;
    }
    setItems((current) => current.map((item) => item.key === key ? { ...item, quantity } : item));
  };

  const clearCart = () => {
    setItems([]);
  };

  const value = useMemo(() => ({ items, count: items.reduce((sum, item) => sum + item.quantity, 0), addToCart, removeFromCart, updateQuantity, clearCart }), [items]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export const useCart = () => useContext(CartContext);
