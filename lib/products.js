import { getDb } from '@/lib/mongodb';
import { products as seedProducts } from '@/lib/data/products';

export async function ensureProductsSeeded() {
  const db = await getDb();
  const count = await db.collection('products').countDocuments();
  
  if (count === 0) {
    const normalizedProducts = seedProducts.map(p => buildProductPayload(p));
    await db.collection('products').insertMany(normalizedProducts);
  }
}

function normalizeProduct(product) {
  if (!product) return null;
  const images = Array.isArray(product.images) ? product.images : [];
  const quantity = Number(product.quantity || 0);

  // Calculate stock status based on quantity
  let stockStatus = 'sold_out';
  if (quantity > 10) {
    stockStatus = 'available';
  } else if (quantity > 0) {
    stockStatus = 'limited';
  }

  // Handle colorImages - if it exists, use it; otherwise create a default mapping
  let colorImages = {};
  if (product.colorImages && typeof product.colorImages === 'object') {
    colorImages = product.colorImages;
  } else {
    // Backward compatibility: if no colorImages, map all images to first color
    const firstColor = (Array.isArray(product.colors) ? product.colors[0] : null) || 'Default';
    colorImages[firstColor] = images;
  }

  return {
    id: Number(product.id),
    name: product.name || '',
    category: product.category || '',
    price: Number(product.price || 0),
    badge: product.badge || '',
    images,
    video: product.video || '',
    slug: product.slug || '',
    quantity,
    stockStatus,
    inStock: quantity > 0,
    description: product.description || '',
    characteristics: Array.isArray(product.characteristics) ? product.characteristics : [],
    colors: Array.isArray(product.colors) ? product.colors : [],
    availableSizes: Array.isArray(product.availableSizes) ? product.availableSizes : [],
    colorImages
  };
}

export async function getProducts() {
  const db = await getDb();
  const products = await db.collection('products').find({}).sort({ id: 1 }).toArray();
  return products.map(normalizeProduct);
}

export async function getProductById(id) {
  const db = await getDb();
  const product = await db.collection('products').findOne({ id: Number(id) });
  return normalizeProduct(product);
}

export async function getRelatedProducts(product) {
  if (!product) return [];

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

  // Handle colorImages - parse from JSON string if provided
  let colorImages = {};
  if (input.colorImages) {
    try {
      colorImages = typeof input.colorImages === 'string' ? JSON.parse(input.colorImages) : input.colorImages;
    } catch (e) {
      colorImages = {};
    }
  }

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
    availableSizes,
    colorImages
  });
}

export async function searchProducts(query) {
  if (!query || query.trim() === '') return [];
  
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
