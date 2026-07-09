'use client';

import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X } from 'lucide-react';

export default function Toast({ message, type = 'success', onClose }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 50, x: '-50%' }}
      animate={{ opacity: 1, y: 0, x: '-50%' }}
      exit={{ opacity: 0, y: 50, x: '-50%' }}
      className={`fixed bottom-8 left-1/2 z-50 flex items-center gap-3 rounded-2xl px-6 py-4 shadow-2xl ${
        type === 'success' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
      }`}
    >
      {type === 'success' ? <Check size={20} /> : <X size={20} />}
      <span className="font-semibold">{message}</span>
    </motion.div>
  );
}
