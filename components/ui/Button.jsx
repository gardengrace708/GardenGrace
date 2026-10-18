import Link from 'next/link';

export default function Button({ children, href, variant = 'primary', className = '', ...props }) {
  const base = 'inline-flex items-center justify-center rounded-full px-7 py-3 text-sm font-semibold uppercase tracking-[0.22em] transition duration-300 focus:outline-none focus:ring-2 focus:ring-wood';
  const styles = variant === 'outline'
    ? 'border border-wood/70 text-ivory hover:bg-wood hover:text-obsidian'
    : 'bg-wood text-obsidian hover:bg-wood-light shadow-luxury';
  const classes = `${base} ${styles} ${className}`;

  if (href) {
    return <Link href={href} className={classes}>{children}</Link>;
  }

  return <button className={classes} {...props}>{children}</button>;
}
