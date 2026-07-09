'use client';

import { CartProvider } from './CartProvider';
import { WishlistProvider } from './WishlistProvider';
import { NavigationProvider } from './NavigationProvider';
import { ToastProvider } from './ToastProvider';

export default function Providers({ children }) {
  return (
    <NavigationProvider>
      <ToastProvider>
        <CartProvider>
          <WishlistProvider>{children}</WishlistProvider>
        </CartProvider>
      </ToastProvider>
    </NavigationProvider>
  );
}
