import { notFound } from 'next/navigation';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import ProductDetail from '@/components/products/ProductDetail';
import { getProductById, getRelatedProducts } from '@/lib/products';
import { ProductSchema } from '@/components/seo/StructuredData';

export async function generateMetadata({ params }) {
  const product = await getProductById(params.id);
  if (!product) return {};

  return {
    title: product.name,
    description: product.description || `Shop ${product.name} at MAKHSOOS. Premium Pakistani men's clothing with COD available across Pakistan.`,
    keywords: [product.name, product.category, 'men\'s clothing', 'Pakistani menswear', 'kurta', 'shalwar kameez', 'MAKHSOOS'],
    openGraph: {
      title: product.name,
      description: product.description || `Shop ${product.name} at MAKHSOOS.`,
      url: `https://makhsoos.shop/products/${params.id}`,
      images: product.images || [product.image],
    }
  };
}

export const revalidate = 10;

export default async function ProductPage({ params }) {
  const product = await getProductById(params.id);
  if (!product) notFound();
  const related = await getRelatedProducts(product);

  return (
    <>
      <ProductSchema product={product} />
      <Navbar />
      <ProductDetail product={product} related={related} />
      <Footer />
    </>
  );
}
