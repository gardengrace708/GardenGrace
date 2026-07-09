import { getDb } from '@/lib/mongodb';
import { products as seedProducts } from '@/lib/data/products';

function normalizeLookbookItem(item) {
  if (!item) return null;

  return {
    id: Number(item.id || 0),
    title: item.title || '',
    subtitle: item.subtitle || '',
    image: item.image || '',
    sortOrder: Number(item.sortOrder || item.id || 0)
  };
}

function seedLookbookItems() {
  return seedProducts.slice(0, 6).map((product, index) => normalizeLookbookItem({
    id: index + 1,
    title: product.name,
    subtitle: product.category,
    image: product.images[0],
    sortOrder: index + 1
  }));
}

export async function ensureLookbookSeeded() {
  const db = await getDb();
  const collection = db.collection('lookbook');
  const count = await collection.countDocuments();

  if (count === 0) {
    await collection.insertMany(seedLookbookItems());
  }
}

export async function getLookbookItems() {
  await ensureLookbookSeeded();
  const db = await getDb();
  const items = await db.collection('lookbook').find({}).sort({ sortOrder: 1, id: 1 }).toArray();
  return items.map(normalizeLookbookItem);
}

export async function getNextLookbookId() {
  const db = await getDb();
  const latest = await db.collection('lookbook').find({}).sort({ id: -1 }).limit(1).next();
  return Number(latest?.id || 0) + 1;
}

export function buildLookbookPayload(input) {
  return normalizeLookbookItem({
    id: input.id,
    title: input.title,
    subtitle: input.subtitle,
    image: input.image,
    sortOrder: input.sortOrder
  });
}
