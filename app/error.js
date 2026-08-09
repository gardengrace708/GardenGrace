'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { RefreshCw, ShoppingBag } from 'lucide-react';

export default function Error({ error, reset }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  // Hard reload function
  const handleHardReload = () => {
    reset();
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-obsidian flex items-center justify-center px-4">
      <div className="max-w-2xl w-full text-center">
        {/* Decorative Icon */}
        <div className="mb-8 flex justify-center">
          <div className="relative">
            <div className="absolute inset-0 bg-gold/20 rounded-full blur-3xl"></div>
            <div className="relative bg-surface rounded-full p-8 border border-gold/30">
              <ShoppingBag size={64} className="text-gold" />
            </div>
          </div>
        </div>

        {/* Error Message */}
        <h1 className="font-display text-6xl md:text-7xl text-gold mb-4">
          Oops!
        </h1>
        <p className="text-2xl md:text-3xl text-ivory mb-6 font-semibold">
          Please refresh the page
        </p>
        <p className="text-lg text-ivory/70 mb-8 max-w-md mx-auto leading-relaxed">
          Dear customer, One step more to reach the desired page 👇
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <button
            onClick={handleHardReload}
            className="flex items-center gap-2 rounded-full bg-gold px-8 py-4 text-sm font-bold uppercase tracking-[0.25em] text-obsidian transition hover:bg-ivory hover:text-obsidian"
          >
            <RefreshCw size={18} />
            Try Again
          </button>
          {/* <Link
            href="/"
            className="rounded-full border border-gold/40 px-8 py-4 text-sm font-bold uppercase tracking-[0.25em] text-gold transition hover:bg-gold hover:text-obsidian"
          >
            Go to Home
          </Link> */}
        </div>

        {/* Decorative Elements */}
        <div className="mt-16 pt-8 border-t border-ivory/10">
          <p className="text-sm text-ivory/40 uppercase tracking-[0.3em]">
            MAKHSOOS
          </p>
          <p className="text-xs text-ivory/30 mt-2">
            Luxury Pakistani Clothing
          </p>
        </div>
      </div>
    </div>
  );
}