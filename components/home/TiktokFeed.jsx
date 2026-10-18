'use client';

import { useEffect } from 'react';
import Button from '@/components/ui/Button';

export default function TikTokFeed() {
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://www.tiktok.com/embed.js';
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  return (
    <section className="bg-obsidian py-24">
      <div className="luxury-container text-center">
        <h2 className="font-display text-4xl md:text-6xl">Follow Our Story</h2>
        <p className="mt-2 text-wood">@GardenGrace_men</p>
        <div className="mt-12 flex justify-center">
          <blockquote className="tiktok-embed" cite="https://www.tiktok.com/@GardenGrace_men" data-unique-id="GardenGrace_men" data-embed-type="creator" style={{ maxWidth: '780px', minWidth: '288px' }}>
            <section>
              <a target="_blank" href="https://www.tiktok.com/@GardenGrace_men?refer=creator_embed">@GardenGrace_men</a>
            </section>
          </blockquote>
        </div>
        <Button className="mt-10" href="https://www.tiktok.com/@GardenGrace_men" variant="outline">Follow on TikTok</Button>
      </div>
    </section>
  );
}
