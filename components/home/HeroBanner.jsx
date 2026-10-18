'use client';

import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import Button from '@/components/ui/Button';

const slides = [
  { headline: 'Luxury Redefined', sub: 'Experience the art of fine furniture', cta: 'Shop Collection' },
  { headline: 'Timeless Elegance', sub: 'Crafted for those who appreciate excellence', cta: 'Discover More' },
  { headline: 'Exquisite Design', sub: 'Where luxury meets comfort', cta: 'Explore Now' }
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
    }, 6000);
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
    <section 
      onMouseEnter={() => { paused.current = true; }} 
      onMouseLeave={() => { paused.current = false; }} 
      className="relative h-screen overflow-hidden bg-[#2C1810]"
    >
      {/* Background Media */}
      {heroType === 'video' && heroVideo && (
        <div className="absolute inset-0 z-0">
          <video
            src={heroVideo}
            autoPlay
            loop
            muted
            playsInline
            className="h-full w-full object-cover opacity-70"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#2C1810]/80 via-[#3D2817]/60 to-[#2C1810]/90" />
        </div>
      )}
      {heroType === 'image' && heroImage && (
        <div className="absolute inset-0 z-0">
          <Image
            src={heroImage}
            alt="Hero"
            fill
            className="object-cover opacity-70"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#2C1810]/80 via-[#3D2817]/60 to-[#2C1810]/90" />
        </div>
      )}
      
      {/* Default wood gradient if no media */}
      {!heroVideo && !heroImage && (
        <div className="absolute inset-0 z-0 bg-gradient-to-br from-[#2C1810] via-[#3D2817] to-[#1A0F0A]" />
      )}

      {/* Centered Content */}
      <div className="relative z-10 flex h-full items-center justify-center px-4">
        <AnimatePresence mode="wait">
          <motion.div 
            key={slide.headline} 
            initial="hidden" 
            animate="visible" 
            exit="hidden" 
            variants={{ 
              visible: { transition: { staggerChildren: 0.15 } } 
            }} 
            className="text-center max-w-4xl"
          >
            <motion.p 
              variants={{ 
                hidden: { opacity: 0, y: 30 }, 
                visible: { opacity: 1, y: 0, transition: { duration: 0.6 } } 
              }} 
              className="mb-4 text-sm font-bold uppercase tracking-[0.4em] text-[#D4A574]"
            >
              Garden Grace
            </motion.p>
            
            <motion.h1 
              variants={{ 
                hidden: { opacity: 0, y: 40, scale: 0.95 }, 
                visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.7, ease: "easeOut" } } 
              }} 
              className="mb-6 font-sans text-5xl font-bold text-[#F5E6D3] md:text-7xl lg:text-8xl tracking-tight"
            >
              {slide.headline}
            </motion.h1>
            
            <motion.p 
              variants={{ 
                hidden: { opacity: 0, y: 30 }, 
                visible: { opacity: 1, y: 0, transition: { duration: 0.6 } } 
              }} 
              className="mb-10 text-lg md:text-xl text-[#E8D5C4] font-light tracking-wide"
            >
              {slide.sub}
            </motion.p>
            
            <motion.div 
              variants={{ 
                hidden: { opacity: 0, y: 30 }, 
                visible: { opacity: 1, y: 0, transition: { duration: 0.6 } } 
              }} 
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <Button 
                href="/collections" 
                className="bg-[#D4A574] hover:bg-[#C49464] text-[#1A0F0A] font-bold px-8 py-4 text-lg border-2 border-[#D4A574]"
              >
                {slide.cta}
              </Button>
              <Button 
                href="/lookbook" 
                variant="outline"
                className="border-2 border-[#F5E6D3] text-[#F5E6D3] hover:bg-[#F5E6D3] hover:text-[#1A0F0A] font-bold px-8 py-4 text-lg"
              >
                View Lookbook
              </Button>
            </motion.div>
          </motion.div>
        </AnimatePresence>
      </div>
      
      {/* Slide Indicators */}
      <div className="absolute bottom-10 left-1/2 z-20 flex -translate-x-1/2 gap-3">
        {slides.map((item, itemIndex) => (
          <button 
            key={item.headline} 
            onClick={() => setIndex(itemIndex)} 
            className={`h-1 w-12 rounded-full transition-all duration-300 ${
              index === itemIndex ? 'bg-[#D4A574] w-16' : 'bg-[#F5E6D3]/30 hover:bg-[#F5E6D3]/50'
            }`}
          />
        ))}
      </div>

      {/* Arrow Navigation */}
      <button
        onClick={() => setIndex((current) => (current - 1 + slides.length) % slides.length)}
        className="hidden md:block absolute left-4 top-1/2 z-20 -translate-y-1/2 p-3 text-[#F5E6D3]/50 hover:text-[#D4A574] transition-colors"
      >
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>
      <button
        onClick={() => setIndex((current) => (current + 1) % slides.length)}
        className="hidden md:block absolute right-4 top-1/2 z-20 -translate-y-1/2 p-3 text-[#F5E6D3]/50 hover:text-[#D4A574] transition-colors"
      >
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </section>
  );
}
