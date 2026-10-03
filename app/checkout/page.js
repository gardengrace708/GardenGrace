'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { useCart } from '@/components/providers/CartProvider';
import { formatPrice } from '@/lib/utils';
import NavLink from '@/components/ui/NavLink';

export default function CheckoutPage() {
  const router = useRouter();
  const cart = useCart();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    postalCode: ''
  });
  const [waistSizes, setWaistSizes] = useState({});
  const [customMeasurements, setCustomMeasurements] = useState({
    waist: '',
    length: ''
  });
  const [currentUser, setCurrentUser] = useState(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponMessage, setCouponMessage] = useState('');
  const [discount, setDiscount] = useState(0);
  const [globalDiscount, setGlobalDiscount] = useState({ active: false, discountPercent: 0 });
  const [phoneError, setPhoneError] = useState('');

  const total = cart.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const discountedTotal = total - discount;

  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((data) => {
        if (data.user) {
          setCurrentUser(data.user);
          setFormData((prev) => ({
            ...prev,
            name: data.user.name || '',
            email: data.user.email || ''
          }));
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    fetch('/api/global-discount/status')
      .then((res) => res.json())
      .then((data) => {
        setGlobalDiscount(data);
        if (data.active) {
          const globalDiscountAmount = (total * data.discountPercent) / 100;
          setDiscount(globalDiscountAmount);
        }
      })
      .catch(() => {});
  }, [total]);

  if (cart.items.length === 0) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen bg-obsidian pt-28 text-ivory">
          <section className="luxury-container flex flex-col items-center justify-center py-16">
            <h1 className="font-display text-5xl">Your cart is empty</h1>
            <NavLink href="/collections" className="mt-6 rounded-full bg-gold px-8 py-4 text-sm font-bold uppercase tracking-[0.25em] text-obsidian transition hover:bg-ivory">
              Continue Shopping
            </NavLink>
          </section>
        </main>
        <Footer />
      </>
    );
  }

  function updateField(field, value) {
    setFormData((current) => ({ ...current, [field]: value }));

    // Clear general message when user starts typing
    setMessage('');

    // Clear phone error when user starts typing phone number
    if (field === 'phone') {
      setPhoneError('');
      // Real-time validation for phone number - only show country restriction error
      if (value && value.trim() !== '') {
        const cleanedPhone = value.replace(/[\s\-\(\)]/g, '');
        // Check if it's clearly not a Pakistani number (doesn't start with 92 or 03)
        if (!cleanedPhone.startsWith('92') && !cleanedPhone.startsWith('03') && cleanedPhone.length > 2) {
          setPhoneError('Only in Pakistan available. Please enter a Pakistani phone number.');
        }
      }
    }
  }

  function validatePakistaniPhone(phone) {
    if (!phone || phone.trim() === '') {
      return { valid: false, message: 'Phone number is required' };
    }

    // Remove all spaces, dashes, and special characters
    const cleanedPhone = phone.replace(/[\s\-\(\)]/g, '');

    // Check if it starts with 92 (Pakistan country code) or 03 (Pakistani mobile)
    if (cleanedPhone.startsWith('92')) {
      // Remove the 92 prefix and check the remaining number
      const numberWithoutCode = cleanedPhone.substring(2);
      // Should be 10 digits after removing 92 (e.g., 92 3XX XXXXXXX)
      if (numberWithoutCode.length === 10 && numberWithoutCode.startsWith('3')) {
        return { valid: true, message: '' };
      }
      return { valid: false, message: 'Invalid Pakistani phone number format. Expected: 92 3XX XXXXXXX' };
    } else if (cleanedPhone.startsWith('03')) {
      // Should be 11 digits (03XXXXXXXXX)
      if (cleanedPhone.length === 11) {
        return { valid: true, message: '' };
      }
      return { valid: false, message: 'Invalid Pakistani phone number format. Expected: 03XXXXXXXXX' };
    } else {
      // Not a Pakistani number
      return { valid: false, message: 'Only in Pakistan available. Please enter a Pakistani phone number (03XXXXXXXXX or 92 3XX XXXXXXX).' };
    }
  }

  function handleProceedToConfirmation(event) {
    event.preventDefault();

    // Validate required fields
    if (!formData.name || formData.name.trim() === '') {
      setMessage('Name is required');
      return;
    }

    if (!formData.email || formData.email.trim() === '') {
      setMessage('Email is required');
      return;
    }

    if (!formData.phone || formData.phone.trim() === '') {
      setMessage('Phone number is required');
      return;
    }

    if (!formData.address || formData.address.trim() === '') {
      setMessage('Address is required');
      return;
    }

    if (!formData.city || formData.city.trim() === '') {
      setMessage('City is required');
      return;
    }

    // Validate Pakistani phone number
    const phoneValidation = validatePakistaniPhone(formData.phone);
    if (!phoneValidation.valid) {
      setPhoneError(phoneValidation.message);
      setMessage(phoneValidation.message);
      return;
    }

    setShowConfirmation(true);
  }

  async function confirmOrder() {
    setLoading(true);
    setMessage('');

    try {
      const itemsWithWaistSizes = cart.items.map(item => ({
        ...item,
        waistSize: waistSizes[item.key] || null
      }));

      console.log('Order items being sent:', itemsWithWaistSizes);

      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUser?.id || null,
          guestEmail: currentUser ? null : formData.email,
          items: itemsWithWaistSizes,
          total: discountedTotal,
          discount,
          couponCode: appliedCoupon?.code || null,
          shippingAddress: {
            name: formData.name,
            email: formData.email,
            phone: formData.phone,
            address: formData.address,
            city: formData.city,
            postalCode: formData.postalCode,
            customMeasurements: customMeasurements
          }
        })
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.message || 'Failed to place order');
        setLoading(false);
        return;
      }

      // Save order to localStorage for guest users
      if (!currentUser) {
        try {
          const savedOrders = JSON.parse(localStorage.getItem('makhsoos_orders') || '[]');
          savedOrders.push(data.order);
          localStorage.setItem('makhsoos_orders', JSON.stringify(savedOrders));
        } catch (e) {
          console.error('Failed to save order to localStorage:', e);
        }
      }

      cart.clearCart();
      router.push('/my-orders');
    } catch (error) {
      setMessage('An error occurred. Please try again.');
      setLoading(false);
    }
  }

  function handleCancelConfirmation() {
    setShowConfirmation(false);
  }

  async function applyCoupon() {
    if (!couponCode.trim()) {
      setCouponMessage('Please enter a coupon code');
      return;
    }

    try {
      const response = await fetch('/api/coupons/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: couponCode })
      });

      const data = await response.json();

      if (!response.ok || !data.valid) {
        setCouponMessage(data.message || 'Invalid coupon');
        setAppliedCoupon(null);
        // Revert to global discount only
        if (globalDiscount.active) {
          const globalDiscountAmount = (total * globalDiscount.discountPercent) / 100;
          setDiscount(globalDiscountAmount);
        } else {
          setDiscount(0);
        }
        return;
      }

      // Apply global discount first, then coupon discount
      let baseTotal = total;
      let globalDiscountAmount = 0;
      
      if (globalDiscount.active) {
        globalDiscountAmount = (baseTotal * globalDiscount.discountPercent) / 100;
        baseTotal = baseTotal - globalDiscountAmount;
      }
      
      const couponDiscountAmount = (baseTotal * data.coupon.discountPercent) / 100;
      const totalDiscount = globalDiscountAmount + couponDiscountAmount;
      
      setAppliedCoupon(data.coupon);
      setDiscount(totalDiscount);
      setCouponMessage(`Coupon applied! ${data.coupon.discountPercent}% off`);
    } catch (error) {
      setCouponMessage('Failed to validate coupon');
    }
  }

  function removeCoupon() {
    setCouponCode('');
    setAppliedCoupon(null);
    // Revert to global discount only
    if (globalDiscount.active) {
      const globalDiscountAmount = (total * globalDiscount.discountPercent) / 100;
      setDiscount(globalDiscountAmount);
    } else {
      setDiscount(0);
    }
    setCouponMessage('');
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-obsidian pt-28 text-ivory">
        <section className="luxury-container py-16">
          <div className="mb-10">
            <p className="text-sm font-bold uppercase tracking-[0.35em] text-gold">Checkout</p>
            <h1 className="mt-3 font-display text-7xl">Complete Your Order</h1>
          </div>
          <div className="grid gap-8 lg:grid-cols-[1fr_400px]">
            <form onSubmit={handleProceedToConfirmation} className="space-y-6">
              <div className="rounded-[2rem] bg-surface p-7">
                <h2 className="font-display text-3xl mb-6">Shipping Information</h2>
                <div className="space-y-4">
                  <div>
                    <label className="mb-2 block text-sm font-bold uppercase tracking-[0.22em] text-ivory/70">Full Name</label>
                    <input
                      value={formData.name}
                      onChange={(e) => updateField('name', e.target.value)}
                      required
                      className="w-full rounded-2xl border border-ivory/10 bg-ivory px-4 py-3 text-obsidian placeholder:text-obsidian/45 outline-none transition focus:border-gold focus:ring-2 focus:ring-gold/30"
                      placeholder="Enter your full name"
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-bold uppercase tracking-[0.22em] text-ivory/70">Email</label>
                    <input
                      value={formData.email}
                      onChange={(e) => updateField('email', e.target.value)}
                      required
                      type="email"
                      className="w-full rounded-2xl border border-ivory/10 bg-ivory px-4 py-3 text-obsidian placeholder:text-obsidian/45 outline-none transition focus:border-gold focus:ring-2 focus:ring-gold/30"
                      placeholder="Enter your email"
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-bold uppercase tracking-[0.22em] text-ivory/70">Phone</label>
                    <input
                      value={formData.phone}
                      onChange={(e) => updateField('phone', e.target.value)}
                      required
                      type="tel"
                      className={`w-full rounded-2xl border px-4 py-3 text-obsidian placeholder:text-obsidian/45 outline-none transition focus:ring-2 ${phoneError ? 'border-red-500 focus:border-red-500 focus:ring-red-500/30' : 'border-ivory/10 focus:border-gold focus:ring-gold/30'}`}
                      placeholder="03XXXXXXXXX or 92 3XX XXXXXXX"
                    />
                    {phoneError && <p className="mt-2 text-sm font-bold text-red-400">{phoneError}</p>}
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-bold uppercase tracking-[0.22em] text-ivory/70">Address</label>
                    <input
                      value={formData.address}
                      onChange={(e) => updateField('address', e.target.value)}
                      required
                      className="w-full rounded-2xl border border-ivory/10 bg-ivory px-4 py-3 text-obsidian placeholder:text-obsidian/45 outline-none transition focus:border-gold focus:ring-2 focus:ring-gold/30"
                      placeholder="Enter your address"
                    />
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <label className="mb-2 block text-sm font-bold uppercase tracking-[0.22em] text-ivory/70">City</label>
                      <input
                        value={formData.city}
                        onChange={(e) => updateField('city', e.target.value)}
                        required
                        className="w-full rounded-2xl border border-ivory/10 bg-ivory px-4 py-3 text-obsidian placeholder:text-obsidian/45 outline-none transition focus:border-gold focus:ring-2 focus:ring-gold/30"
                        placeholder="City"
                      />
                    </div>
                    <div>
                      <label className="mb-2 block text-sm font-bold uppercase tracking-[0.22em] text-ivory/70">Postal Code</label>
                      <input
                        value={formData.postalCode}
                        onChange={(e) => updateField('postalCode', e.target.value)}
                        required
                        className="w-full rounded-2xl border border-ivory/10 bg-ivory px-4 py-3 text-obsidian placeholder:text-obsidian/45 outline-none transition focus:border-gold focus:ring-2 focus:ring-gold/30"
                        placeholder="Postal code"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Custom Measurements Section */}
              <div className="rounded-[2rem] bg-surface p-7">
                <h2 className="font-display text-3xl mb-6">Custom Measurements (Optional)</h2>
                <p className="text-sm text-ivory/60 mb-4">Provide your custom measurements for a perfect fit</p>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-bold uppercase tracking-[0.22em] text-ivory/70">Waist (inches)</label>
                    <input
                      value={customMeasurements.waist}
                      onChange={(e) => setCustomMeasurements(prev => ({ ...prev, waist: e.target.value }))}
                      placeholder="e.g., 32"
                      className="w-full rounded-2xl border border-ivory/10 bg-ivory px-4 py-3 text-obsidian placeholder:text-obsidian/45 outline-none transition focus:border-gold focus:ring-2 focus:ring-gold/30"
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-bold uppercase tracking-[0.22em] text-ivory/70">Length (inches)</label>
                    <input
                      value={customMeasurements.length}
                      onChange={(e) => setCustomMeasurements(prev => ({ ...prev, length: e.target.value }))}
                      placeholder="e.g., 40"
                      className="w-full rounded-2xl border border-ivory/10 bg-ivory px-4 py-3 text-obsidian placeholder:text-obsidian/45 outline-none transition focus:border-gold focus:ring-2 focus:ring-gold/30"
                    />
                  </div>
                </div>
              </div>

              {message && <p className="rounded-2xl bg-red-500/10 px-4 py-3 text-center text-sm font-bold text-red-200">{message}</p>}
              <button disabled={loading} onClick={handleProceedToConfirmation} className="w-full rounded-full bg-gold px-6 py-4 text-sm font-bold uppercase tracking-[0.25em] text-obsidian transition hover:bg-ivory disabled:opacity-60">
                {loading ? 'Processing...' : 'Proceed to Confirmation'}
              </button>
            </form>
            <div className="rounded-[2rem] bg-surface p-7 h-fit">
              <h2 className="font-display text-3xl mb-6">Order Summary</h2>
              <div className="space-y-4">
                {cart.items.map((item) => {
                  // Get the image for the selected color
                  const getImageForColor = () => {
                    if (item.colorImages && item.colorImages[item.color] && item.colorImages[item.color].length > 0) {
                      return item.colorImages[item.color][0];
                    }
                    return item.images?.[0];
                  };
                  const displayImage = getImageForColor();

                  return (
                    <div key={item.key} className="flex justify-between gap-4 pb-4 border-b border-ivory/10">
                      <div className="flex gap-4 flex-1">
                        {displayImage && (
                          <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-xl bg-ivory/10">
                            <img src={displayImage} alt={item.name} className="h-full w-full object-cover" />
                          </div>
                        )}
                        <div className="flex-1">
                          <h3 className="font-semibold">{item.name}</h3>
                          <p className="text-sm text-ivory/60">
                            {item.color && `Color: ${item.color} · `}
                            Size {item.size} · Qty {item.quantity}
                          </p>
                          {item.category && (item.category.toLowerCase().includes('pant') || item.category.toLowerCase().includes('trouser')) && (
                            <input
                              type="text"
                              placeholder="Waist size (e.g., 32, 34)"
                              className="mt-2 w-full rounded-lg border border-ivory/20 bg-ivory/10 px-3 py-2 text-sm text-ivory placeholder:text-ivory/40 outline-none focus:border-gold"
                              value={waistSizes[item.key] || ''}
                              onChange={(e) => setWaistSizes(prev => ({ ...prev, [item.key]: e.target.value }))}
                            />
                          )}
                        </div>
                      </div>
                      <p className="font-bold text-gold">{formatPrice(item.price * item.quantity)}</p>
                    </div>
                  );
                })}
                <div className="space-y-3 pt-4">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>{formatPrice(total)}</span>
                  </div>
                  {globalDiscount.active && (
                    <div className="flex justify-between text-green-400">
                      <span>Global Discount ({globalDiscount.discountPercent}%)</span>
                      <span>-{formatPrice((total * globalDiscount.discountPercent) / 100)}</span>
                    </div>
                  )}
                  {appliedCoupon && (
                    <div className="flex justify-between text-green-400">
                      <span>Coupon Discount ({appliedCoupon.discountPercent}%)</span>
                      <span>-{formatPrice(discount - (globalDiscount.active ? (total * globalDiscount.discountPercent) / 100 : 0))}</span>
                    </div>
                  )}
                  <div className="flex justify-between pt-3 text-lg font-bold border-t border-ivory/10">
                    <span>Total</span>
                    <span className="text-gold">{formatPrice(discountedTotal)}</span>
                  </div>
                </div>
                <div className="pt-4 border-t border-ivory/10">
                  <label className="mb-2 block text-sm font-bold uppercase tracking-[0.22em] text-ivory/70">Coupon Code</label>
                  <div className="flex gap-2">
                    <input
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                      placeholder="Enter coupon code"
                      disabled={!!appliedCoupon}
                      className="flex-1 rounded-2xl border border-ivory/10 bg-ivory px-4 py-3 text-obsidian placeholder:text-obsidian/45 outline-none transition focus:border-gold focus:ring-2 focus:ring-gold/30 disabled:opacity-60"
                    />
                    {!appliedCoupon ? (
                      <button
                        type="button"
                        onClick={applyCoupon}
                        className="rounded-full bg-gold px-6 py-3 text-sm font-bold uppercase tracking-[0.25em] text-obsidian transition hover:bg-ivory"
                      >
                        Apply
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={removeCoupon}
                        className="rounded-full border border-gold/40 px-6 py-3 text-sm font-bold uppercase tracking-[0.25em] text-gold transition hover:bg-gold/10"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                  {couponMessage && (
                    <p className={`mt-2 text-sm font-bold ${appliedCoupon ? 'text-green-400' : 'text-red-400'}`}>
                      {couponMessage}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      
      {showConfirmation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-surface rounded-[2rem] p-8 max-w-lg w-full max-h-[90vh] overflow-y-auto border border-gold/30">
            <h2 className="font-display text-4xl mb-6 text-gold">Confirm Your Order</h2>
            
            <div className="space-y-4 mb-6">
              <div className="rounded-2xl bg-ivory/5 p-4">
                <h3 className="font-bold text-gold mb-2">Shipping Information</h3>
                <p className="text-ivory/80"><span className="text-ivory/60">Name:</span> {formData.name}</p>
                <p className="text-ivory/80"><span className="text-ivory/60">Email:</span> {formData.email}</p>
                <p className="text-ivory/80"><span className="text-ivory/60">Phone:</span> {formData.phone}</p>
                <p className="text-ivory/80"><span className="text-ivory/60">Address:</span> {formData.address}, {formData.city}, {formData.postalCode}</p>
              </div>
              
              <div className="rounded-2xl bg-ivory/5 p-4">
                <h3 className="font-bold text-gold mb-2">Order Items</h3>
                {cart.items.map((item) => (
                  <div key={item.key} className="flex justify-between py-2 border-b border-ivory/10 last:border-0">
                    <span className="text-ivory/80">{item.name} (Size: {item.size}, Qty: {item.quantity})</span>
                    <span className="text-gold">{formatPrice(item.price * item.quantity)}</span>
                  </div>
                ))}
                <div className="flex justify-between pt-3 font-bold text-lg">
                  <span>Subtotal</span>
                  <span className="text-gold">{formatPrice(total)}</span>
                </div>
                {globalDiscount.active && (
                  <div className="flex justify-between text-green-400">
                    <span>Global Discount ({globalDiscount.discountPercent}%)</span>
                    <span>-{formatPrice((total * globalDiscount.discountPercent) / 100)}</span>
                  </div>
                )}
                {appliedCoupon && (
                  <div className="flex justify-between text-green-400">
                    <span>Coupon Discount ({appliedCoupon.discountPercent}%)</span>
                    <span>-{formatPrice(discount - (globalDiscount.active ? (total * globalDiscount.discountPercent) / 100 : 0))}</span>
                  </div>
                )}
                <div className="flex justify-between pt-3 font-bold text-xl border-t border-ivory/10">
                  <span>Total</span>
                  <span className="text-gold">{formatPrice(discountedTotal)}</span>
                </div>
              </div>
            </div>
            
            {message && <p className="rounded-2xl bg-red-500/10 px-4 py-3 text-center text-sm font-bold text-red-200 mb-4">{message}</p>}
            
            <div className="flex gap-4">
              <button 
                onClick={handleCancelConfirmation}
                disabled={loading}
                className="flex-1 rounded-full border border-gold/40 px-6 py-3 text-sm font-bold uppercase tracking-[0.25em] text-gold transition hover:bg-gold/10 disabled:opacity-60"
              >
                Cancel
              </button>
              <button 
                onClick={confirmOrder}
                disabled={loading}
                className="flex-1 rounded-full bg-gold px-6 py-3 text-sm font-bold uppercase tracking-[0.25em] text-obsidian transition hover:bg-ivory disabled:opacity-60"
              >
                {loading ? 'Processing...' : 'Confirm Order'}
              </button>
            </div>
          </div>
        </div>
      )}
      
      <Footer />
    </>
  );
}
