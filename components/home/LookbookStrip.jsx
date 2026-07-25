'use client';

import Image from 'next/image';
import { useRef } from 'react';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

export default function LookbookStrip({ items = [] }) {
  const ref = useRef(null);
  const scroll = (direction) => ref.current?.scrollBy({ left: direction * 360, behavior: 'smooth' });

  return (
    <section className="relative overflow-hidden bg-surface py-24">
      <div className="pointer-events-none absolute left-0 top-8 font-display text-[16vw] leading-none text-white/[0.035]">THE LOOKBOOK</div>
      <div className="luxury-container relative z-10">
        <div className="mb-10 flex items-center justify-between"><h2 className="font-display text-4xl md:text-6xl">THE LOOKBOOK</h2><div className="hidden gap-3 md:flex"><button onClick={() => scroll(-1)} className="rounded-full border border-gold/50 p-3 text-gold"><ArrowLeft /></button><button onClick={() => scroll(1)} className="rounded-full border border-gold/50 p-3 text-gold"><ArrowRight /></button></div></div>
        <div ref={ref} className="no-scrollbar flex gap-6 overflow-x-auto scroll-smooth pb-4">
          {items.slice(0, 5).map((item, index) => <motion.div key={item.id} initial={{ opacity: 0, x: 80 }} whileInView={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.08 }} viewport={{ once: true }} className="relative aspect-[3/4] min-w-[280px] overflow-hidden bg-gradient-to-br from-stone-800 to-stone-950 md:min-w-[340px]"><Image src={item.image} alt={item.title} fill sizes="340px" className="object-cover" /><div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black via-black/70 to-transparent p-6"><h3 className="font-display text-3xl">{item.title}</h3><p className="text-gold">{item.subtitle}</p></div></motion.div>)}
        </div>
      </div>
    </section>
  );
}
