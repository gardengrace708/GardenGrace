import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import ProductCard from '@/components/ui/ProductCard';
import { getProducts } from '@/lib/products';
import { Metadata } from 'next';

export const metadata = {
  title: 'Shop All Products',
  description: 'Browse our complete collection of premium men\'s clothing. Find kurtas, shalwar kameez, waistcoats, and traditional Pakistani wear at MAKHSOOS.',
  keywords: ['men\'s clothing shop', 'buy kurta online', 'shalwar kameez for men', 'waistcoat online shopping', 'Pakistani menswear store'],
  openGraph: {
    title: 'Shop All Products | MAKHSOOS',
    description: 'Browse our complete collection of premium men\'s clothing. Find kurtas, shalwar kameez, waistcoats, and traditional Pakistani wear.',
    url: 'https://makhsoos.online/shop',
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
