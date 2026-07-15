import Image from 'next/image';
import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import ProductCard from '@/components/ui/ProductCard';
import { getCollections } from '@/lib/collections';
import { getProducts } from '@/lib/products';

export const metadata = {
  title: 'Collections',
  description: 'Explore MAKHSOOS exclusive collections of premium men\'s Pakistani clothing. From traditional kurtas to modern shalwar kameez designs.',
  keywords: ['men\'s fashion collections', 'Pakistani clothing collections', 'kurta collection', 'traditional wear collection', 'luxury menswear'],
  openGraph: {
    title: 'Collections | MAKHSOOS',
    description: 'Explore MAKHSOOS exclusive collections of premium men\'s Pakistani clothing.',
    url: 'https://makhsoos.shop/collections',
  }
};

export const revalidate = 10;

export default async function CollectionsPage() {
  const [collections, products] = await Promise.all([getCollections(), getProducts()]);

  return (
    <>
      <Navbar />
      <main className="bg-obsidian pt-32">
        <section className="luxury-container py-16 text-center">
          <p className="text-sm font-bold uppercase tracking-[0.35em] text-gold">Shop the world of MAKHSOOS</p>
          <h1 className="mt-4 font-display text-7xl">Collections</h1>
        </section>
        <section className="luxury-container grid gap-6 pb-20 md:grid-cols-3">
          {collections.map((collection) => <Link href={`/collections/${collection.slug}`} key={collection.slug} className="group relative aspect-[4/5] overflow-hidden bg-surface"><Image src={collection.image} alt={collection.name} fill sizes="33vw" className="object-cover transition duration-700 group-hover:scale-105" /><div className="absolute inset-0 bg-black/45" /><div className="absolute inset-x-6 bottom-6"><p className="text-gold">{collection.tag}</p><h2 className="font-display text-4xl">{collection.name}</h2><p className="mt-2 text-sm text-ivory/70">{collection.description}</p></div></Link>)}
        </section>
        <section className="bg-ivory py-20 text-obsidian">
          <div className="luxury-container"><h2 className="mb-10 font-display text-6xl">All Products</h2><div className="grid grid-cols-2 gap-5 md:grid-cols-3 lg:grid-cols-4">{products.map((product) => <ProductCard key={product.id} product={product} />)}</div></div>
        </section>
      </main>
      <Footer />
    </>
  );
}
