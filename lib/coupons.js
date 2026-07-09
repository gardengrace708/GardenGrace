import { getDb } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

function normalizeCoupon(coupon) {
  if (!coupon) return null;
  
  const expiresAt = coupon.expiresAt && coupon.expiresAt !== '' ? new Date(coupon.expiresAt) : null;
  
  return {
    id: coupon._id ? String(coupon._id) : coupon.id,
    code: coupon.code || '',
    discountPercent: Number(coupon.discountPercent || 0),
    isActive: Boolean(coupon.isActive !== undefined ? coupon.isActive : true),
    maxUses: Number(coupon.maxUses || 0),
    usedCount: Number(coupon.usedCount || 0),
    expiresAt: expiresAt && !isNaN(expiresAt.getTime()) ? expiresAt : null,
    createdAt: coupon.createdAt ? new Date(coupon.createdAt) : new Date()
  };
}

export async function getCoupons() {
  const db = await getDb();
  const coupons = await db.collection('coupons').find({}).sort({ createdAt: -1 }).toArray();
  return coupons.map(normalizeCoupon);
}

export async function getCouponByCode(code) {
  const db = await getDb();
  const coupon = await db.collection('coupons').findOne({ code: code.toUpperCase() });
  return normalizeCoupon(coupon);
}

export async function getCouponById(id) {
  const db = await getDb();
  const coupon = await db.collection('coupons').findOne({ _id: new ObjectId(id) });
  return normalizeCoupon(coupon);
}

export async function createCoupon(couponData) {
  const db = await getDb();
  
  const coupon = {
    code: couponData.code.toUpperCase(),
    discountPercent: Number(couponData.discountPercent),
    isActive: couponData.isActive !== undefined ? couponData.isActive : true,
    maxUses: Number(couponData.maxUses) || 0,
    usedCount: 0,
    expiresAt: couponData.expiresAt && couponData.expiresAt !== '' ? new Date(couponData.expiresAt) : null,
    createdAt: new Date()
  };
  
  const result = await db.collection('coupons').insertOne(coupon);
  return normalizeCoupon({ ...coupon, _id: result.insertedId });
}

export async function updateCoupon(id, couponData) {
  const db = await getDb();
  
  const updateData = {};
  if (couponData.code !== undefined) updateData.code = couponData.code.toUpperCase();
  if (couponData.discountPercent !== undefined) updateData.discountPercent = Number(couponData.discountPercent);
  if (couponData.isActive !== undefined) updateData.isActive = Boolean(couponData.isActive);
  if (couponData.maxUses !== undefined) updateData.maxUses = Number(couponData.maxUses);
  if (couponData.expiresAt !== undefined) updateData.expiresAt = couponData.expiresAt && couponData.expiresAt !== '' ? new Date(couponData.expiresAt) : null;
  
  const result = await db.collection('coupons').updateOne(
    { _id: new ObjectId(id) },
    { $set: updateData }
  );
  
  if (result.matchedCount === 0) return null;
  
  const updated = await db.collection('coupons').findOne({ _id: new ObjectId(id) });
  return normalizeCoupon(updated);
}

export async function deleteCoupon(id) {
  const db = await getDb();
  const result = await db.collection('coupons').deleteOne({ _id: new ObjectId(id) });
  return result.deletedCount > 0;
}

export async function incrementCouponUsage(code) {
  const db = await getDb();
  const result = await db.collection('coupons').updateOne(
    { code: code.toUpperCase() },
    { $inc: { usedCount: 1 } }
  );
  return result.modifiedCount > 0;
}

export async function validateCoupon(code) {
  const coupon = await getCouponByCode(code);
  
  if (!coupon) {
    return { valid: false, message: 'Invalid coupon code' };
  }
  
  if (!coupon.isActive) {
    return { valid: false, message: 'This coupon is not active' };
  }
  
  if (coupon.expiresAt) {
    if (!isNaN(coupon.expiresAt.getTime()) && coupon.expiresAt < new Date()) {
      return { valid: false, message: 'This coupon has expired' };
    }
  }
  
  if (coupon.maxUses > 0 && coupon.usedCount >= coupon.maxUses) {
    return { valid: false, message: 'This coupon has reached its maximum usage limit' };
  }
  
  return { 
    valid: true, 
    coupon: coupon,
    message: 'Coupon applied successfully' 
  };
}
