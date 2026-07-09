import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { buildLookbookPayload, ensureLookbookSeeded, getLookbookItems, getNextLookbookId } from '@/lib/lookbook';
import { getDb } from '@/lib/mongodb';

export async function GET() {
  const items = await getLookbookItems();
  return NextResponse.json({ items });
}

export async function POST(request) {
  const currentUser = await getCurrentUser();

  if (currentUser?.user !== 1) {
    return NextResponse.json({ message: 'Admin access required' }, { status: 403 });
  }

  const body = await request.json();
  const db = await getDb();
  await ensureLookbookSeeded();
  const id = await getNextLookbookId();
  const item = buildLookbookPayload({ ...body, id });

  await db.collection('lookbook').insertOne(item);
  return NextResponse.json({ item }, { status: 201 });
}
