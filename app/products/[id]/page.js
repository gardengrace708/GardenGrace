import { notFound } from 'next/navigation';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import ProductDetail from '@/components/products/ProductDetail';
import { getProductById, getRelatedProducts } from '@/lib/products';

export const revalidate = 20;

export default async function ProductPage({ params }) {
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
}
