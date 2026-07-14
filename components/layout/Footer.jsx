import Link from 'next/link';
import { Facebook, Instagram } from 'lucide-react';

const shop = [
  { label: 'Collections', href: '/collections' },
  { label: 'New Arrivals', href: '/#new-arrivals' },
  { label: 'Lookbook', href: '/lookbook' },
];
const help = [
  { label: 'About', href: '/about' },
  { label: 'Contact', href: 'tel:03280362181' },
  { label: 'Track Order', href: '/track-order' },
  { label: 'Size Guide', href: 'https://wa.me/923280362181' },
  { label: 'Returns', href: '/about' }
];

export default function Footer() {
  return (
    <footer className="border-t border-white/10 bg-obsidian py-16">
      <div className="luxury-container grid gap-10 md:grid-cols-4">
        <div>
          <h2 className="font-display text-4xl tracking-[0.24em]">MAKHSOOS <span className="text-gold">✦</span></h2>
          <p className="mt-4 max-w-xs text-sm leading-6 text-muted">Luxury Pakistani clothing crafted for men who carry culture with confidence.</p>
          <div className="mt-6 flex gap-4">
            <a href="https://www.tiktok.com/@makhsoos_men" target="_blank" rel="noopener noreferrer" className="text-gold hover:text-ivory transition">TikTok</a>
            <a href="https://www.instagram.com/makhsoos_men" target="_blank" rel="noopener noreferrer" className="text-gold hover:text-ivory transition">Instagram</a>
          </div>
        </div>
        <div><h3 className="mb-4 text-sm font-bold uppercase tracking-[0.25em] text-gold">Shop</h3>{shop.map((item) => <Link key={item.label} href={item.href} className="mb-3 block text-muted transition hover:text-ivory">{item.label}</Link>)}</div>
        <div><h3 className="mb-4 text-sm font-bold uppercase tracking-[0.25em] text-gold">Help</h3>{help.map((item) => <Link key={item.label} href={item.href} className="mb-3 block text-muted transition hover:text-ivory" target={item.href.startsWith('http') || item.href.startsWith('tel:') ? '_blank' : undefined} rel={item.href.startsWith('http') ? 'noopener noreferrer' : undefined}>{item.label}</Link>)}</div>
        <div>
          <h3 className="mb-4 text-sm font-bold uppercase tracking-[0.25em] text-gold">Contact</h3>
          <p className="text-muted">📍 Faisalabad, Pakistan</p>
          <p className="mt-2 text-muted">📞 <a href="tel:03280362181" className="text-gold hover:text-ivory transition">03280362181</a></p>
          <p className="mt-2 text-muted">✉️ makhsoos708@gmail.com</p>
          <p className="mt-4 text-gold text-sm">🚚 All Pakistan Delivery - COD Available</p>
          {/* <div className="mt-6 flex flex-wrap gap-2">{['Visa', 'Mastercard', 'Easypaisa', 'JazzCash'].map((item) => <span key={item} className="rounded border border-gold/30 px-3 py-1 text-xs text-gold">{item}</span>)}</div> */}
        </div>
      </div>
      <div className="luxury-container mt-12 flex flex-col justify-between gap-4 border-t border-white/10 pt-8 text-sm text-muted md:flex-row"><p>© 2026 MAKHSOOS. All rights reserved.</p><p>Made with ♥ in Pakistan 🇵🇰</p></div>
    </footer>
  );
}
