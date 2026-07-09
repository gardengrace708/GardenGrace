export default function MarqueeTicker() {
  const text = 'NEW COLLECTION 2025 ✦ HANDCRAFTED IN PAKISTAN ✦ MAKHSOOS ✦ PREMIUM FABRICS ✦ LIMITED EDITION ✦';
  return (
    <div className="overflow-hidden border-y border-gold/40 bg-surface py-4 text-gold">
      <div className="flex w-max animate-marquee hover:[animation-play-state:paused]">
        <div className="whitespace-nowrap px-6 text-sm font-bold uppercase tracking-[0.35em]">{text}</div>
        <div className="whitespace-nowrap px-6 text-sm font-bold uppercase tracking-[0.35em]">{text}</div>
      </div>
    </div>
  );
}
