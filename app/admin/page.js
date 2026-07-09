import { redirect } from 'next/navigation';
import Navbar from '@/components/layout/Navbar';
import AdminProducts from '@/components/admin/AdminProducts';
import { getCurrentUser, getUsers } from '@/lib/auth';
import { getOrders } from '@/lib/orders';
import { getProducts } from '@/lib/products';
import { getCollections } from '@/lib/collections';
import { getSiteContent } from '@/lib/siteContent';
import { getLookbookItems } from '@/lib/lookbook';
import { getCoupons } from '@/lib/coupons';
import { getGlobalDiscount } from '@/lib/globalDiscount';

export default async function AdminPage() {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    redirect('/login');
  }

  if (currentUser.user !== 1) {
    redirect('/');
  }

  const [products, orders, users, collections, siteContent, lookbookItems, coupons, globalDiscount] = await Promise.all([getProducts(), getOrders(), getUsers(), getCollections(), getSiteContent(), getLookbookItems(), getCoupons(), getGlobalDiscount()]);

  return (
    <>
      <Navbar />
      <AdminProducts initialProducts={products} initialOrders={orders} initialUsers={users} initialCollections={collections} initialSiteContent={siteContent} initialLookbookItems={lookbookItems} initialCoupons={coupons} initialGlobalDiscount={globalDiscount} />
    </>
  );
}
