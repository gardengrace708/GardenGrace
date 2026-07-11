
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import ProductCard from '@/components/ui/ProductCard';
import { getProducts } from '@/lib/products';

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
