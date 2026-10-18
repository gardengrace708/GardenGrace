import { cookies } from 'next/headers';
import { createHash, randomBytes } from 'crypto';
import { getDb } from '@/lib/mongodb';

const sessionCookie = 'GardenGrace_session';

export function hashPassword(password) {
  return createHash('sha256').update(password).digest('hex');
}

export function sanitizeUser(user) {
  if (!user) return null;

  return {
    id: user._id.toString(),
    name: user.name || '',
    email: user.email || '',
    user: Number(user.user || 0),
    createdAt: user.createdAt ? new Date(user.createdAt).toISOString() : null
  };
}

export async function createSession(userId) {
  const db = await getDb();
  const token = randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 7);

  await db.collection('sessions').insertOne({ token, userId, expiresAt });
  cookies().set(sessionCookie, token, { httpOnly: true, sameSite: 'lax', path: '/', expires: expiresAt });
}

export async function getCurrentUser() {
  const token = cookies().get(sessionCookie)?.value;
  if (!token) return null;

  const db = await getDb();
  const session = await db.collection('sessions').findOne({ token, expiresAt: { $gt: new Date() } });
  if (!session) return null;

  const user = await db.collection('users').findOne({ _id: session.userId });
  return sanitizeUser(user);
}

export async function getUsers() {
  const db = await getDb();
  const users = await db.collection('users').find({}).sort({ createdAt: -1 }).toArray();
  return users.map(sanitizeUser);
}

export async function clearSession() {
  const token = cookies().get(sessionCookie)?.value;
  const db = await getDb();

  if (token) {
    await db.collection('sessions').deleteOne({ token });
  }

  cookies().delete(sessionCookie);
}
