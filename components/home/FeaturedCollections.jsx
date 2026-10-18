'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { fadeUp, stagger } from '@/lib/utils';
import NavLink from '@/components/ui/NavLink';

export default function FeaturedCollections({ collections = [] }) {
  return (
    <section className="bg-obsidian py-24">
      <div className="luxury-container">
        <div className="mb-14 flex items-center justify-center gap-6"><span className="h-px w-20 bg-wood/50" /><h2 className="text-center font-display text-3xl md:text-6xl">The Collections</h2><span className="h-px w-20 bg-wood/50" /></div>
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.25 }} variants={stagger} className="grid gap-6 md:grid-cols-2 md:grid-rows-2">
          {collections.map((collection, index) => (
            <motion.div key={collection.slug} variants={fadeUp} className={index === 0 ? 'md:row-span-2' : ''}>
              <NavLink href={`/collections/${collection.slug}`} className="group relative block h-full min-h-[360px] overflow-hidden bg-surface">
                <Image src={collection.image} alt={collection.name} fill sizes="(max-width: 768px) 100vw, 50vw" className="object-cover transition duration-700 group-hover:scale-105" />
                <div className="absolute inset-0 bg-black/45 transition group-hover:bg-black/65" />
                <div className="absolute inset-x-8 bottom-8">
                  <p className="mb-3 text-xs font-bold uppercase tracking-[0.28em] text-wood">{collection.tag}</p>
                  <h3 className="font-display text-white  text-5xl text-black">{collection.name}</h3>
                  <span className="mt-5 inline-block translate-y-6 text-sm font-bold uppercase tracking-[0.25em] text-ivory opacity-0 transition duration-500 group-hover:translate-y-0 group-hover:opacity-100">Explore →</span>
                </div>
              </NavLink>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
