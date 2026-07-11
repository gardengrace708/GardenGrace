'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Heart, LogOut, Menu, Search, ShoppingBag, User, X, Minus, Plus, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '@/components/providers/CartProvider';
import { useWishlist } from '@/components/providers/WishlistProvider';
import { formatPrice } from '@/lib/utils';
import NavLink from '@/components/ui/NavLink';
import OfferPopup from '@/components/ui/OfferPopup';

const links = [
  { href: '/shop', label: 'Shop' },
  { href: '/collections', label: 'Collections' },
  { href: '/lookbook', label: 'Lookbook' },
  { href: '/my-orders', label: 'My Orders' },
  { href: '/about', label: 'About' }
];

export default function Navbar() {
  const [hovered, setHovered] = useState(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [globalDiscount, setGlobalDiscount] = useState({ active: false, discountPercent: 0 });
  const cart = useCart();
  const wishlist = useWishlist();
  const navLinks = currentUser?.user === 1 ? [...links, { href: '/admin', label: 'Admin' }] : links;

  useEffect(() => {
    fetch('/api/auth/me').then((response) => response.json()).then((data) => setCurrentUser(data.user)).catch(() => setCurrentUser(null));
  }, []);

  useEffect(() => {
    fetch('/api/global-discount/status')
      .then((res) => res.json())
      .then((data) => setGlobalDiscount(data))
      .catch(() => setGlobalDiscount({ active: false, discountPercent: 0 }));
  }, []);

  useEffect(() => {
    const delayDebounce = setTimeout(async () => {
      if (searchQuery.trim()) {
        const response = await fetch(`/api/products?q=${encodeURIComponent(searchQuery)}`);
        const data = await response.json();
        setSearchResults(data.products || []);
      } else {
        setSearchResults([]);
      }
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [searchQuery]);

  async function logout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    setCurrentUser(null);
    window.location.href = '/';
  }

  return (
    <header className="fixed inset-x-0 top-0 z-50 w-[100vw] bg-ivory text-black shadow-2xl transition duration-500">
      <nav className="luxury-container flex h-20 items-center justify-between">
        <NavLink href="/" className="font-display text-2xl sm:text-3xl tracking-[0.28em] ">MAKHSOOS </NavLink>
        <motion.div initial="hidden" animate="visible" variants={{ visible: { transition: { staggerChildren: 0.08 } } }} className="hidden items-center gap-9 md:flex">
          {navLinks.map((link) => (
            <motion.div variants={{ hidden: { opacity: 0, y: -8 }, visible: { opacity: 1, y: 0 } }} key={link.href} onMouseEnter={() => setHovered(link.href)} onMouseLeave={() => setHovered(null)} className="relative">
              <NavLink href={link.href} className="text-sm uppercase tracking-[0.24em] text-black transition">{link.label}</NavLink>
              {hovered === link.href && <motion.span layoutId="navUnderline" className="absolute -bottom-2 left-0 h-px w-full bg-gold" />}
            </motion.div>
          ))}
        </motion.div>
        <div className="flex items-center gap-3">
          <AnimatePresence>
            {searchOpen && (
              <div className="relative hidden md:block">
                <motion.input 
                  initial={{ width: 0, opacity: 0 }} 
                  animate={{ width: 200, opacity: 1 }} 
                  exit={{ width: 0, opacity: 0 }} 
                  className="rounded-full border border-gold/40 bg-obsidian/80 px-4 py-2 text-sm outline-none focus:border-gold text-white"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                {searchResults.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-obsidian/95 backdrop-blur-xl border border-gold/30 rounded-2xl shadow-2xl overflow-hidden z-50">
                    {searchResults.map((product) => (
                      <Link 
                        key={product.id} 
                        href={`/products/${product.id}`}
                        onClick={() => { setSearchOpen(false); setSearchQuery(''); setSearchResults([]); }}
                        className="flex items-center gap-3 p-3 hover:bg-gold/10 transition border-b border-white/5 last:border-0"
                      >
                        <div className="h-12 w-12 rounded-lg overflow-hidden bg-white/10">
                          <img src={product.images[0]} alt={product.name} className="h-full w-full object-cover" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-ivory">{product.name}</p>
                          <p className="text-xs text-gold">{formatPrice(product.price)}</p>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            )}
          </AnimatePresence>
          <button onClick={() => setSearchOpen(!searchOpen)} className="hidden p-2 transition hover:text-gold md:block" aria-label="Search"><Search size={20} /></button>
          <NavLink href="/wishlist" className="relative hidden p-2 transition hover:text-gold md:block" aria-label="Wishlist"><Heart size={20} /><span className="absolute -right-1 -top-1 text-xs ">{wishlist?.count || 0}</span></NavLink>
          <button onClick={() => setCartOpen(true)} className="relative p-2 transition hover:text-gold" aria-label="Cart"><ShoppingBag size={20} /><span className="absolute -right-1 -top-1 text-xs ">{cart?.count || 0}</span></button>
          {currentUser ? <><NavLink href="/profile" className="hidden p-2 transition hover:text-gold md:block" aria-label="Profile"><User size={20} /></NavLink><button onClick={logout} className="hidden p-2 transition hover:text-gold md:block" aria-label="Logout"><LogOut size={20} /></button></> : <NavLink href="/login" className="hidden p-2 transition hover:text-gold md:block" aria-label="Login"><User size={20} /></NavLink>}
          <button onClick={() => setMenuOpen(true)} className="p-2 md:hidden" aria-label="Open menu"><Menu /></button>
        </div>
      </nav>
      <AnimatePresence>
        {menuOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-obsidian p-8 md:hidden">
            <button onClick={() => setMenuOpen(false)} className="absolute right-6 top-6"><X className='m-4 md:m-0'/></button>
            <motion.div initial="hidden" animate="visible" variants={{ visible: { transition: { staggerChildren: 0.12, delayChildren: 0.2 } } }} className="flex h-full bg-ivory flex-col items-center justify-center gap-8">
              {navLinks.map((link) => <motion.div key={link.href} variants={{ hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0 } }}><NavLink onClick={() => setMenuOpen(false)} href={link.href} className="font-display text-5xl">{link.label}</NavLink></motion.div>)}
              <motion.div variants={{ hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0 } }} className="w-full max-w-md px-4">
                <input 
                  className="w-full rounded-full border border-gold/40 bg-obsidian/80 px-6 py-3 text-sm outline-none focus:border-gold text-white"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                {searchResults.length > 0 && (
                  <div className="mt-4 bg-obsidian/95 backdrop-blur-xl border border-gold/30 rounded-2xl shadow-2xl overflow-hidden max-h-64 overflow-y-auto">
                    {searchResults.map((product) => (
                      <NavLink 
                        key={product.id} 
                        href={`/products/${product.id}`}
                        onClick={() => { setMenuOpen(false); setSearchQuery(''); setSearchResults([]); }}
                        className="flex items-center gap-3 p-3 hover:bg-gold/10 transition border-b border-white/5 last:border-0"
                      >
                        <div className="h-12 w-12 rounded-lg overflow-hidden bg-white/10">
                          <img src={product.images[0]} alt={product.name} className="h-full w-full object-cover" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-ivory">{product.name}</p>
                          <p className="text-xs text-gold">{formatPrice(product.price)}</p>
                        </div>
                      </NavLink>
                    ))}
                  </div>
                )}
              </motion.div>
              <motion.div variants={{ hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0 } }} className="flex gap-6 pt-4">
                <NavLink href="/wishlist" onClick={() => setMenuOpen(false)} className="relative p-3 rounded-full border border-ivory/20 transition hover:border-gold hover:text-gold"><Heart size={24} /><span className="absolute -right-1 -top-1 text-xs">{wishlist?.count || 0}</span></NavLink>
                {currentUser ? <NavLink onClick={() => setMenuOpen(false)} href="/profile" className="p-3 rounded-full border border-ivory/20 transition hover:border-gold hover:text-gold"><User size={24} /></NavLink> : <NavLink onClick={() => setMenuOpen(false)} href="/login" className="p-3 rounded-full border border-ivory/20 transition hover:border-gold hover:text-gold"><User size={24} /></NavLink>}
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {cartOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setCartOpen(false)} className="absolute inset-0  backdrop-blur-sm" />
            <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', damping: 30, stiffness: 300 }} className="relative ml-auto  h-screen w-full  max-w-md bg-black/80 backdrop-blur-xl shadow-2xl border-l border-white/10">
              <div className="flex h-full flex-col">
                <div className="flex items-center justify-between border-b border-ivory/10 p-6">
                  <div>
                    <h2 className="font-display text-ivory text-3xl">Your Cart</h2>
                    <p className="text-sm text-ivory/60">{cart.items.length} {cart.items.length === 1 ? 'item' : 'items'}</p>
                  </div>
                  <button onClick={() => setCartOpen(false)} className="p-2 transition hover:text-gold"><X className='text-ivory ' size={24} /></button>
                </div>
                {cart.items.length === 0 ? (
                  <div className="flex flex-1 flex-col items-center justify-center p-8 text-center">
                    <ShoppingBag size={48} className="mb-4 text-ivory/30" />
                    <p className="text-ivory/60 mb-6">Your cart is empty</p>
                    <NavLink href="/collections" onClick={() => setCartOpen(false)} className="rounded-full bg-gold px-6 py-3 text-sm font-bold uppercase tracking-[0.25em] text-obsidian transition hover:bg-ivory">
                      Continue Shopping
                    </NavLink>
                  </div>
                ) : (
                  <>
                    <div className="flex-1 text-white  overflow-y-auto p-6">
                      <div className=" space-y-4">
                        {cart.items.map((item) => (
                          <div key={item.key} className="flex  gap-4 rounded-2xl border border-white/10 bg-black/70 backdrop-blur-md p-4">
                            {item.images && item.images[0] && (
                              <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-xl bg-ivory/10">
                                <img src={item.images[0]} alt={item.name} className="h-full w-full object-cover" />
                              </div>
                            )}
                            <div className="flex-1">
                              <h3 className="font-semibold">{item.name}</h3>
                              <p className="text-sm text-ivory/60">
                                {item.color && `${item.color} · `}
                                Size {item.size}
                              </p>
                              {globalDiscount.active ? (
                                <div className="mt-1">
                                  <p className="font-bold text-green-400">{formatPrice(item.price * (1 - globalDiscount.discountPercent / 100))}</p>
                                  <p className="text-xs text-ivory/50 line-through">{formatPrice(item.price)}</p>
                                </div>
                              ) : (
                                <p className="mt-1 font-bold text-gold">{formatPrice(item.price)}</p>
                              )}
                            </div>
                            <div className="flex flex-col items-center justify-between gap-2">
                              <div className="flex items-center gap-2">
                                <button onClick={() => cart.updateQuantity(item.key, item.quantity - 1)} className="flex h-8 w-8 items-center justify-center rounded-full border border-ivory/20 transition hover:border-gold hover:text-gold"><Minus size={16} /></button>
                                <span className="w-8 text-center">{item.quantity}</span>
                                <button onClick={() => cart.updateQuantity(item.key, item.quantity + 1)} className="flex h-8 w-8 items-center justify-center rounded-full border border-ivory/20 transition hover:border-gold hover:text-gold"><Plus size={16} /></button>
                              </div>
                              <button onClick={() => cart.removeFromCart(item.key)} className="p-1 transition hover:text-red-400"><Trash2 size={16} /></button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="border-t text-yellow-800 bg-black/80 border-ivory/10 p-6">
                      <div className="mb-2 flex justify-between text-sm text-ivory/60">
                        <span>Subtotal</span>
                        <span>{formatPrice(cart.items.reduce((sum, item) => sum + item.price * item.quantity, 0))}</span>
                      </div>
                      {globalDiscount.active && (
                        <div className="mb-2 flex justify-between text-sm text-green-400">
                          <span>Global Discount ({globalDiscount.discountPercent}%)</span>
                          <span>-{formatPrice((cart.items.reduce((sum, item) => sum + item.price * item.quantity, 0) * globalDiscount.discountPercent) / 100)}</span>
                        </div>
                      )}
                      <div className="mb-2 flex justify-between text-sm text-ivory/60">
                        <span>Shipping</span>
                        <span>Free</span>
                      </div>
                      <div className="mb-4 flex justify-between text-lg font-bold">
                        <span>Total</span>
                        <span className="text-gold">{formatPrice(globalDiscount.active ? cart.items.reduce((sum, item) => sum + item.price * item.quantity, 0) * (1 - globalDiscount.discountPercent / 100) : cart.items.reduce((sum, item) => sum + item.price * item.quantity, 0))}</span>
                      </div>
                      <div className="mb-3 flex gap-2">
                        <NavLink href="/collections" onClick={() => setCartOpen(false)} className="flex-1 rounded-full border border-gold/40 px-6 py-3 text-center text-sm font-bold uppercase tracking-[0.25em] text-gold transition hover:bg-gold/10">
                          Continue Shopping
                        </NavLink>
                        <button onClick={() => cart.clearCart()} className="rounded-full border border-red-400/40 px-4 py-3 text-sm font-bold uppercase tracking-[0.25em] text-red-400 transition hover:bg-red-400/10">
                          Clear
                        </button>
                      </div>
                      <NavLink href="/checkout" onClick={() => setCartOpen(false)} className="block w-full rounded-full bg-gold px-6 py-4 text-center text-sm font-bold uppercase tracking-[0.25em] text-obsidian transition hover:bg-ivory">
                        Checkout
                      </NavLink>
                    </div>
                  </>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      <OfferPopup globalDiscount={globalDiscount} />
    </header>
  );
}
