'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Gift } from 'lucide-react';

export default function OfferPopup({ globalDiscount }) {
  const [isOpen, setIsOpen] = useState(false);

  if (!globalDiscount?.active) return null;

  return (
    <>
      {/* Offer Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-20 right-6 z-40 flex items-center gap-2 rounded-full bg-pink-100 px-4 py-3 text-obsidian shadow-lg transition hover:scale-105 hover:bg-yellow-400"
      >
        <Gift size={18} />
        <span className="text-sm font-bold uppercase tracking-wider">
          {globalDiscount.discountPercent}% OFF
        </span>
      </button>

      {/* Popup Modal */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
            onClick={() => setIsOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="relative max-w-md w-full bg-ivory rounded-3xl overflow-hidden shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button */}
              <button
                onClick={() => setIsOpen(false)}
                className="absolute right-4 top-4 z-10 rounded-full bg-black/20 p-2 text-white transition hover:bg-black/40"
              >
                <X size={20} />
              </button>

              {/* Chick Image */}
              <div className="relative h-48 bg-black flex items-center justify-center">
                <img
                  src="/images/offer-chick.png"
                  alt="Special Offer"
                  className="h-40 w-40 object-contain"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.parentElement.innerHTML = '<Gift size={64} className="text-wood" />';
                  }}
                />
              </div>

              {/* Offer Content */}
              <div className="p-6 text-center">
                <div className="mb-4">
                  <span className="inline-block rounded-full bg-wood/20 px-4 py-1 text-sm font-bold uppercase tracking-wider text-wood">
                    Special Offer
                  </span>
                </div>
                
                <h3 className="font-display text-4xl font-bold text-black mb-2">
                  {globalDiscount.discountPercent}% OFF
                </h3>
                
                <p className="text-gray-600 mb-4">
                  {globalDiscount.expiresAt 
                    ? `Valid until ${new Date(globalDiscount.expiresAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}`
                    : 'Limited Time Offer'
                  }
                </p>

                <p className="text-sm text-gray-500 mb-6">
                  Use this discount on all products. Don&apos;t miss out on this exclusive offer!
                </p>

                <button
                  onClick={() => setIsOpen(false)}
                  className="w-full rounded-full bg-wood px-6 py-3 text-sm font-bold uppercase tracking-wider text-obsidian transition hover:bg-yellow-400"
                >
                  Start Shopping
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
