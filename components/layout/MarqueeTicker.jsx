export default function MarqueeTicker() {
  const text = 'NEW COLLECTION 2025 ✦ HANDCRAFTED IN PAKISTAN ✦ GardenGrace ✦ PREMIUM MATERIALS ✦ LIMITED EDITION ✦';
  return (
    <div className="overflow-hidden border-y border-wood/40 bg-surface py-4 text-wood">
      <div className="flex w-max animate-marquee hover:[animation-play-state:paused]">
        <div className="whitespace-nowrap px-6 text-sm font-bold uppercase tracking-[0.35em]">{text}</div>
        <div className="whitespace-nowrap px-6 text-sm font-bold uppercase tracking-[0.35em]">{text}</div>
      </div>
    </div>
  );
}
