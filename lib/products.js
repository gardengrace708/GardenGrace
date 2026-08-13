import { getDb } from '@/lib/mongodb';
import { products as seedProducts } from '@/lib/data/products';

const temporaryImagesById = new Map(seedProducts.map((product) => [Number(product.id), product.images]));

function normalizeProduct(product) {
  if (!product) return null;
  const images = Array.isArray(product.images) ? product.images : [];
  const temporaryImages = temporaryImagesById.get(Number(product.id));
  const quantity = Number(product.quantity || 0);

  // Calculate stock status based on quantity
  let stockStatus = 'sold_out';
  if (quantity > 10) {
    stockStatus = 'available';
  } else if (quantity > 0) {
    stockStatus = 'limited';
  }

  return {
    id: Number(product.id),
    name: product.name || '',
    category: product.category || '',
    price: Number(product.price || 0),
    badge: product.badge || '',
    images: images.some((image) => image.startsWith('/images/')) && temporaryImages ? temporaryImages : images,
    video: product.video || '',
    slug: product.slug || '',
    quantity,
    stockStatus,
    inStock: quantity > 0,
    description: product.description || '',
    characteristics: Array.isArray(product.characteristics) ? product.characteristics : [],
    colors: Array.isArray(product.colors) ? product.colors : [],
    availableSizes: Array.isArray(product.availableSizes) ? product.availableSizes : []
  };
}

export async function ensureProductsSeeded() {
  const db = await getDb();
  const collection = db.collection('products');
  const count = await collection.countDocuments();

  if (count === 0) {
    await collection.insertMany(seedProducts.map(normalizeProduct));
  }
}

export async function getProducts() {
  await ensureProductsSeeded();
  const db = await getDb();
  const products = await db.collection('products').find({}).sort({ id: 1 }).toArray();
  return products.map(normalizeProduct);
}

export async function getProductById(id) {
  await ensureProductsSeeded();
  const db = await getDb();
  const product = await db.collection('products').findOne({ id: Number(id) });
  return normalizeProduct(product);
}

export async function getRelatedProducts(product) {
  if (!product) return [];

  await ensureProductsSeeded();
  const db = await getDb();
  const products = await db.collection('products').find({ category: product.category, id: { $ne: Number(product.id) } }).limit(4).toArray();
  return products.map(normalizeProduct);
}

export async function getNextProductId() {
  const db = await getDb();
  const latest = await db.collection('products').find({}).sort({ id: -1 }).limit(1).next();
  return Number(latest?.id || 0) + 1;
}

export function buildProductPayload(input) {
  const images = Array.isArray(input.images) ? input.images : String(input.images || '').split(',').map((image) => image.trim()).filter(Boolean);
  const slug = input.slug || String(input.name || '').toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  const characteristics = Array.isArray(input.characteristics) ? input.characteristics : String(input.characteristics || '').split(',').map((c) => c.trim()).filter(Boolean);
  const colors = Array.isArray(input.colors) ? input.colors : String(input.colors || '').split(',').map((c) => c.trim()).filter(Boolean);
  const availableSizes = Array.isArray(input.availableSizes) ? input.availableSizes : String(input.availableSizes || '').split(',').map((s) => s.trim()).filter(Boolean);

  return normalizeProduct({
    id: input.id,
    name: input.name,
    category: input.category,
    price: input.price,
    badge: input.badge,
    images,
    video: input.video || '',
    slug,
    quantity: Number(input.quantity || 0),
    description: input.description,
    characteristics,
    colors,
    availableSizes
  });
}

export async function searchProducts(query) {
  if (!query || query.trim() === '') return [];
  
  await ensureProductsSeeded();
  const db = await getDb();
  const searchRegex = new RegExp(query.trim(), 'i');
  
  const products = await db.collection('products').find({
    $or: [
      { name: searchRegex },
      { slug: searchRegex }
    ]
  }).limit(10).toArray();
  
  return products.map(normalizeProduct);
}
