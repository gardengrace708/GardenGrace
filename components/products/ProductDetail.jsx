'use client';

import Image from 'next/image';
import { useState, useEffect } from 'react';
import Button from '@/components/ui/Button';
import ProductCard from '@/components/ui/ProductCard';
import VirtualTryOn from '@/components/ui/VirtualTryOn';
import { formatPrice } from '@/lib/utils';
import { useCart } from '@/components/providers/CartProvider';
import { Star } from 'lucide-react';
import { handleFormError, getLastError } from '@/lib/errorHandler';

const sizes = ['XS', 'S', 'M', 'L', 'XL'];

export default function ProductDetail({ product, related }) {
  const [main, setMain] = useState(product.images[0]);
  const [size, setSize] = useState(product.availableSizes?.[0] || 'M');
  const [color, setColor] = useState(product.colors?.[0] || '');
  const cart = useCart();
  const [globalDiscount, setGlobalDiscount] = useState({ active: false, discountPercent: 0 });
  const [reviews, setReviews] = useState([]);
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' });
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewMessage, setReviewMessage] = useState('');
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Check for previous form error
    const lastError = getLastError();
    if (lastError) {
      setReviewMessage(lastError);
    }
  }, []);

  // Get the main image for the selected color
  const getMainImageForColor = (selectedColor) => {
    if (product.colorImages && product.colorImages[selectedColor] && product.colorImages[selectedColor].length > 0) {
      return product.colorImages[selectedColor][0];
    }
    // Fallback to first image if no mapping exists
    return product.images[0];
  };

  // Update main image when color changes
  useEffect(() => {
    const mainImageForColor = getMainImageForColor(color);
    if (mainImageForColor) {
      setMain(mainImageForColor);
    }
  }, [color]);

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

  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((data) => setUser(data.user || null))
      .catch(() => setUser(null));
  }, []);

  const discountedPrice = globalDiscount.active ? product.price * (1 - globalDiscount.discountPercent / 100) : product.price;
  const averageRating = reviews.length > 0 ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1) : null;

  async function submitReview(e) {
    e.preventDefault();
    if (!user) {
      setReviewMessage('Please login to submit a review');
      return;
    }

    try {
      const response = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: product.id,
          rating: reviewForm.rating,
          comment: reviewForm.comment,
          userId: user.id,
          userName: user.name,
          productName: product.name
        })
      });

      const data = await response.json();

      if (!response.ok) {
        setReviewMessage(data.message || 'Review submission failed');
        return;
      }

      setReviews([...reviews, data.review]);
      setReviewForm({ rating: 5, comment: '' });
      setShowReviewForm(false);
      setReviewMessage('Review submitted successfully!');
    } catch (error) {
      handleFormError(error, 'Review submission failed. Please try again.');
    }
  }

  return (
    <main className="bg-ivory pt-32 text-obsidian">
      <section className="luxury-container grid gap-12 pb-20 lg:grid-cols-2">
        <div>
          {product.video && (
            <div className="mb-4 rounded-2xl overflow-hidden border border-obsidian/10">
              <video src={product.video} controls className="w-full" style={{ maxHeight: '400px' }} />
            </div>
          )}
          <div className="relative aspect-[4/5] overflow-hidden bg-stone-900"><Image src={main} alt={product.name} fill priority sizes="50vw" className="object-cover" /></div>
          <div className="mt-4 grid grid-cols-4 gap-3">{product.images.map((image) => <button key={image} onClick={() => setMain(image)} className={`relative aspect-square overflow-hidden border ${main === image ? 'border-wood' : 'border-transparent'}`}><Image src={image} alt={product.name} fill sizes="120px" className="object-cover" /></button>)}</div>
        </div>
        <div className="lg:sticky lg:top-28 lg:self-start">
          <p className="text-sm font-bold uppercase tracking-[0.3em] text-wood">{product.category}</p>
          <h1 className="mt-3 font-display text-2xl md:text-5xl leading-none">{product.name}</h1>
          {averageRating && (
            <div className="mt-3 flex items-center gap-2">
              <div className="flex">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star key={star} size={16} fill={star <= Math.round(averageRating) ? 'currentColor' : 'none'} className={star <= Math.round(averageRating) ? 'text-wood' : 'text-wood/30'} />
                ))}
              </div>
              <span className="text-lg font-semibold text-wood">{averageRating}</span>
              <span className="text-sm text-obsidian/60">({reviews.length} reviews)</span>
            </div>
          )}
          {globalDiscount.active ? (
            <div className="mt-5">
              <p className="text-2xl font-bold text-green-600">{formatPrice(discountedPrice)}</p>
              <p className="text-lg text-obsidian/50 line-through">{formatPrice(product.price)}</p>
            </div>
          ) : (
            <p className="mt-5 text-2xl font-bold text-wood">{formatPrice(product.price)}</p>
          )}
          <p className="mt-8 max-w-xl leading-8 text-obsidian/70">{product.description}</p>
          {product.colors && product.colors.length > 0 && (
            <div className="mt-10">
              <p className="mb-3 text-sm font-bold uppercase tracking-[0.22em]">Select Color</p>
              <div className="flex flex-wrap gap-3">
                {product.colors.map((item) => (
                  <button key={item} onClick={() => setColor(item)} className={`px-4 py-2 rounded-full border text-sm font-bold ${color === item ? 'border-wood bg-wood text-obsidian' : 'border-obsidian/20'}`}>
                    {item}
                  </button>
                ))}
              </div>
            </div>
          )}
          <div className="mt-10">
            <p className="mb-3 text-sm font-bold uppercase tracking-[0.22em]">Select Size</p>
            <div className="flex gap-3">
              {(product.availableSizes && product.availableSizes.length > 0 ? product.availableSizes : sizes).map((item) => (
                <button key={item} onClick={() => setSize(item)} className={`h-12 w-12 rounded-full border text-sm font-bold ${size === item ? 'border-wood bg-wood text-obsidian' : 'border-obsidian/20'}`}>
                  {item}
                </button>
              ))}
            </div>
          </div>
          <div className="mt-10  flex gap-4">
            <Button className="flex-1 text-sm" onClick={() => cart?.addToCart(product, size, color)}>{product.inStock ? 'Add to Cart' : 'Sold Out'}</Button>
            {product.inStock && (
              <Button className="flex-1 bg-white shadow-xl text-ivory hover:bg-obsidian/10 text-lg" onClick={() => { cart?.addToCart(product, size, color); window.location.href = '/checkout'; }}>
                Buy Now
              </Button>
            )}
          </div>
          <div className="mt-4">
            <VirtualTryOn productImage={product.images[0]} productName={product.name} />
          </div>
          {product.stockStatus === 'limited' && (
            <p className="mt-3 text-sm font-bold uppercase tracking-[0.2em] text-orange-500">Limited Stock Available</p>
          )}
        </div>
      </section>
      
      {/* Reviews Section */}
      <section className="luxury-container py-20">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-2xl md:text-6xl">Reviews</h2>
          {user && (
            <button onClick={() => setShowReviewForm(!showReviewForm)} className="rounded-full bg-wood px-6 py-3 text-sm font-bold uppercase tracking-[0.2em] text-obsidian transition hover:bg-obsidian hover:text-ivory">
              {showReviewForm ? 'Cancel' : 'Write a Review'}
            </button>
          )}
        </div>

        {showReviewForm && (
          <form onSubmit={submitReview} className="mt-8 rounded-3xl bg-surface p-8">
            <div className="mb-6">
              <label className="mb-3 block text-sm font-bold uppercase tracking-[0.22em]">Rating</label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setReviewForm({ ...reviewForm, rating: star })}
                    className="transition hover:scale-110"
                  >
                    <Star size={32} fill={star <= reviewForm.rating ? 'currentColor' : 'none'} className={star <= reviewForm.rating ? 'text-wood' : 'text-wood/30'} />
                  </button>
                ))}
              </div>
            </div>
            <div className="mb-6">
              <label className="mb-3 block text-sm font-bold uppercase tracking-[0.22em]">Your Review</label>
              <textarea
                value={reviewForm.comment}
                onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                placeholder="Share your experience with this product..."
                rows={4}
                className="w-full rounded-2xl border border-obsidian/15 px-4 py-3 outline-none focus:border-wood"
              />
            </div>
            <button type="submit" className="rounded-full bg-wood px-8 py-3 text-sm font-bold uppercase tracking-[0.2em] text-obsidian transition hover:bg-obsidian hover:text-ivory">
              Submit Review
            </button>
            {reviewMessage && (
              <p className={`mt-4 text-sm font-bold ${reviewMessage.includes('success') ? 'text-green-600' : 'text-red-600'}`}>
                {reviewMessage}
              </p>
            )}
          </form>
        )}

        <div className="mt-12 max-h-[400px] overflow-y-auto space-y-4 rounded-3xl border border-obsidian/10 bg-surface p-6 scrollbar-thin bg-white/30  scrollbar-thumb-wood/20 scrollbar-track-transparent">
          {reviews.length === 0 ? (
            <p className="text-center text-obsidian/60">No reviews yet. Be the first to review!</p>
          ) : (
            reviews.map((review) => (
              <div key={review.id} className="rounded-2xl border border-obsidian/10 bg-white p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-bold text-obsidian">{review.userName}</p>
                    <div className="mt-1 flex">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star key={star} size={14} fill={star <= review.rating ? 'currentColor' : 'none'} className={star <= review.rating ? 'text-wood' : 'text-wood/30'} />
                      ))}
                    </div>
                  </div>
                  <p className="text-xs text-obsidian/60">{new Date(review.createdAt).toLocaleDateString()}</p>
                </div>
                {review.comment && <p className="mt-4 text-obsidian/80">{review.comment}</p>}
              </div>
            ))
          )}
        </div>
      </section>

      <section className="bg-obsidian py-20 text-ivory"><div className="luxury-container"><h2 className="mb-10 font-display text-6xl">Related Pieces</h2><div className="grid grid-cols-2 gap-5 md:grid-cols-4">{related.map((item) => <ProductCard className="text-white" key={item.id} product={item} />)}</div></div></section>
    </main>
  );
}
