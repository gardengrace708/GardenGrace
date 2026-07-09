import { NextResponse } from 'next/server';
import { createSession, hashPassword, sanitizeUser } from '@/lib/auth';
import { getDb } from '@/lib/mongodb';

export async function POST(request) {
  const body = await request.json();
  const email = String(body.email || '').trim().toLowerCase();
  const password = String(body.password || '');

  if (!email || !password) {
    return NextResponse.json({ message: 'Email aur password required hai' }, { status: 400 });
  }

  const db = await getDb();
  const user = await db.collection('users').findOne({ email });

  if (!user || user.password !== hashPassword(password)) {
    return NextResponse.json({ message: 'Email ya password ghalat hai' }, { status: 401 });
  }

  await createSession(user._id);

  return NextResponse.json({ user: sanitizeUser(user) });
}
