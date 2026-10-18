import { redirect } from 'next/navigation';
import { CalendarDays, Mail, Package, ShieldCheck, User, Star } from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { getCurrentUser } from '@/lib/auth';
import { getOrdersForUser } from '@/lib/orders';
import { getProducts } from '@/lib/products';
import { formatPrice } from '@/lib/utils';

function formatDate(date) {
  return new Date(date).toLocaleDateString('en-PK', { year: 'numeric', month: 'long', day: 'numeric' });
}

export default async function ProfilePage() {
  const currentUser = await getCurrentUser();
  // throw new Error("Testing custom error page!");

  if (!currentUser) {
    redirect('/login');
  }

  const [orders, products] = await Promise.all([
    getOrdersForUser(currentUser),
    getProducts()
  ]);

  const productsByName = new Map(
    products.map((product) => [product.name, product.id])
  );

  const ordersWithProductIds = orders.map((order) => ({
    ...order,
    items: order.items.map((item) => ({
      ...item,
      productId: item.productId || productsByName.get(item.name) || null
    }))
  }));

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-ivory pt-28 text-obsidian">
        <section className="luxury-container py-16">
          <div className="mb-10">
            <p className="text-sm font-bold uppercase tracking-[0.35em] text-wood">My Account</p>
            <h1 className="mt-3 font-display text-7xl">Profile</h1>
          </div>
          <div className="grid gap-8 lg:grid-cols-[380px_1fr]">
            <aside className="space-y-6">
              <div className="rounded-[2rem] bg-white p-7 shadow-lg border border-wood/20">
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-wood to-amber-600 text-3xl font-bold text-white shadow-xl">{currentUser.name.charAt(0).toUpperCase() || 'U'}</div>
                <h2 className="mt-6 font-display text-4xl">{currentUser.name}</h2>
                <p className="mt-1 text-obsidian/60">{currentUser.user === 1 ? 'Admin Account' : 'Customer Account'}</p>
              </div>
              <div className="rounded-[2rem] bg-white p-7 shadow-lg border border-wood/20">
                <h3 className="font-display text-3xl">Account Information</h3>
                <div className="mt-6 space-y-5">
                  <div className="flex gap-4"><User className="text-wood" size={22} /><div><p className="text-xs font-bold uppercase tracking-[0.22em] text-obsidian/50">Name</p><p className="font-semibold">{currentUser.name}</p></div></div>
                  <div className="flex gap-4"><Mail className="text-wood" size={22} /><div><p className="text-xs font-bold uppercase tracking-[0.22em] text-obsidian/50">Email</p><p className="font-semibold">{currentUser.email}</p></div></div>
                  <div className="flex gap-4"><ShieldCheck className="text-wood" size={22} /><div><p className="text-xs font-bold uppercase tracking-[0.22em] text-obsidian/50">Role</p><p className="font-semibold">{currentUser.user === 1 ? 'Admin' : 'Customer'}</p></div></div>
                  <div className="flex gap-4"><CalendarDays className="text-wood" size={22} /><div><p className="text-xs font-bold uppercase tracking-[0.22em] text-obsidian/50">Member Since</p><p className="font-semibold">{currentUser.createdAt ? formatDate(currentUser.createdAt) : 'Recently joined'}</p></div></div>
                </div>
              </div>
            </aside>
            <section className="rounded-[2rem] bg-white p-7 shadow-lg border border-wood/20">
              <div className="flex items-center justify-between gap-4 border-b border-obsidian/10 pb-6">
                <div>
                  <p className="text-sm font-bold uppercase tracking-[0.3em] text-wood">Purchases</p>
                  <h2 className="mt-2 font-display text-5xl">Order History</h2>
                </div>
                <div className="rounded-full bg-wood/10 px-5 py-3 text-sm font-bold text-wood border border-wood/30">{ordersWithProductIds.length} Orders</div>
              </div>
              <div className="mt-8 space-y-5">
                {ordersWithProductIds.map((order) => (
                  <article key={order.id} className="rounded-[1.5rem] border border-obsidian/10 bg-ivory/50 p-6">
                    <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
                      <div className="flex items-center gap-4"><div className="rounded-full bg-gradient-to-br from-wood to-amber-600 p-3 text-white shadow-lg"><Package size={22} /></div><div><h3 className="font-display text-3xl">Order {order.id}</h3><p className="text-sm text-obsidian/60">{formatDate(order.createdAt)}</p></div></div>
                      <div className="text-left md:text-right"><p className="text-sm font-bold uppercase tracking-[0.2em] text-wood">{order.status}</p><p className="mt-1 text-xl font-bold">{formatPrice(order.total)}</p></div>
                    </div>
                    <div className="mt-6 divide-y divide-obsidian/10">
                      {order.items.map((item) => (
                        <div key={`${order.id}-${item.name}-${item.size}`} className="flex items-center justify-between gap-4 py-3 text-sm">
                          <div><p className="font-semibold">{item.name}</p><p className="text-obsidian/50">Size {item.size} · Qty {item.quantity}</p></div>
                          <div className="flex items-center gap-4">
                            {order.status?.toLowerCase() === 'delivered' && (
                              <a href={item.productId ? `/products/${item.productId}` : '#'} className="flex items-center gap-2 rounded-full bg-wood px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] text-white transition hover:bg-obsidian hover:text-white">
                                <Star size={14} fill="currentColor" />
                                Review
                              </a>
                            )}
                            <p className="font-bold text-wood">{formatPrice(item.price * item.quantity)}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </article>
                ))}
              </div>
            </section>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
