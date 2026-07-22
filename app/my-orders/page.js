'use client';

import { useState, useEffect } from 'react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { formatPrice } from '@/lib/utils';
import { Package, Calendar, MapPin, Phone, Mail, User } from 'lucide-react';

export default function MyOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load orders from localStorage
    const savedOrders = JSON.parse(localStorage.getItem('makhsoos_orders') || '[]');
    setOrders(savedOrders);
    setLoading(false);
  }, []);

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'delivered': return 'text-green-400 bg-green-400/10';
      case 'shipped': return 'text-blue-400 bg-blue-400/10';
      case 'processing': return 'text-yellow-400 bg-yellow-400/10';
      case 'cancelled': return 'text-red-400 bg-red-400/10';
      default: return 'text-gold bg-gold/10';
    }
  };

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
              <Package size={64} className="mx-auto mb-6 text-ivory/30" />
              <p className="text-xl text-ivory/70 mb-6">You haven&apos;t placed any orders yet.</p>
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
                <div key={order.id || index} className="rounded-[2rem] bg-surface p-6 md:p-8">
                  {/* Order Header */}
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-ivory/10 pb-6 mb-6">
                    <div className="flex items-center gap-3">
                      <Package size={24} className="text-gold" />
                      <div>
                        <p className="text-xs font-bold uppercase tracking-[0.22em] text-ivory/60">Order Number</p>
                        <p className="mt-1 font-display text-2xl text-gold">{order.id}</p>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-4">
                      <div className={`px-4 py-2 rounded-full text-sm font-bold uppercase tracking-wider ${getStatusColor(order.status)}`}>
                        {order.status}
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-bold uppercase tracking-[0.22em] text-ivory/60">Total</p>
                        <p className="mt-1 font-display text-xl text-gold">{formatPrice(order.total)}</p>
                      </div>
                    </div>
                  </div>

                  {/* Order Items */}
                  <div className="mb-6">
                    <h3 className="font-bold text-gold mb-4 flex items-center gap-2">
                      <Package size={18} />
                      Order Items
                    </h3>
                    <div className="space-y-3">
                      {order.items?.map((item, itemIndex) => (
                        <div key={itemIndex} className="flex justify-between gap-4 pb-3 border-b border-ivory/10 last:border-0">
                          <div className="flex-1">
                            <h4 className="font-semibold text-lg">{item.name}</h4>
                            <p className="text-sm text-ivory/60 mt-1">
                              Size: {item.size} · Qty: {item.quantity}
                              {item.waistSize && ` · Waist: ${item.waistSize}`}
                            </p>
                          </div>
                          <p className="font-bold text-gold text-lg">{formatPrice(item.price * item.quantity)}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Order Details */}
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="bg-ivory/5 rounded-2xl p-5">
                      <h3 className="font-bold text-gold mb-4 flex items-center gap-2">
                        <MapPin size={18} />
                        Shipping Information
                      </h3>
                      <div className="space-y-3 text-sm">
                        <div className="flex items-start gap-3">
                          <User size={16} className="text-ivory/60 mt-0.5" />
                          <div>
                            <p className="text-ivory/60 text-xs uppercase tracking-wider">Name</p>
                            <p className="font-semibold">{order.shippingAddress?.name}</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <Mail size={16} className="text-ivory/60 mt-0.5" />
                          <div>
                            <p className="text-ivory/60 text-xs uppercase tracking-wider">Email</p>
                            <p className="font-semibold">{order.shippingAddress?.email}</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <Phone size={16} className="text-ivory/60 mt-0.5" />
                          <div>
                            <p className="text-ivory/60 text-xs uppercase tracking-wider">Phone</p>
                            <p className="font-semibold">{order.shippingAddress?.phone}</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <MapPin size={16} className="text-ivory/60 mt-0.5" />
                          <div>
                            <p className="text-ivory/60 text-xs uppercase tracking-wider">Address</p>
                            <p className="font-semibold">{order.shippingAddress?.address}, {order.shippingAddress?.city}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="bg-ivory/5 rounded-2xl p-5">
                      <h3 className="font-bold text-gold mb-4 flex items-center gap-2">
                        <Calendar size={18} />
                        Order Details
                      </h3>
                      <div className="space-y-3 text-sm">
                        <div className="flex items-start gap-3">
                          <Calendar size={16} className="text-ivory/60 mt-0.5" />
                          <div>
                            <p className="text-ivory/60 text-xs uppercase tracking-wider">Order Date</p>
                            <p className="font-semibold">{new Date(order.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                          </div>
                        </div>
                        {order.discount > 0 && (
                          <div className="flex items-center justify-between py-2 border-b border-ivory/10">
                            <span className="text-ivory/60">Discount</span>
                            <span className="font-bold text-green-400">{formatPrice(order.discount)}</span>
                          </div>
                        )}
                        {order.couponCode && (
                          <div className="flex items-center justify-between py-2 border-b border-ivory/10">
                            <span className="text-ivory/60">Coupon Code</span>
                            <span className="font-bold text-gold">{order.couponCode}</span>
                          </div>
                        )}
                        <div className="flex items-center justify-between py-2 bg-ivory/10 rounded-lg px-3 mt-2">
                          <span className="font-bold">Total Paid</span>
                          <span className="font-bold text-gold text-lg">{formatPrice(order.total)}</span>
                        </div>
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
