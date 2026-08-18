import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="border-t border-white/10 bg-obsidian py-12">
      <div className="luxury-container">
        <div className="flex flex-col items-center justify-center gap-6 text-center">
          <h2 className="font-display text-3xl tracking-[0.24em] text-gold">MAKHSOOS</h2>
          <p className="text-sm text-muted">Style. Quality. You.</p>
          <div className="flex gap-8 text-sm text-muted">
            <Link href="/collections" className="transition hover:text-ivory">Collections</Link>
            <Link href="/about" className="transition hover:text-ivory">About</Link>
            <Link href="/lookbook" className="transition hover:text-ivory">LookBook</Link>
            <Link href="/shop" className="transition hover:text-ivory">All Products</Link>
          </div>
          <p className="text-xs text-muted">© 2025 MAKHSOOS. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
