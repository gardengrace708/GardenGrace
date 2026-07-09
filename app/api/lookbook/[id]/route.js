import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { buildLookbookPayload, ensureLookbookSeeded } from '@/lib/lookbook';
import { getDb } from '@/lib/mongodb';

export async function PUT(request, { params }) {
  const currentUser = await getCurrentUser();

  if (currentUser?.user !== 1) {
    return NextResponse.json({ message: 'Admin access required' }, { status: 403 });
  }

  const body = await request.json();
  const db = await getDb();
  await ensureLookbookSeeded();
  const item = buildLookbookPayload({ ...body, id: params.id });
  const result = await db.collection('lookbook').findOneAndUpdate({ id: Number(params.id) }, { $set: item }, { returnDocument: 'after' });

  if (!result) {
    return NextResponse.json({ message: 'Lookbook item not found' }, { status: 404 });
  }

  return NextResponse.json({ item });
}

export async function DELETE(_request, { params }) {
  const currentUser = await getCurrentUser();

  if (currentUser?.user !== 1) {
    return NextResponse.json({ message: 'Admin access required' }, { status: 403 });
  }

  const db = await getDb();
  await ensureLookbookSeeded();
  const result = await db.collection('lookbook').deleteOne({ id: Number(params.id) });

  if (!result.deletedCount) {
    return NextResponse.json({ message: 'Lookbook item not found' }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}
