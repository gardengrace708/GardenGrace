import NavLink from '@/components/ui/NavLink';
import ProductCard from '@/components/ui/ProductCard';
import { getProducts } from '@/lib/products';
import { getNewArrivalsProductIds } from '@/lib/siteContent';

export default async function NewArrivals() {
  const [allProducts, newArrivalsIds] = await Promise.all([getProducts(), getNewArrivalsProductIds()]);
  
  // Filter products based on selected IDs, or show first 8 if none selected
  const newArrivalsProducts = newArrivalsIds.length > 0 
    ? allProducts.filter((product) => newArrivalsIds.includes(product.id))
    : allProducts.slice(0, 8);

  return (
    <section className="bg-ivory py-24 text-obsidian">
      <div className="luxury-container">
        <div className="mb-12 flex items-end justify-between gap-6">
          <div><p className="text-sm font-bold uppercase tracking-[0.3em] text-gold">Freshly Arrived</p><h2 className="mt-2 font-display text-3xl md:text-6xl">New Arrivals</h2></div>
          <NavLink href="/shop" className="text-sm font-bold uppercase tracking-[0.25em] text-obsidian underline decoration-gold underline-offset-8">View All</NavLink>
        </div>
        <div className="grid grid-cols-2 gap-5 md:grid-cols-3 lg:grid-cols-4">{newArrivalsProducts.map((product) => <ProductCard key={product.id} product={product} />)}</div>
      </div>
    </section>
  );
}
