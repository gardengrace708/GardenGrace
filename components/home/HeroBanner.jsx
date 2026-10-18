'use client';

import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import Button from '@/components/ui/Button';

const slides = [
  { image: '/images/hero-1.jpg', headline: 'Crafted for the Extraordinary', sub: 'Premium Furniture — New Collection 2026', cta: 'Explore Collection' },
  { image: '/images/hero-2.jpg', headline: 'Where Comfort Meets Style', sub: 'Handcrafted furniture. Timeless design.', cta: 'Shop Now' },
  { image: '/images/hero-3.jpg', headline: 'خاص لوگوں کے لیے خاص فرنیچر', sub: 'Because you deserve to feel GardenGrace', cta: 'View Catalog' }
];

export default function HeroBanner() {
  const [index, setIndex] = useState(0);
  const [heroVideo, setHeroVideo] = useState('');
  const [heroImage, setHeroImage] = useState('');
  const [heroType, setHeroType] = useState('video');
  const paused = useRef(false);

  useEffect(() => {
    const timer = setInterval(() => {
      if (!paused.current) setIndex((current) => (current + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    fetch('/api/site-content')
      .then(res => res.json())
      .then(data => {
        if (data.content?.heroType) {
          setHeroType(data.content.heroType);
        }
        if (data.content?.heroVideo) {
          setHeroVideo(data.content.heroVideo);
        }
        if (data.content?.heroImage) {
          setHeroImage(data.content.heroImage);
        }
      })
      .catch(console.error);
  }, []);

  const slide = slides[index];

  return (
    <section onMouseEnter={() => { paused.current = true; }} onMouseLeave={() => { paused.current = false; }} className="relative h-screen overflow-hidden bg-ivory">
      {/* Mobile & Laptop Background Media */}
      {heroType === 'video' && heroVideo && (
        <div className="absolute inset-0 z-0 xl:hidden">
          <video
            src={heroVideo}
            autoPlay
            loop
            muted
            playsInline
            className="h-full w-full object-cover xl:opacity-50"
          />
          <div className="absolute inset-0 bg-black/50" />
        </div>
      )}
      {heroType === 'image' && heroImage && (
        <div className="absolute inset-0 z-0 xl:hidden">
          <Image
            src={heroImage}
            alt="Hero"
            fill
            className="object-cover xl:opacity-50"
          />
          <div className="absolute inset-0 bg-black/50" />
        </div>
      )}
      
      <div className="luxury-container relative z-10 flex h-full items-center pt-20">
        <AnimatePresence mode="wait">
          <motion.div key={slide.headline} initial="hidden" animate="visible" exit="hidden" variants={{ visible: { transition: { staggerChildren: 0.16 } } }} className="max-w-3xl">
            <motion.p variants={{ hidden: { opacity: 0, y: 24 }, visible: { opacity: 1, y: 0 } }} className="mb-5 text-sm font-bold uppercase tracking-[0.35em] text-wood">GardenGrace Atelier</motion.p>
            <motion.h1 variants={{ hidden: { opacity: 0, y: 34 }, visible: { opacity: 1, y: 0 } }} className="font-display text-6xl leading-[0.95] text-white xl:text-black xl:text-7xl xl:w-[45vw]">{slide.headline}</motion.h1>
            <motion.p variants={{ hidden: { opacity: 0, y: 34 }, visible: { opacity: 1, y: 0 } }} className="mt-6 max-w-xl text-lg text-white xl:text-black xl:text-2xl">{slide.sub}</motion.p>
            <motion.div variants={{ hidden: { opacity: 0, y: 34 }, visible: { opacity: 1, y: 0 } }} className="mt-10 flex flex-wrap gap-4"><Button href="/collections">{slide.cta}</Button><Button className='text-yellow-600 xl:text-yellow-900' href="/lookbook" variant="outline">View Lookbook</Button></motion.div>
          </motion.div>
        </AnimatePresence>
      </div>
      
      {/* Computer Right Side Media */}
      {heroType === 'video' && heroVideo && (
        <div className="absolute right-0 top-0 hidden h-full w-1/2 xl:block">
          <video
            src={heroVideo}
            autoPlay
            loop
            muted
            playsInline
            className="h-full w-full object-cover"
          />
        </div>
      )}
      {heroType === 'image' && heroImage && (
        <div className="absolute right-0 top-0 hidden h-full w-1/2 xl:block">
          <Image
            src={heroImage}
            alt="Hero"
            fill
            className="object-cover"
          />
        </div>
      )}
      
      <div className="absolute bottom-8 left-1/2 z-20 flex -translate-x-1/2 gap-3">
        {slides.map((item, itemIndex) => <button key={item.headline} onClick={() => setIndex(itemIndex)} className="relative h-1 w-16 overflow-hidden rounded-full bg-black/25">{index === itemIndex && <motion.span layoutId="heroIndicator" className="absolute inset-0 bg-wood" />}</button>)}
      </div>
    </section>
  );
}
