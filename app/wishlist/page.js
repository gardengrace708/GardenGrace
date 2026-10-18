'use client';

import { useWishlist } from '@/components/providers/WishlistProvider';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Heart, ShoppingBag, Trash2 } from 'lucide-react';
import { formatPrice } from '@/lib/utils';
import { useCart } from '@/components/providers/CartProvider';
import Link from 'next/link';

export default function WishlistPage() {
  const wishlist = useWishlist();
  const cart = useCart();

  if (wishlist.items.length === 0) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen bg-pink-800 pt-28 text-ivory">
          <section className="luxury-container flex flex-col items-center justify-center py-16">
            <Heart size={64} className="mb-6 text-ivory/30" />
            <h1 className="font-display text-4xl text-pink-100 mb-4">Your wishlist is empty</h1>
            <p className="text-ivory/60 mb-8">Save your favorite items for later</p>
            <Link href="/collections" className="rounded-full bg-pink-300 px-8 py-4 text-sm font-bold uppercase tracking-[0.25em] text-obsidian transition hover:bg-ivory">
              Explore Collections
            </Link>
          </section>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-obsidian pt-28 text-ivory">
        <section className="luxury-container py-16">
          <div className="mb-10">
            <p className="text-sm font-bold uppercase tracking-[0.35em] text-wood">Wishlist</p>
            <h1 className="mt-3 font-display text-7xl">Your Favorites</h1>
            <p className="mt-2 text-ivory/60">{wishlist.items.length} {wishlist.items.length === 1 ? 'item' : 'items'} saved</p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {wishlist.items.map((item) => (
              <div key={item.id} className="rounded-[2rem] border border-ivory/10 bg-surface overflow-hidden">
                <div className="relative aspect-square bg-ivory/10">
                  {item.images && item.images[0] && (
                    <img src={item.images[0]} alt={item.name} className="h-full w-full object-cover" />
                  )}
                  <button
                    onClick={() => wishlist.toggleWishlist(item)}
                    className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-obsidian/80 text-red-400 transition hover:bg-red-400 hover:text-obsidian"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
                <div className="p-5">
                  <h3 className="font-display text-xl mb-2">{item.name}</h3>
                  <p className="text-sm text-ivory/60 mb-3">{item.category || 'Product'}</p>
                  <div className="flex items-center justify-between">
                    <p className="font-bold text-wood">{formatPrice(item.price)}</p>
                    <button
                      onClick={() => cart.addToCart(item)}
                      className="flex items-center gap-2 rounded-full bg-wood px-4 py-2 text-sm font-bold uppercase tracking-[0.2em] text-obsidian transition hover:bg-ivory"
                    >
                      <ShoppingBag size={16} />
                      Add
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
