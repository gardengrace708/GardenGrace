import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { buildCollectionPayload, ensureCollectionsSeeded, getCollections, getNextCollectionId } from '@/lib/collections';
import { getDb } from '@/lib/mongodb';

export async function GET() {
  const collections = await getCollections();
  return NextResponse.json({ collections });
}

export async function POST(request) {
  const currentUser = await getCurrentUser();

  if (currentUser?.user !== 1) {
    return NextResponse.json({ message: 'Admin access required' }, { status: 403 });
  }

  const body = await request.json();
  const db = await getDb();
  await ensureCollectionsSeeded();
  const id = await getNextCollectionId();
  const collection = buildCollectionPayload({ ...body, id });

  await db.collection('collections').insertOne(collection);
  return NextResponse.json({ collection }, { status: 201 });
}
