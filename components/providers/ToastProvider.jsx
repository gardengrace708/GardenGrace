'use client';

import { createContext, useContext, useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import Toast from '@/components/ui/Toast';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type, id: Date.now() });
  };

  const hideToast = () => {
    setToast(null);
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <AnimatePresence>
        {toast && (
          <Toast
            key={toast.id}
            message={toast.message}
            type={toast.type}
            onClose={hideToast}
          />
        )}
      </AnimatePresence>
    </ToastContext.Provider>
  );
}

export const useToast = () => useContext(ToastContext);
