import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import ProductCard from '@/components/ui/ProductCard';
import { getProducts } from '@/lib/products';
import { Metadata } from 'next';

export const metadata = {
  title: 'Shop All Products',
  description: 'Browse our complete collection of premium furniture. Find sofas, beds, dining tables, and home decor at GardenGrace.',
  keywords: ['furniture shop', 'buy sofa online', 'bedroom furniture', 'dining table', 'home furniture store'],
  openGraph: {
    title: 'Shop All Products | GardenGrace',
    description: 'Browse our complete collection of premium furniture. Find sofas, beds, dining tables, and home decor.',
    url: 'https://GardenGrace.pk/shop',
  }
};

export const revalidate = 10;

export default async function CollectionsPage() {
  const [ products] = await Promise.all([ getProducts()]);

  return (
    <>
      <Navbar />
        <section className="bg-ivory pt-32 py-20 text-obsidian">
          <div className="luxury-container"><h2 className="mb-10 font-display text-6xl">All Products</h2><div className="grid grid-cols-2 gap-5 md:grid-cols-3 lg:grid-cols-4">{products.map((product) => <ProductCard key={product.id} product={product} />)}</div></div>
        </section>
      <Footer />
    </>
  );
}
