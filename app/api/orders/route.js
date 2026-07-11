import { ObjectId } from 'mongodb';
import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { getDb } from '@/lib/mongodb';
import { incrementCouponUsage } from '@/lib/coupons';
import { sendOrderConfirmationEmail } from '@/lib/email';

export async function POST(request) {
  try {
    const body = await request.json();
    const { userId, items, total, discount = 0, couponCode = null, shippingAddress } = body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ message: 'Invalid order items' }, { status: 400 });
    }

    const db = await getDb();
    const orderNumber = `MK-${Date.now().toString().slice(-6)}`;

    // Check stock availability and decrease quantities
    for (const item of items) {
      const product = await db.collection('products').findOne({ id: Number(item.id) });
      if (!product) {
        return NextResponse.json({ message: `Product with ID ${item.id} not found` }, { status: 400 });
      }
      if (product.quantity < item.quantity) {
        return NextResponse.json({ message: `Not enough stock for ${product.name}` }, { status: 400 });
      }
    }

    // Decrease product quantities
    for (const item of items) {
      await db.collection('products').updateOne(
        { id: Number(item.id) },
        { $inc: { quantity: -item.quantity } }
      );
    }

    const result = await db.collection('orders').insertOne({
      userId: userId ? new ObjectId(userId) : null,
      orderNumber,
      items,
      total,
      discount,
      couponCode,
      shippingAddress,
      status: 'Processing',
      createdAt: new Date()
    });

    // Increment coupon usage if coupon was applied
    if (couponCode) {
      await incrementCouponUsage(couponCode);
    }

    const order = await db.collection('orders').findOne({ _id: result.insertedId });

    // Send confirmation email to shipping address email
    if (shippingAddress && shippingAddress.email) {
      await sendOrderConfirmationEmail(shippingAddress.email, orderNumber, items, total);
    }

    return NextResponse.json({
      order: {
        id: order.orderNumber || String(order._id),
        userId: order.userId,
        status: order.status,
        total: Number(order.total),
        discount: Number(order.discount || 0),
        couponCode: order.couponCode || null,
        createdAt: order.createdAt.toISOString(),
        items: order.items
      }
    }, { status: 201 });
  } catch (error) {
    console.error('Order creation error:', error);
    return NextResponse.json({ message: 'Failed to create order' }, { status: 500 });
  }
}
