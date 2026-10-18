import { notFound } from 'next/navigation';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import ProductDetail from '@/components/products/ProductDetail';
import { getProductById, getRelatedProducts } from '@/lib/products';

export const revalidate = 20;

export default async function ProductPage({ params }) {
  try {
    const product = await getProductById(params.id);
    if (!product) notFound();
    const related = await getRelatedProducts(product);

    return (
      <>
        <Navbar />
        <ProductDetail product={product} related={related} />
        <Footer />
      </>
    );
  } catch (error) {
    console.error('Product page error:', error);
    // Return error page with refresh
    return (
      <>
        <Navbar />
        <main className="min-h-screen bg-obsidian pt-28 text-ivory">
          <section className="luxury-container flex flex-col items-center justify-center py-16">
            <h1 className="font-display text-5xl mb-4">Error Loading Product</h1>
            <p className="text-xl text-ivory/70 mb-8">There was an error loading this product. Please refresh the page.</p>
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
