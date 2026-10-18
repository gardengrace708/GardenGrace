'use client';

import { useState } from 'react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { formatPrice } from '@/lib/utils';

export default function TrackOrderPage() {
  const [orderNumber, setOrderNumber] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [order, setOrder] = useState(null);

  async function handleTrackOrder(e) {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setOrder(null);

    try {
      const response = await fetch('/api/track-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderNumber, email })
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.message || 'Failed to fetch order');
        return;
      }

      setOrder(data.order);
    } catch (error) {
      setMessage('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-obsidian pt-28 text-ivory">
        <section className="luxury-container py-16">
          <div className="mb-10">
            <p className="text-sm font-bold uppercase tracking-[0.35em] text-wood">Track Your Order</p>
            <h1 className="mt-3 font-display text-7xl">Order Status</h1>
          </div>

          {!order ? (
            <form onSubmit={handleTrackOrder} className="max-w-md space-y-6">
              <div>
                <label className="mb-2 block text-sm font-bold uppercase tracking-[0.22em] text-ivory/70">Order Number</label>
                <input
                  value={orderNumber}
                  onChange={(e) => setOrderNumber(e.target.value.toUpperCase())}
                  required
                  className="w-full rounded-2xl border border-ivory/10 bg-ivory px-4 py-3 text-obsidian placeholder:text-obsidian/45 outline-none transition focus:border-wood focus:ring-2 focus:ring-wood/30"
                  placeholder="Enter your order number (e.g., MK-123456)"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-bold uppercase tracking-[0.22em] text-ivory/70">Email</label>
                <input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  type="email"
                  className="w-full rounded-2xl border border-ivory/10 bg-ivory px-4 py-3 text-obsidian placeholder:text-obsidian/45 outline-none transition focus:border-wood focus:ring-2 focus:ring-wood/30"
                  placeholder="Enter your email"
                />
              </div>
              {message && <p className="rounded-2xl bg-red-500/10 px-4 py-3 text-center text-sm font-bold text-red-200">{message}</p>}
              <button
                disabled={loading}
                type="submit"
                className="w-full rounded-full bg-wood px-6 py-4 text-sm font-bold uppercase tracking-[0.25em] text-obsidian transition hover:bg-ivory disabled:opacity-60"
              >
                {loading ? 'Searching...' : 'Track Order'}
              </button>
            </form>
          ) : (
            <div className="max-w-2xl">
              <button
                onClick={() => { setOrder(null); setOrderNumber(''); setEmail(''); setMessage(''); }}
                className="mb-6 text-sm font-bold uppercase tracking-[0.25em] text-wood hover:text-ivory transition"
              >
                ← Track Another Order
              </button>

              <div className="rounded-[2rem] bg-surface p-8 space-y-6">
                <div className="flex justify-between items-start border-b border-ivory/10 pb-6">
                  <div>
                    <p className="text-sm font-bold uppercase tracking-[0.22em] text-ivory/60">Order Number</p>
                    <p className="mt-2 font-display text-3xl text-wood">{order.id}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold uppercase tracking-[0.22em] text-ivory/60">Status</p>
                    <p className="mt-2 font-display text-3xl">{order.status}</p>
                  </div>
                </div>

                <div>
                  <h3 className="font-display text-2xl mb-4">Order Items</h3>
                  <div className="space-y-4">
                    {order.items.map((item, index) => (
                      <div key={index} className="flex justify-between gap-4 pb-4 border-b border-ivory/10 last:border-0">
                        <div className="flex-1">
                          <h4 className="font-semibold">{item.name}</h4>
                          <p className="text-sm text-ivory/60">
                            Size: {item.size} · Qty: {item.quantity}
                          </p>
                        </div>
                        <p className="font-bold text-wood">{formatPrice(item.price * item.quantity)}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-3 pt-4 border-t border-ivory/10">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>{formatPrice(order.total + order.discount)}</span>
                  </div>
                  {order.discount > 0 && (
                    <div className="flex justify-between text-green-400">
                      <span>Discount</span>
                      <span>-{formatPrice(order.discount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between pt-3 text-lg font-bold border-t border-ivory/10">
                    <span>Total</span>
                    <span className="text-wood">{formatPrice(order.total)}</span>
                  </div>
                </div>

                <div className="pt-4 border-t border-ivory/10">
                  <h3 className="font-display text-2xl mb-4">Shipping Information</h3>
                  <div className="space-y-2 text-ivory/80">
                    <p><span className="text-ivory/60">Name:</span> {order.shippingAddress.name}</p>
                    <p><span className="text-ivory/60">Email:</span> {order.shippingAddress.email}</p>
                    <p><span className="text-ivory/60">Phone:</span> {order.shippingAddress.phone}</p>
                    <p><span className="text-ivory/60">Address:</span> {order.shippingAddress.address}, {order.shippingAddress.city}, {order.shippingAddress.postalCode}</p>
                  </div>
                </div>

                <div className="pt-4 border-t border-ivory/10">
                  <p className="text-sm text-ivory/60">Order placed on: {new Date(order.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                </div>
              </div>
            </div>
          )}
        </section>
      </main>
      <Footer />
    </>
  );
}
