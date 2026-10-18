'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import Button from '@/components/ui/Button';

const stats = [
  { value: 50, label: 'Unique Designs' },
  { value: 500, label: 'Happy Customers' },
  { value: 5, label: 'Years of Craft' }
];

function Counter({ value }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!inView) return;
    let frame;
    const start = performance.now();
    const tick = (now) => {
      const progress = Math.min((now - start) / 1300, 1);
      setCount(Math.floor(progress * value));
      if (progress < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [inView, value]);

  return <span ref={ref}>{count.toLocaleString('en-PK')}+</span>;
}

export default function BrandStory() {
  return (
    <section className="bg-ivory w-[100vw] py-24">
      <div className="luxury-container grid items-center gap-12 lg:grid-cols-[3fr_2fr]">
       <div className="relative min-h-[320px] md:min-h-[620px] overflow-hidden bg-surface">
  <Image
    src="/images/brandstory.jpg"
    alt="GardenGrace atelier"
    fill
    sizes="(max-width: 768px) 100vw, 60vw"
    className="object-cover object-center"
  />
</div>
        <div className="relative lg:border-l lg:border-wood/50 lg:pl-12">
          <p className="text-sm font-bold uppercase tracking-[0.3em] text-wood">Our Essence</p>
          <h2 className="mt-4 font-display text-black text-3xl md:text-6xl leading-none">Born from Tradition. Designed for Today.</h2>
          <p className="mt-6 leading-8 text-black">GardenGrace was created for those who seek furniture with presence: pieces that honor Pakistani craftsmanship while feeling unmistakably modern.</p>
          <p className="mt-4 leading-8 text-black">Every design is considered, every material selected with care, and every detail refined until it feels worthy of your most beautiful spaces.</p>
          <div className="mt-10 grid grid-cols-3 gap-5">{stats.map((stat) => <div key={stat.label}><p className="font-display text-4xl text-wood"><Counter value={stat.value} /></p><p className="mt-2 text-xs uppercase tracking-[0.2em] text-muted">{stat.label}</p></div>)}</div>
          <Button href="/about" className="mt-10">Our Story</Button>
        </div>
      </div>
    </section>
  );
}
