import Link from 'next/link';
import { Facebook, Instagram } from 'lucide-react';

const shop = ['Collections', 'New Arrivals', 'Lookbook', 'Sale'];
const help = ['About', 'Contact', 'Size Guide', 'Returns'];

export default function Footer() {
  return (
    <footer className="border-t border-white/10 bg-obsidian py-16">
      <div className="luxury-container grid gap-10 md:grid-cols-4">
        <div>
          <h2 className="font-display text-4xl tracking-[0.24em]">MAKHSOOS <span className="text-gold">✦</span></h2>
          <p className="mt-4 max-w-xs text-sm leading-6 text-muted">Luxury Pakistani clothing crafted for women who carry culture with confidence.</p>
          <div className="mt-6 flex gap-4 text-gold"><Instagram /><Facebook /><span className="font-bold">TikTok</span><span className="font-bold">P</span></div>
        </div>
        <div><h3 className="mb-4 text-sm font-bold uppercase tracking-[0.25em] text-gold">Shop</h3>{shop.map((item) => <Link key={item} href="/collections" className="mb-3 block text-muted transition hover:text-ivory">{item}</Link>)}</div>
        <div><h3 className="mb-4 text-sm font-bold uppercase tracking-[0.25em] text-gold">Help</h3>{help.map((item) => <Link key={item} href="/about" className="mb-3 block text-muted transition hover:text-ivory">{item}</Link>)}</div>
        <div>
          <h3 className="mb-4 text-sm font-bold uppercase tracking-[0.25em] text-gold">Contact</h3>
          <p className="text-muted">Lahore, Pakistan</p><p className="mt-2 text-muted">hello@makhsoos.pk</p><p className="mt-2 text-muted">+92 300 0000000</p>
          <div className="mt-6 flex flex-wrap gap-2">{['Visa', 'Mastercard', 'Easypaisa', 'JazzCash'].map((item) => <span key={item} className="rounded border border-gold/30 px-3 py-1 text-xs text-gold">{item}</span>)}</div>
        </div>
      </div>
      <div className="luxury-container mt-12 flex flex-col justify-between gap-4 border-t border-white/10 pt-8 text-sm text-muted md:flex-row"><p>© 2025 MAKHSOOS. All rights reserved.</p><p>Made with ♥ in Pakistan 🇵🇰</p></div>
    </footer>
  );
}
