import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { buildProductPayload, ensureProductsSeeded, getNextProductId, getProducts, searchProducts } from '@/lib/products';
import { getDb } from '@/lib/mongodb';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q');
  
  if (query) {
    const products = await searchProducts(query);
    return NextResponse.json({ products });
  }
  
  const products = await getProducts();
  return NextResponse.json({ products });
}

export async function POST(request) {
  const currentUser = await getCurrentUser();

  if (currentUser?.user !== 1) {
    return NextResponse.json({ message: 'Admin access required' }, { status: 403 });
  }

  const body = await request.json();
  const db = await getDb();
  await ensureProductsSeeded();
  const id = await getNextProductId();
  const product = buildProductPayload({ ...body, id });

  await db.collection('products').insertOne(product);
  return NextResponse.json({ product }, { status: 201 });
}
