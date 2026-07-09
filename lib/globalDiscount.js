import { getDb } from '@/lib/mongodb';

function normalizeGlobalDiscount(discount) {
  if (!discount) return null;
  
  const expiresAt = discount.expiresAt && discount.expiresAt !== '' ? new Date(discount.expiresAt) : null;
  
  return {
    id: discount._id ? String(discount._id) : discount.id,
    discountPercent: Number(discount.discountPercent || 0),
    isActive: Boolean(discount.isActive !== undefined ? discount.isActive : true),
    expiresAt: expiresAt && !isNaN(expiresAt.getTime()) ? expiresAt : null,
    createdAt: discount.createdAt ? new Date(discount.createdAt) : new Date()
  };
}

export async function getGlobalDiscount() {
  const db = await getDb();
  const discount = await db.collection('globalDiscount').findOne({});
  return normalizeGlobalDiscount(discount);
}

export async function updateGlobalDiscount(discountData) {
  const db = await getDb();
  
  const updateData = {
    discountPercent: Number(discountData.discountPercent),
    isActive: Boolean(discountData.isActive !== undefined ? discountData.isActive : true),
    expiresAt: discountData.expiresAt && discountData.expiresAt !== '' ? new Date(discountData.expiresAt) : null,
    updatedAt: new Date()
  };
  
  const result = await db.collection('globalDiscount').updateOne(
    {},
    { $set: updateData },
    { upsert: true }
  );
  
  const updated = await db.collection('globalDiscount').findOne({});
  return normalizeGlobalDiscount(updated);
}

export async function isGlobalDiscountActive() {
  const discount = await getGlobalDiscount();
  
  if (!discount || !discount.isActive || discount.discountPercent <= 0) {
    return { active: false, discountPercent: 0 };
  }
  
  if (discount.expiresAt) {
    if (!isNaN(discount.expiresAt.getTime()) && discount.expiresAt < new Date()) {
      return { active: false, discountPercent: 0 };
    }
  }
  
  return { active: true, discountPercent: discount.discountPercent };
}
