'use client';

import { useState, useEffect } from 'react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { formatPrice } from '@/lib/utils';
import { Package, Calendar, MapPin, Phone, Mail, User, Upload, CheckCircle, XCircle, AlertCircle, Copy } from 'lucide-react';

export default function MyOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploadingOrderId, setUploadingOrderId] = useState(null);
  const [uploadMessage, setUploadMessage] = useState('');
  const [copiedNumber, setCopiedNumber] = useState(false);
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    async function fetchOrders() {
      try {
        // Try to fetch current user
        const userResponse = await fetch('/api/auth/me');
        const userData = await userResponse.json();

        if (userData.user) {
          // Logged-in user: fetch from database
          const ordersResponse = await fetch('/api/orders/user');
          const ordersData = await ordersResponse.json();
          setOrders(ordersData.orders || []);
        } else {
          // Guest user: sync localStorage orders with database
          const savedOrders = JSON.parse(localStorage.getItem('makhsoos_orders') || '[]');
          
          // For each saved order, fetch latest status from database
          const syncedOrders = await Promise.all(
            savedOrders.map(async (order) => {
              try {
                const response = await fetch(`/api/orders/track?order=${order.id}&email=${order.shippingAddress?.email}`);
                if (response.ok) {
                  const dbOrder = await response.json();
                  return {
                    ...order,
                    status: dbOrder.status,
                    paymentProof: dbOrder.paymentProof,
                    paymentVerified: dbOrder.paymentVerified
                  };
                }
                return order;
              } catch (error) {
                return order;
              }
            })
          );

          setOrders(syncedOrders);

          // Check for newly confirmed orders (status changed to Processing from Pending)
          const lastViewedStatuses = JSON.parse(localStorage.getItem('makhsoos_order_statuses') || '{}');
          const newlyConfirmedOrders = syncedOrders.filter(order => {
            const lastStatus = lastViewedStatuses[order.id];
            return order.status?.toLowerCase() === 'processing' && lastStatus?.toLowerCase() === 'pending';
          });

          if (newlyConfirmedOrders.length > 0) {
            setNotification({
              type: 'success',
              message: `Your order #${newlyConfirmedOrders[0].id} has been confirmed! Payment verified successfully.`
            });

            // Update last viewed statuses
            const updatedStatuses = syncedOrders.reduce((acc, order) => {
              acc[order.id] = order.status;
              return acc;
            }, {});
            localStorage.setItem('makhsoos_order_statuses', JSON.stringify(updatedStatuses));

            setTimeout(() => setNotification(null), 5000);
          } else {
            // Update last viewed statuses even if no new confirmations
            const updatedStatuses = syncedOrders.reduce((acc, order) => {
              acc[order.id] = order.status;
              return acc;
            }, {});
            localStorage.setItem('makhsoos_order_statuses', JSON.stringify(updatedStatuses));
          }
        }
      } catch (error) {
        console.error('Error fetching orders:', error);
        // Fallback to localStorage
        const savedOrders = JSON.parse(localStorage.getItem('makhsoos_orders') || '[]');
        setOrders(savedOrders);
      } finally {
        setLoading(false);
      }
    }

    fetchOrders();
  }, []);

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'delivered': return 'text-green-400 bg-green-400/10';
      case 'shipped': return 'text-blue-400 bg-blue-400/10';
      case 'processing': return 'text-yellow-400 bg-yellow-400/10';
      case 'pending': return 'text-orange-400 bg-orange-400/10';
      case 'cancelled': return 'text-red-400 bg-red-400/10';
      default: return 'text-gold bg-gold/10';
    }
  };

  async function uploadPaymentProof(orderId, file) {
    setUploadingOrderId(orderId);
    setUploadMessage('');

    try {
      // Upload image first using payment-proof specific endpoint (no auth required)
      const formData = new FormData();
      formData.append('file', file);

      const uploadResponse = await fetch('/api/upload-payment-proof', {
        method: 'POST',
        body: formData
      });
      const uploadData = await uploadResponse.json();

      if (!uploadResponse.ok) {
        throw new Error(uploadData.message || 'Image upload failed');
      }

      // Then update order with payment proof
      const proofResponse = await fetch(`/api/orders/${orderId}/payment-proof`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentProof: uploadData.url })
      });
      const proofData = await proofResponse.json();

      if (!proofResponse.ok) {
        throw new Error(proofData.message || 'Failed to save payment proof');
      }

      // Update local order data
      setOrders(prevOrders => prevOrders.map(order => 
        order.id === orderId ? { ...order, paymentProof: uploadData.url } : order
      ));

      // Also update localStorage
      const savedOrders = JSON.parse(localStorage.getItem('makhsoos_orders') || '[]');
      const updatedOrders = savedOrders.map(order => 
        order.id === orderId ? { ...order, paymentProof: uploadData.url } : order
      );
      localStorage.setItem('makhsoos_orders', JSON.stringify(updatedOrders));

      setUploadMessage('Payment proof uploaded successfully! Your advance payment will be reviewed and approved shortly.');
    } catch (error) {
      setUploadMessage(error.message);
    } finally {
      setUploadingOrderId(null);
    }
  }

  function copyPhoneNumber(number) {
    navigator.clipboard.writeText(number).then(() => {
      setCopiedNumber(true);
      setTimeout(() => setCopiedNumber(false), 2000);
    }).catch(() => {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = number;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopiedNumber(true);
      setTimeout(() => setCopiedNumber(false), 2000);
    });
  }

  if (loading) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen bg-ivory pt-28 text-obsidian">
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
      <main className="min-h-screen bg-ivory pt-28 text-obsidian">
        <section className="luxury-container py-16">
          <div className="mb-10">
            <p className="text-sm font-bold uppercase tracking-[0.35em] text-gold">Your Orders</p>
            <h1 className="mt-3 font-display text-7xl">My Orders</h1>
          </div>

          

          {orders.length === 0 ? (
            <div className="rounded-[2rem] bg-white p-12 text-center shadow-lg border border-gold/20">
              <Package size={64} className="mx-auto mb-6 text-obsidian/30" />
              <p className="text-xl text-obsidian/70 mb-6">You haven&apos;t placed any orders yet.</p>
              <a
                href="/shop"
                className="inline-block rounded-full bg-gold px-8 py-4 text-sm font-bold uppercase tracking-[0.25em] text-white transition hover:bg-obsidian"
              >
                Start Shopping
              </a>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Notification Banner */}
              {notification && (
                <div className={`rounded-2xl p-4 border ${notification.type === 'success' ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                  <div className="flex items-center gap-3">
                    {notification.type === 'success' ? (
                      <CheckCircle size={24} className="text-green-600" />
                    ) : (
                      <XCircle size={24} className="text-red-600" />
                    )}
                    <p className={`font-semibold ${notification.type === 'success' ? 'text-green-800' : 'text-red-800'}`}>
                      {notification.message}
                    </p>
                    <button
                      onClick={() => setNotification(null)}
                      className="ml-auto"
                    >
                      <X size={20} className={notification.type === 'success' ? 'text-green-600' : 'text-red-600'} />
                    </button>
                  </div>
                </div>
              )}

              {orders.map((order, index) => (
                <div key={order.id || index} className="rounded-[2rem] bg-white p-6 md:p-8 shadow-lg border border-gold/20">
                  {/* Order Header */}
                  
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-obsidian/10 pb-6 mb-6">
                    <div className="flex items-center gap-3">
                      <div className="rounded-full bg-gradient-to-br from-gold to-amber-600 p-3 text-white shadow-lg"><Package size={24} /></div>
                      <div>
                        
                        <p className="text-xs font-bold uppercase tracking-[0.22em] text-obsidian/60">Order Number</p>
                        <p className="mt-1 font-display text-2xl text-gold">{order.id}</p>
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap gap-4">
                      <div className={`px-4 py-2 rounded-full text-sm font-bold uppercase tracking-wider ${getStatusColor(order.status)}`}>
                        {order.status}
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-bold uppercase tracking-[0.22em] text-obsidian/60">Total</p>
                        <p className="mt-1 font-display text-xl text-gold">{formatPrice(order.total)}</p>
                      </div>
                    </div>
                  </div>
                  {/* Payment Section for Pending Orders */}
                  {order.status?.toLowerCase() === 'pending' && (
                    <div className="mt-6 rounded-2xl bg-orange-50 p-6 border border-orange-200">
                      <h3 className="font-bold text-orange-800 mb-4 flex items-center gap-2">
                        <AlertCircle size={18} />
                        Payment Required
                      </h3>
                      <p className="text-sm text-orange-700 mb-4">
                        Your order is pending. Please pay <span className="font-bold">Rs. 300</span> advance to confirm your order.
                      </p>
                      <div className="bg-white rounded-xl p-4 mb-4 border border-orange-200">
                        <p className="font-semibold text-orange-800 mb-1">JazzCash / EasyPaisa:</p>
                        <div className="flex items-center gap-3">
                          <p className="text-xl font-bold text-orange-900 tracking-wider">0328-0362181</p>
                          <button
                            onClick={() => copyPhoneNumber('03280362181')}
                            className="flex items-center gap-2 bg-orange-100 hover:bg-orange-200 px-3 py-2 rounded-lg transition"
                          >
                            <Copy size={16} />
                            {copiedNumber ? <span className="text-sm font-semibold">Copied!</span> : <span className="text-sm font-semibold">Copy</span>}
                          </button>
                        </div>
                      </div>
                      
                      {order.paymentProof ? (
                        <div className="bg-white rounded-xl p-4 border border-green-200">
                          <div className="flex items-center gap-2 text-green-600 mb-3">
                            <CheckCircle size={18} />
                            <span className="font-semibold">Payment Proof Uploaded</span>
                          </div>
                          <div className="relative h-32 w-full overflow-hidden rounded-lg">
                            <img src={order.paymentProof} alt="Payment proof" className="h-full w-full object-cover" />
                          </div>
                          <p className="text-xs text-gray-500 mt-2">Admin will verify your payment shortly.</p>
                        </div>
                      ) : (
                        <div>
                          <label className="flex cursor-pointer items-center justify-center gap-2 rounded-full bg-orange-500 px-6 py-3 text-sm font-bold uppercase tracking-[0.2em] text-white transition hover:bg-orange-600 disabled:opacity-60">
                            <Upload size={18} />
                            {uploadingOrderId === order.id ? 'Uploading...' : 'Upload Payment Proof'}
                            <input
                              type="file"
                              accept="image/*"
                              disabled={uploadingOrderId === order.id}
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) uploadPaymentProof(order.id, file);
                              }}
                              className="hidden"
                            />
                          </label>
                          {uploadMessage && (
                            <p className={`mt-3 text-sm font-bold ${uploadMessage.includes('success') || uploadMessage.includes('uploaded') ? 'text-green-600' : 'text-red-600'}`}>
                              {uploadMessage}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  

                  {/* Order Items */}
                  <div className="mt-5 mb-6">
                    <h3 className="font-bold text-gold mb-4 flex items-center gap-2">
                      <Package size={18} />
                      Order Items
                    </h3>
                    <div className="space-y-3">
                      {order.items?.map((item, itemIndex) => (
                        <div key={itemIndex} className="flex justify-between gap-4 pb-3 border-b border-obsidian/10 last:border-0">
                          <div className="flex-1">
                            <h4 className="font-semibold text-lg">{item.name}</h4>
                            <p className="text-sm text-obsidian/60 mt-1">
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
                    <div className="bg-ivory/50 rounded-2xl p-5 border border-obsidian/10">
                      <h3 className="font-bold text-gold mb-4 flex items-center gap-2">
                        <MapPin size={18} />
                        Shipping Information
                      </h3>
                      <div className="space-y-3 text-sm">
                        <div className="flex items-start gap-3">
                          <User size={16} className="text-obsidian/60 mt-0.5" />
                          <div>
                            <p className="text-obsidian/60 text-xs uppercase tracking-wider">Name</p>
                            <p className="font-semibold">{order.shippingAddress?.name}</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <Mail size={16} className="text-obsidian/60 mt-0.5" />
                          <div>
                            <p className="text-obsidian/60 text-xs uppercase tracking-wider">Email</p>
                            <p className="font-semibold">{order.shippingAddress?.email}</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <Phone size={16} className="text-obsidian/60 mt-0.5" />
                          <div>
                            <p className="text-obsidian/60 text-xs uppercase tracking-wider">Phone</p>
                            <p className="font-semibold">{order.shippingAddress?.phone}</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <MapPin size={16} className="text-obsidian/60 mt-0.5" />
                          <div>
                            <p className="text-obsidian/60 text-xs uppercase tracking-wider">Address</p>
                            <p className="font-semibold">{order.shippingAddress?.address}, {order.shippingAddress?.city}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="bg-ivory/50 rounded-2xl p-5 border border-obsidian/10">
                      <h3 className="font-bold text-gold mb-4 flex items-center gap-2">
                        <Calendar size={18} />
                        Order Details
                      </h3>
                      <div className="space-y-3 text-sm">
                        <div className="flex items-start gap-3">
                          <Calendar size={16} className="text-obsidian/60 mt-0.5" />
                          <div>
                            <p className="text-obsidian/60 text-xs uppercase tracking-wider">Order Date</p>
                            <p className="font-semibold">{new Date(order.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                          </div>
                        </div>
                        {order.discount > 0 && (
                          <div className="flex items-center justify-between py-2 border-b border-obsidian/10">
                            <span className="text-obsidian/60">Discount</span>
                            <span className="font-bold text-green-600">{formatPrice(order.discount)}</span>
                          </div>
                        )}
                        {order.couponCode && (
                          <div className="flex items-center justify-between py-2 border-b border-obsidian/10">
                            <span className="text-obsidian/60">Coupon Code</span>
                            <span className="font-bold text-gold">{order.couponCode}</span>
                          </div>
                        )}
                        <div className="flex items-center justify-between py-2 bg-gold/10 rounded-lg px-3 mt-2">
                          <span className="font-bold">Total Paid</span>
                          <span className="font-bold text-gold text-lg">{formatPrice(order.total)}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  
                  {/* Payment Verified Badge */}
                  {order.paymentVerified && (
                    <div className="mt-4 rounded-xl bg-green-50 p-4 border border-green-200 flex items-center gap-3">
                      <CheckCircle size={20} className="text-green-600" />
                      <div>
                        <p className="font-semibold text-green-800">Payment Verified</p>
                        <p className="text-xs text-green-600">Your order has been confirmed and is being processed.</p>
                      </div>
                    </div>
                  )}
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
