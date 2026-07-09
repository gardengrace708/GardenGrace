import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { buildCollectionPayload, ensureCollectionsSeeded } from '@/lib/collections';
import { getDb } from '@/lib/mongodb';

export async function PUT(request, { params }) {
  const currentUser = await getCurrentUser();

  if (currentUser?.user !== 1) {
    return NextResponse.json({ message: 'Admin access required' }, { status: 403 });
  }

  const body = await request.json();
  const db = await getDb();
  await ensureCollectionsSeeded();
  const collection = buildCollectionPayload({ ...body, id: params.id });
  const result = await db.collection('collections').findOneAndUpdate({ id: Number(params.id) }, { $set: collection }, { returnDocument: 'after' });

  if (!result) {
    return NextResponse.json({ message: 'Collection not found' }, { status: 404 });
  }

  return NextResponse.json({ collection });
}

export async function DELETE(_request, { params }) {
  const currentUser = await getCurrentUser();

  if (currentUser?.user !== 1) {
    return NextResponse.json({ message: 'Admin access required' }, { status: 403 });
  }

  const db = await getDb();
  await ensureCollectionsSeeded();
  const result = await db.collection('collections').deleteOne({ id: Number(params.id) });

  if (!result.deletedCount) {
    return NextResponse.json({ message: 'Collection not found' }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}
