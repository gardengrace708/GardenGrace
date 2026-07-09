import Link from 'next/link';

export default function Button({ children, href, variant = 'primary', className = '', ...props }) {
  const base = 'inline-flex items-center justify-center rounded-full px-7 py-3 text-sm font-semibold uppercase tracking-[0.22em] transition duration-300 focus:outline-none focus:ring-2 focus:ring-gold';
  const styles = variant === 'outline'
    ? 'border border-gold/70 text-ivory hover:bg-gold hover:text-obsidian'
    : 'bg-gold text-obsidian hover:bg-gold-light shadow-luxury';
  const classes = `${base} ${styles} ${className}`;

  if (href) {
    return <Link href={href} className={classes}>{children}</Link>;
  }

  return <button className={classes} {...props}>{children}</button>;
}
