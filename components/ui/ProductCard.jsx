'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Heart, Star } from 'lucide-react';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import Badge from './Badge';
import { formatPrice } from '@/lib/utils';
import { useCart } from '@/components/providers/CartProvider';
import { useWishlist } from '@/components/providers/WishlistProvider';
import NavLink from './NavLink';

function ImageLayer({ src, alt, className }) {
  return (
    <div className={`absolute inset-0 ${className}`}>
      <Image src={src} alt={alt} fill sizes="(max-width: 768px) 50vw, 25vw" className="object-cover" />
    </div>
  );
}

export default function ProductCard({ product }) {
  const cart = useCart();
  const wishlist = useWishlist();
  const wished = wishlist?.isWishlisted(product.id);
  const [globalDiscount, setGlobalDiscount] = useState({ active: false, discountPercent: 0 });
  const [reviews, setReviews] = useState([]);

  useEffect(() => {
    fetch('/api/global-discount/status')
      .then((res) => res.json())
      .then((data) => setGlobalDiscount(data))
      .catch(() => setGlobalDiscount({ active: false, discountPercent: 0 }));
  }, []);

  useEffect(() => {
    fetch(`/api/reviews?productId=${product.id}`)
      .then((res) => res.json())
      .then((data) => setReviews(data.reviews || []))
      .catch(() => setReviews([]));
  }, [product.id]);

  const discountedPrice = globalDiscount.active ? product.price * (1 - globalDiscount.discountPercent / 100) : product.price;
  const averageRating = reviews.length > 0 ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1) : null;

  return (
    <motion.article whileHover={{ y: -4 }} className="group relative">
      <NavLink href={`/products/${product.id}`} className="block">
        <div className="relative aspect-[3/4] overflow-hidden bg-gradient-to-br from-stone-800 to-stone-950">
          <ImageLayer src={product.images[0]} alt={product.name} className="opacity-100 transition duration-700 group-hover:opacity-0" />
          <ImageLayer src={product.images[1]} alt={product.name} className="opacity-0 transition duration-700 group-hover:opacity-100" />
          <div className="absolute left-4 top-4 z-10"><Badge>{product.badge}</Badge></div>
          <div className="absolute inset-x-4 bottom-4 z-10 translate-y-16 opacity-0 transition duration-500 group-hover:translate-y-0 group-hover:opacity-100">
            <button onClick={(event) => { event.preventDefault(); cart?.addToCart(product); }} className="w-full rounded-full bg-ivory px-5 py-3 text-xs font-bold uppercase tracking-[0.22em] text-obsidian transition hover:bg-gold">Add to Cart</button>
          </div>
        </div>
      </NavLink>
      <button onClick={() => wishlist?.toggleWishlist(product)} className="absolute right-4 top-4 z-20 rounded-full bg-obsidian/70 p-2 backdrop-blur transition hover:bg-gold hover:text-obsidian" aria-label="Toggle wishlist">
        <Heart size={18} fill={wished ? 'currentColor' : 'none'} />
      </button>
      <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-[10px] sm:text-xs uppercase tracking-[0.18em] text-muted">{product.category}</p>
          <h3 className="mt-1 text-black font-display text-base sm:text-xl lg:text-2xl  break-words">{product.name}</h3>
          {averageRating && (
            <div className="mt-2 flex items-center gap-1">
              <div className="flex">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star key={star} size={12} fill={star <= Math.round(averageRating) ? 'currentColor' : 'none'} className={star <= Math.round(averageRating) ? 'text-gold' : 'text-gold/30'} />
                ))}
              </div>
              <span className="text-xs font-semibold text-gold">{averageRating}</span>
              <span className="text-xs text-muted">({reviews.length} reviews)</span>
            </div>
          )}
          {product.characteristics && product.characteristics.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1">
              {product.characteristics.map((char, index) => (
                <span key={index} className="inline-flex items-center rounded-full bg-gold/20 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-gold">
                  {char}
                </span>
              ))}
            </div>
          )}
          {product.stockStatus === 'limited' && (
            <p className="mt-2 text-[10px] font-bold uppercase tracking-wider text-orange-400">Limited Stock</p>
          )}
        </div>
        <div className="flex items-center gap-2 sm:block sm:text-right">
          {globalDiscount.active ? (
            <>
              <p className="text-sm sm:text-base font-semibold text-green-400">{formatPrice(discountedPrice)}</p>
              <p className="whitespace-nowrap text-xs text-muted line-through">{formatPrice(product.price)}</p>
            </>
          ) : (
            <p className="whitespace-nowrap text-sm font-semibold text-gold">{formatPrice(product.price)}</p>
          )}
        </div>
      </div>
    </motion.article>
  );
}
