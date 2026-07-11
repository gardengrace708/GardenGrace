'use client';

import { useState, useEffect } from 'react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { formatPrice } from '@/lib/utils';

export default function MyOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load orders from localStorage
    const savedOrders = JSON.parse(localStorage.getItem('makhsoos_orders') || '[]');
    setOrders(savedOrders);
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen bg-obsidian pt-28 text-ivory">
          <section className="luxury-container py-16">
            <p>Loading...</p>
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
            <p className="text-sm font-bold uppercase tracking-[0.35em] text-gold">Your Orders</p>
            <h1 className="mt-3 font-display text-7xl">My Orders</h1>
          </div>

          {orders.length === 0 ? (
            <div className="rounded-[2rem] bg-surface p-12 text-center">
              <p className="text-xl text-ivory/70 mb-6">You haven't placed any orders yet.</p>
              <a
                href="/shop"
                className="inline-block rounded-full bg-gold px-8 py-4 text-sm font-bold uppercase tracking-[0.25em] text-obsidian transition hover:bg-ivory"
              >
                Start Shopping
              </a>
            </div>
          ) : (
            <div className="space-y-6">
              {orders.map((order, index) => (
                <div key={order.id || index} className="rounded-[2rem] bg-surface p-8">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-ivory/10 pb-6 mb-6">
                    <div>
                      <p className="text-sm font-bold uppercase tracking-[0.22em] text-ivory/60">Order Number</p>
                      <p className="mt-2 font-display text-3xl text-gold">{order.id}</p>
                    </div>
                    <div className="flex gap-6">
                      <div className="text-center md:text-right">
                        <p className="text-sm font-bold uppercase tracking-[0.22em] text-ivory/60">Status</p>
                        <p className="mt-2 font-display text-2xl">{order.status}</p>
                      </div>
                      <div className="text-center md:text-right">
                        <p className="text-sm font-bold uppercase tracking-[0.22em] text-ivory/60">Total</p>
                        <p className="mt-2 font-display text-2xl">{formatPrice(order.total)}</p>
                      </div>
                    </div>
                  </div>

                  <div className="mb-6">
                    <h3 className="font-bold text-gold mb-4">Order Items</h3>
                    <div className="space-y-3">
                      {order.items?.map((item, itemIndex) => (
                        <div key={itemIndex} className="flex justify-between gap-4 pb-3 border-b border-ivory/10 last:border-0">
                          <div className="flex-1">
                            <h4 className="font-semibold">{item.name}</h4>
                            <p className="text-sm text-ivory/60">
                              Size: {item.size} · Qty: {item.quantity}
                              {item.waistSize && ` · Waist: ${item.waistSize}`}
                            </p>
                          </div>
                          <p className="font-bold text-gold">{formatPrice(item.price * item.quantity)}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="bg-ivory/5 rounded-2xl p-4">
                      <h3 className="font-bold text-gold mb-3">Shipping Information</h3>
                      <div className="space-y-1 text-sm text-ivory/80">
                        <p><span className="text-ivory/60">Name:</span> {order.shippingAddress?.name}</p>
                        <p><span className="text-ivory/60">Email:</span> {order.shippingAddress?.email}</p>
                        <p><span className="text-ivory/60">Phone:</span> {order.shippingAddress?.phone}</p>
                        <p><span className="text-ivory/60">Address:</span> {order.shippingAddress?.address}, {order.shippingAddress?.city}</p>
                      </div>
                    </div>
                    <div className="bg-ivory/5 rounded-2xl p-4">
                      <h3 className="font-bold text-gold mb-3">Order Details</h3>
                      <div className="space-y-1 text-sm text-ivory/80">
                        <p><span className="text-ivory/60">Placed on:</span> {new Date(order.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                        {order.discount > 0 && (
                          <p><span className="text-ivory/60">Discount:</span> {formatPrice(order.discount)}</p>
                        )}
                        {order.couponCode && (
                          <p><span className="text-ivory/60">Coupon:</span> {order.couponCode}</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
      <Footer />
    </>
  );
}
