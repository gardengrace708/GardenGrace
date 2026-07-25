import NavLink from '@/components/ui/NavLink';
import ProductCard from '@/components/ui/ProductCard';
import { getProducts } from '@/lib/products';

export default async function NewArrivals() {
  const products = await getProducts();

  return (
    <section className="bg-ivory py-24 text-obsidian">
      <div className="luxury-container">
        <div className="mb-12 flex items-end justify-between gap-6">
          <div><p className="text-sm font-bold uppercase tracking-[0.3em] text-gold">Freshly Arrived</p><h2 className="mt-2 font-display text-3xl md:text-6xl">New Arrivals</h2></div>
          <NavLink href="/collections" className="text-sm font-bold uppercase tracking-[0.25em] text-obsidian underline decoration-gold underline-offset-8">View All</NavLink>
        </div>
        <div className="grid grid-cols-2 gap-5 md:grid-cols-3 lg:grid-cols-4">{products.slice(0, 8).map((product) => <ProductCard key={product.id} product={product} />)}</div>
      </div>
    </section>
  );
}
