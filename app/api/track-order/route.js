import { NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';

export async function POST(request) {
  try {
    const body = await request.json();
    const { orderNumber, email } = body;

    if (!orderNumber || !email) {
      return NextResponse.json({ message: 'Order number and email are required' }, { status: 400 });
    }

    const db = await getDb();
    const order = await db.collection('orders').findOne({ 
      orderNumber: orderNumber.toUpperCase(),
      'shippingAddress.email': email.toLowerCase()
    });

    if (!order) {
      return NextResponse.json({ message: 'Order not found' }, { status: 404 });
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
        items: order.items,
        shippingAddress: order.shippingAddress
      }
    });
  } catch (error) {
    console.error('Order tracking error:', error);
    return NextResponse.json({ message: 'Failed to fetch order' }, { status: 500 });
  }
}
