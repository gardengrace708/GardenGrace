import { ObjectId } from 'mongodb';
import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { getDb } from '@/lib/mongodb';
import { incrementCouponUsage } from '@/lib/coupons';
import { sendOrderConfirmationEmail } from '@/lib/email';

export async function POST(request) {
  try {
    const body = await request.json();
    const { userId, guestEmail, items, total, discount = 0, couponCode = null, shippingAddress } = body;

    console.log('Received order request:', { userId, guestEmail, items, total, discount, couponCode });

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ message: 'Invalid order items' }, { status: 400 });
    }

    const db = await getDb();
    const orderNumber = `MK-${Date.now().toString().slice(-6)}`;

    // Check stock availability and decrease quantities
    for (const item of items) {
      console.log('Checking product with ID:', item.id, 'Type:', typeof item.id);
      const product = await db.collection('products').findOne({ id: Number(item.id) });
      console.log('Found product:', product);
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

    // Handle both logged-in users and guest users
    const orderData = {
      userId: userId ? new ObjectId(userId) : null,
      guestEmail: guestEmail || null,
      orderNumber,
      items,
      total,
      discount,
      couponCode,
      shippingAddress,
      status: 'Processing',
      createdAt: new Date()
    };

    const result = await db.collection('orders').insertOne(orderData);

    // Increment coupon usage if coupon was applied
    if (couponCode) {
      await incrementCouponUsage(couponCode);
    }

    const order = await db.collection('orders').findOne({ _id: result.insertedId });

    // Send confirmation email to the email provided in shipping form
    // For both logged-in and guest users, use shippingAddress.email
    const emailToSend = shippingAddress.email;
    if (emailToSend) {
      await sendOrderConfirmationEmail(emailToSend, orderNumber, items, total);
    }

    return NextResponse.json({
      order: {
        id: order.orderNumber || String(order._id),
        userId: order.userId,
        guestEmail: order.guestEmail,
        status: order.status,
        total: Number(order.total),
        discount: Number(order.discount || 0),
        couponCode: order.couponCode || null,
        createdAt: order.createdAt.toISOString(),
        items: order.items,
        shippingAddress: order.shippingAddress
      }
    }, { status: 201 });
  } catch (error) {
    console.error('Order creation error:', error);
    return NextResponse.json({ message: 'Failed to create order' }, { status: 500 });
  }
}
