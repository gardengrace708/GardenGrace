'use client';

import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { testimonials } from '@/lib/data/testimonials';

export default function Testimonials() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setIndex((current) => (current + 1) % testimonials.length), 4000);
    return () => clearInterval(timer);
  }, []);

  const review = testimonials[index];

  return (
    <section className="bg-ivory text-black py-24">
      <div className="luxury-container text-center">
        <div className="font-display text-9xl leading-none text-gold">“</div>
        <AnimatePresence mode="wait">
          <motion.div key={review.name} initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -18 }} transition={{ duration: 0.45 }}>
            <p className="text-gold">★★★★★</p>
            <p className="mx-auto mt-6 max-w-3xl font-display text-4xl leading-tight md:text-5xl">{review.quote}</p>
            <p className="mt-8 text-sm font-bold uppercase tracking-[0.28em] text-ivory">{review.name}</p>
            <p className="mt-1 text-muted">{review.city}</p>
          </motion.div>
        </AnimatePresence>
        <div className="mt-8 flex justify-center gap-2">{testimonials.map((item, itemIndex) => <button key={item.name} onClick={() => setIndex(itemIndex)} className={`h-2 rounded-full transition-all ${index === itemIndex ? 'w-8 bg-gold' : 'w-2 bg-white/30'}`} />)}</div>
      </div>
    </section>
  );
}
