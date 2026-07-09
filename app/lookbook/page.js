import Image from 'next/image';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { getLookbookItems } from '@/lib/lookbook';

export default async function LookbookPage() {
  const items = await getLookbookItems();

  return (
    <>
      <Navbar />
      <main className="bg-obsidian pt-32">
        <section className="luxury-container py-16 text-center"><p className="text-sm font-bold uppercase tracking-[0.35em] text-gold">Editorial Styling</p><h1 className="mt-4 font-display text-7xl">Lookbook</h1></section>
        <section className="luxury-container columns-1 gap-6 pb-24 sm:columns-2 lg:columns-3">
          {items.map((item, index) => <div key={item.id} className="mb-6 break-inside-avoid overflow-hidden bg-surface"><div className={`relative ${index % 3 === 0 ? 'aspect-[3/4]' : 'aspect-[4/5]'}`}><Image src={item.image} alt={item.title} fill sizes="33vw" className="object-cover" /></div><div className="p-6"><h2 className="font-display text-3xl">{item.title}</h2><p className="mt-1 text-gold">{item.subtitle}</p></div></div>)}
        </section>
      </main>
      <Footer />
    </>
  );
}
