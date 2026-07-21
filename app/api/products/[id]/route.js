import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { buildProductPayload, ensureProductsSeeded } from '@/lib/products';
import { getDb } from '@/lib/mongodb';
import { revalidatePath } from 'next/cache';

export async function PUT(request, { params }) {
  const currentUser = await getCurrentUser();

  if (currentUser?.user !== 1) {
    return NextResponse.json({ message: 'Admin access required' }, { status: 403 });
  }

  const body = await request.json();
  const db = await getDb();
  await ensureProductsSeeded();
  const product = buildProductPayload({ ...body, id: params.id });
  const result = await db.collection('products').findOneAndUpdate({ id: Number(params.id) }, { $set: product }, { returnDocument: 'after' });

  if (!result) {
    return NextResponse.json({ message: 'Product not found' }, { status: 404 });
  }

  // Revalidate product-related pages
  revalidatePath('/shop');
  revalidatePath('/products/[id]');
  revalidatePath('/collections');

  return NextResponse.json({ product });
}

export async function DELETE(_request, { params }) {
  const currentUser = await getCurrentUser();

  if (currentUser?.user !== 1) {
    return NextResponse.json({ message: 'Admin access required' }, { status: 403 });
  }

  const db = await getDb();
  await ensureProductsSeeded();
  const result = await db.collection('products').deleteOne({ id: Number(params.id) });

  if (!result.deletedCount) {
    return NextResponse.json({ message: 'Product not found' }, { status: 404 });
  }

  // Revalidate product-related pages
  revalidatePath('/shop');
  revalidatePath('/products/[id]');
  revalidatePath('/collections');

  return NextResponse.json({ ok: true });
}
