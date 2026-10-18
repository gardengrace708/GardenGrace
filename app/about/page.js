import Image from 'next/image';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { getSiteContent } from '@/lib/siteContent';

const values = ['Craft with conscience', 'Modern Pakistani identity', 'Premium materials only', 'Designs made to be remembered'];

export const dynamic = 'force-dynamic';

export default async function AboutPage() {
  const content = await getSiteContent();

  return (
    <>
      <Navbar />
      <main className="bg-obsidian pt-32">
        <section className="luxury-container grid items-center gap-12 py-16 lg:grid-cols-2">
          <div><p className="text-sm font-bold uppercase tracking-[0.35em] text-wood">The House</p><h1 className="mt-4 font-display text-7xl leading-none">We make furniture for those who feel rare.</h1><p className="mt-8 leading-8 text-ivory/70">GardenGrace is a Pakistani furniture house rooted in craft, restraint, and presence. Our work begins with materials and ends with a feeling: comfort, style, and belonging.</p><p className="mt-5 leading-8 text-ivory/70">From Lahore workshops to homes across Pakistan, we design pieces that transform spaces and bring effortless grace to everyday life.</p></div>
          <div className="relative aspect-[4/5] overflow-hidden bg-surface"><Image src={content.aboutImage} alt="About GardenGrace" fill priority sizes="50vw" className="object-cover" /></div>
        </section>
        <section className="bg-surface py-20"><div className="luxury-container grid gap-6 md:grid-cols-4">{values.map((value) => <div key={value} className="border border-wood/20 p-8"><span className="text-wood">✦</span><h2 className="mt-5 font-display text-3xl">{value}</h2></div>)}</div></section>
        <section className="luxury-container py-20 text-center"><h2 className="font-display text-6xl">Designed in Pakistan. Desired Everywhere.</h2><p className="mx-auto mt-5 max-w-2xl leading-8 text-ivory/70">Our team brings together furniture designers, skilled craftsmen, material specialists, and visual storytellers to build a brand worthy of real customers and lasting memories.</p></section>
      </main>
      <Footer />
    </>
  );
}
