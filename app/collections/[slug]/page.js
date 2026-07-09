import Image from 'next/image';
import { notFound } from 'next/navigation';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import ProductCard from '@/components/ui/ProductCard';
import { getCollectionBySlug } from '@/lib/collections';
import { getProducts } from '@/lib/products';

export default async function CollectionDetailPage({ params }) {
  const [collection, products] = await Promise.all([getCollectionBySlug(params.slug), getProducts()]);
  if (!collection) notFound();
  const items = products.filter((product) => product.category.toLowerCase().replaceAll(' ', '-') === collection.slug || (collection.slug === 'formal' && product.category === 'Formal Wear'));

  return (
    <>
      <Navbar />
      <main className="bg-obsidian pt-20">
        <section className="relative flex min-h-[70vh] items-end overflow-hidden">
          <Image src={collection.image} alt={collection.name} fill priority sizes="100vw" className="object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-obsidian via-black/55 to-black/20" />
          <div className="luxury-container relative z-10 pb-16"><p className="text-sm font-bold uppercase tracking-[0.35em] text-gold">{collection.tag}</p><h1 className="mt-4 font-display text-7xl">{collection.name}</h1><p className="mt-4 max-w-xl text-ivory/75">{collection.description}</p></div>
        </section>
        <section className="bg-ivory py-20 text-obsidian"><div className="luxury-container grid grid-cols-2 gap-5 md:grid-cols-3 lg:grid-cols-4">{items.map((product) => <ProductCard key={product.id} product={product} />)}</div></section>
      </main>
      <Footer />
    </>
  );
}
