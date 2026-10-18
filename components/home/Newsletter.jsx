'use client';

import { useState } from 'react';
import { Check } from 'lucide-react';
import { motion } from 'framer-motion';
import Button from '@/components/ui/Button';

export default function Newsletter() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  return (
    <section className="bg-surface py-24">
      <div className="luxury-container rounded-[2rem] border border-wood/20 bg-surface-elevated p-10 text-center shadow-luxury md:p-16">
        <h2 className="font-display text-6xl">Join the Inner Circle</h2>
        <p className="mx-auto mt-4 max-w-xl text-ivory/70">Be first to know. Exclusive drops, styling edits & member offers.</p>
        {submitted ? <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="mt-10 flex items-center justify-center gap-3 text-wood"><Check /> You&apos;re in!</motion.div> : <form onSubmit={(event) => { event.preventDefault(); setSubmitted(true); }} className="mx-auto mt-10 flex max-w-2xl flex-col gap-3 sm:flex-row"><input value={email} onChange={(event) => setEmail(event.target.value)} type="email" required placeholder="Email address" className="min-h-[52px] flex-1 rounded-full border border-white/10 bg-obsidian px-6 outline-none transition focus:border-wood" /><Button type="submit">Subscribe</Button></form>}
      </div>
    </section>
  );
}
