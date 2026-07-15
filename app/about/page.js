import Image from 'next/image';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { getSiteContent } from '@/lib/siteContent';

const values = ['Craft with conscience', 'Modern Pakistani identity', 'Premium fabrics only', 'Designs made to be remembered'];

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'About Us',
  description: 'Discover MAKHSOOS - A Pakistani fashion house crafting premium men\'s clothing with conscience. Rooted in craft, restraint, and presence since our founding.',
  keywords: ['about MAKHSOOS', 'Pakistani fashion brand', 'men\'s clothing brand Pakistan', 'luxury menswear Pakistan', 'traditional Pakistani clothing'],
  openGraph: {
    title: 'About Us | MAKHSOOS',
    description: 'Discover MAKHSOOS - A Pakistani fashion house crafting premium men\'s clothing with conscience.',
    url: 'https://makhsoos.shop/about',
  }
};

export default async function AboutPage() {
  const content = await getSiteContent();

  return (
    <>
      <Navbar />
      <main className="bg-obsidian pt-32">
        <section className="luxury-container grid items-center gap-12 py-16 lg:grid-cols-2">
          <div><p className="text-sm font-bold uppercase tracking-[0.35em] text-gold">The House</p><h1 className="mt-4 font-display text-7xl leading-none">We make clothing for men who feel rare.</h1><p className="mt-8 leading-8 text-ivory/70">MAKHSOOS is a Pakistani fashion house rooted in craft, restraint, and presence. Our work begins with fabric and ends with a feeling: confidence, polish, and belonging.</p><p className="mt-5 leading-8 text-ivory/70">From Lahore ateliers to wardrobes across Pakistan, we design pieces that move between celebration and everyday life with effortless grace.</p></div>
          <div className="relative aspect-[4/5] overflow-hidden bg-surface"><Image src={content.aboutImage} alt="About MAKHSOOS" fill priority sizes="50vw" className="object-cover" /></div>
        </section>
        <section className="bg-surface py-20"><div className="luxury-container grid gap-6 md:grid-cols-4">{values.map((value) => <div key={value} className="border border-gold/20 p-8"><span className="text-gold">✦</span><h2 className="mt-5 font-display text-3xl">{value}</h2></div>)}</div></section>
        <section className="luxury-container py-20 text-center"><h2 className="font-display text-6xl">Designed in Pakistan. Desired Everywhere.</h2><p className="mx-auto mt-5 max-w-2xl leading-8 text-ivory/70">Our team brings together textile lovers, pattern masters, embroidery specialists, and visual storytellers to build a brand worthy of real customers and lasting memories.</p></section>
      </main>
      <Footer />
    </>
  );
}
