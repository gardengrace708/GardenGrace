import { NextResponse } from 'next/server';
import { createSession, hashPassword, sanitizeUser } from '@/lib/auth';
import { getDb } from '@/lib/mongodb';

export async function POST(request) {
  const body = await request.json();
  const name = String(body.name || '').trim();
  const email = String(body.email || '').trim().toLowerCase();
  const password = String(body.password || '');

  if (!name || !email || password.length < 6) {
    return NextResponse.json({ message: 'Name, valid email aur 6 character password required hai' }, { status: 400 });
  }

  const db = await getDb();
  const existing = await db.collection('users').findOne({ email });

  if (existing) {
    return NextResponse.json({ message: 'Ye email pehle se registered hai' }, { status: 409 });
  }

  const result = await db.collection('users').insertOne({ name, email, password: hashPassword(password), user: 0, createdAt: new Date() });
  const savedUser = await db.collection('users').findOne({ _id: result.insertedId });
  await createSession(result.insertedId);

  return NextResponse.json({ user: sanitizeUser(savedUser) }, { status: 201 });
}
