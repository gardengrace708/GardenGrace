'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { formatPrice } from '@/lib/utils';
import { showOrderNotification } from '@/lib/notifications';
import { Copy } from 'lucide-react';
import { safeNavigate } from '@/lib/errorHandler';

function OrderSuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [orderData, setOrderData] = useState(null);
  const [copiedNumber, setCopiedNumber] = useState(false);

  useEffect(() => {
    const orderNumber = searchParams.get('order');
    const total = searchParams.get('total');
    const email = searchParams.get('email');

    if (orderNumber && total && email) {
      setOrderData({
        orderNumber,
        total: Number(total),
        email
      });
      // Show notification to user
      showOrderNotification(orderNumber, formatPrice(Number(total)));
    } else {
      safeNavigate(router, '/', 10000);
    }
  }, [searchParams, router]);

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

  if (!orderData) {
    return null;
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-obsidian pt-28 text-ivory">
        <section className="luxury-container py-16">
          <div className="max-w-2xl mx-auto text-center">
            <div className="mb-8">
              <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-green-500/20 mb-6">
                <svg className="w-12 h-12 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h1 className="font-display text-6xl mb-4">Order Placed Successfully!</h1>
              <p className="text-xl text-ivory/70">Thank you for your order. A confirmation email has been sent to {orderData.email}</p>
            </div>

            <div className="rounded-[2rem] bg-surface p-8 text-left mb-8">
              <div className="flex justify-between items-center border-b border-ivory/10 pb-6 mb-6">
                <div>
                  <p className="text-sm font-bold uppercase tracking-[0.22em] text-ivory/60">Order Number</p>
                  <p className="mt-2 font-display text-4xl text-wood">{orderData.orderNumber}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold uppercase tracking-[0.22em] text-ivory/60">Total Amount</p>
                  <p className="mt-2 font-display text-4xl">{formatPrice(orderData.total)}</p>
                </div>
              </div>

              <div className="bg-ivory/5 rounded-2xl p-6 mb-6">
                <h3 className="font-bold text-wood mb-2">Track Your Order</h3>
                <p className="text-ivory/80 mb-4">Save your order number to track your order status anytime.</p>
                <button
                  onClick={() => safeNavigate(router, `/track-order?order=${orderData.orderNumber}&email=${orderData.email}`, 10000)}
                  className="w-full rounded-full bg-wood px-6 py-4 text-sm font-bold uppercase tracking-[0.25em] text-obsidian transition hover:bg-ivory"
                >
                  Track Order
                </button>
              </div>

              <div className="space-y-2 text-sm text-ivory/60">
                <p>• You can track your order using the order number and your email</p>
                <p>• Order confirmation has been sent to your email</p>
                <p>• Your order is currently <span className="text-orange-400 font-bold">Pending</span></p>
                <p>• Please pay <span className="text-wood font-bold">Rs. 300</span> advance to confirm your order</p>
                <div className="flex items-center gap-2">
                  <p>• JazzCash / EasyPaisa: <span className="text-wood font-bold">0328-0362181</span></p>
                  <button
                    onClick={() => copyPhoneNumber('03280362181')}
                    className="flex items-center gap-1 bg-wood/20 hover:bg-wood/30 px-2 py-1 rounded transition"
                  >
                    <Copy size={14} />
                    {copiedNumber ? <span className="text-xs font-semibold">Copied!</span> : <span className="text-xs font-semibold">Copy</span>}
                  </button>
                </div>
                <p>• Upload payment proof in My Orders section after payment</p>
              </div>
            </div>

            <button
              onClick={() => safeNavigate(router, '/', 10000)}
              className="rounded-full border border-wood/40 px-8 py-4 text-sm font-bold uppercase tracking-[0.25em] text-wood transition hover:bg-wood/10"
            >
              Continue Shopping
            </button>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

export default function OrderSuccessPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-obsidian pt-28 text-ivory"><div className="luxury-container py-16">Loading...</div></div>}>
      <OrderSuccessContent />
    </Suspense>
  );
}
