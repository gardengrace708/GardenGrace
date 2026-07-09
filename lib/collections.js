import { getDb } from '@/lib/mongodb';
import { collections as seedCollections } from '@/lib/data/collections';

function normalizeCollection(collection) {
  if (!collection) return null;

  return {
    id: Number(collection.id || 0),
    name: collection.name || '',
    slug: collection.slug || '',
    tag: collection.tag || '',
    image: collection.image || '',
    description: collection.description || ''
  };
}

export async function ensureCollectionsSeeded() {
  const db = await getDb();
  const collection = db.collection('collections');
  const count = await collection.countDocuments();

  if (count === 0) {
    await collection.insertMany(seedCollections.map((item, index) => normalizeCollection({ ...item, id: index + 1 })));
  }
}

export async function getCollections() {
  await ensureCollectionsSeeded();
  const db = await getDb();
  const collections = await db.collection('collections').find({}).sort({ id: 1 }).toArray();
  return collections.map(normalizeCollection);
}

export async function getCollectionBySlug(slug) {
  await ensureCollectionsSeeded();
  const db = await getDb();
  const collection = await db.collection('collections').findOne({ slug });
  return normalizeCollection(collection);
}

export async function getNextCollectionId() {
  const db = await getDb();
  const latest = await db.collection('collections').find({}).sort({ id: -1 }).limit(1).next();
  return Number(latest?.id || 0) + 1;
}

export function buildCollectionPayload(input) {
  const slug = input.slug || String(input.name || '').toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

  return normalizeCollection({
    id: input.id,
    name: input.name,
    slug,
    tag: input.tag,
    image: input.image,
    description: input.description
  });
}
