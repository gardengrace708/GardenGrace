import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import MarqueeTicker from '@/components/layout/MarqueeTicker';
import HeroBanner from '@/components/home/HeroBanner';
import FeaturedCollections from '@/components/home/FeaturedCollections';
import NewArrivals from '@/components/home/NewArrivals';
import BrandStory from '@/components/home/BrandStory';
import LookbookStrip from '@/components/home/LookbookStrip';
import Testimonials from '@/components/home/Testimonials';
import TikTokFeed from '@/components/home/TiktokFeed';
import Newsletter from '@/components/home/Newsletter';
import { getCollections } from '@/lib/collections';
import { getLookbookItems } from '@/lib/lookbook';

export const revalidate = 20;

export default async function Home() {
  const [collections, lookbookItems] = await Promise.all([getCollections(), getLookbookItems()]);

  return (
    <>
      <Navbar />
       <div className="bg-obsidian text-ivory py-3 text-center">
        <p className="text-sm font-semibold tracking-wider uppercase">
          From this shop you will get classic and premium outfits at affordable prices
        </p>
      </div>

      <HeroBanner />
      <MarqueeTicker />
      <NewArrivals />
      <FeaturedCollections collections={collections} />
      <BrandStory />
      <LookbookStrip items={lookbookItems} />
      <Testimonials />
      <TikTokFeed />
      <Newsletter />
      <Footer />
    </>
  );
}
