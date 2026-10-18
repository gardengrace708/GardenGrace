import Image from 'next/image';
import { notFound } from 'next/navigation';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import ProductCard from '@/components/ui/ProductCard';
import { getCollectionBySlug } from '@/lib/collections';
import { getProducts } from '@/lib/products';

export const revalidate = 20;

export default async function CollectionDetailPage({ params }) {
  try {
    const [collection, products] = await Promise.all([getCollectionBySlug(params.slug), getProducts()]);
    if (!collection) notFound();
    const items = products.filter((product) => product.category.toLowerCase().replaceAll(' ', '-') === collection.slug || (collection.slug === 'living-room' && product.category === 'Living Room') || (collection.slug === 'bedroom' && product.category === 'Bedroom') || (collection.slug === 'office' && product.category === 'Office'));

    return (
      <>
        <Navbar />
        <main className="bg-obsidian pt-20">
          <section className="relative flex min-h-[70vh] items-end overflow-hidden">
            <Image src={collection.image} alt={collection.name} fill priority sizes="100vw" className="object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-obsidian via-black/55 to-black/20" />
            <div className="luxury-container relative z-10 pb-16"><p className="text-sm font-bold uppercase tracking-[0.35em] text-wood">{collection.tag}</p><h1 className="mt-4 font-display text-7xl">{collection.name}</h1><p className="mt-4 max-w-xl text-ivory/75">{collection.description}</p></div>
          </section>
          <section className="bg-ivory py-20 text-obsidian"><div className="luxury-container grid grid-cols-2 gap-5 md:grid-cols-3 lg:grid-cols-4">{items.map((product) => <ProductCard key={product.id} product={product} />)}</div></section>
        </main>
        <Footer />
      </>
    );
  } catch (error) {
    console.error('Collection page error:', error);
    // Return error page with refresh
    return (
      <>
        <Navbar />
        <main className="min-h-screen bg-obsidian pt-28 text-ivory">
          <section className="luxury-container flex flex-col items-center justify-center py-16">
            <h1 className="font-display text-5xl mb-4">Error Loading Collection</h1>
            <p className="text-xl text-ivory/70 mb-8">There was an error loading this collection. Please refresh the page.</p>
            <button
              onClick={() => window.location.reload(true)}
              className="rounded-full bg-wood px-8 py-4 text-sm font-bold uppercase tracking-[0.25em] text-obsidian transition hover:bg-ivory"
            >
              Refresh Page
            </button>
          </section>
        </main>
        <Footer />
      </>
    );
  }
}
