import { NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const orderNumber = searchParams.get('order');
    const email = searchParams.get('email');

    if (!orderNumber || !email) {
      return NextResponse.json({ message: 'Order number and email are required' }, { status: 400 });
    }

    const db = await getDb();
    
    // Find order by order number and email (from shippingAddress)
    const order = await db.collection('orders').findOne({
      orderNumber: orderNumber,
      $or: [
        { guestEmail: email },
        { 'shippingAddress.email': email }
      ]
    });

    if (!order) {
      return NextResponse.json({ message: 'Order not found' }, { status: 404 });
    }

    return NextResponse.json({
      id: order.orderNumber,
      status: order.status,
      paymentProof: order.paymentProof || null,
      paymentVerified: order.paymentVerified || false,
      total: Number(order.total),
      createdAt: order.createdAt.toISOString(),
      items: order.items
    });
  } catch (error) {
    console.error('Track order error:', error);
    return NextResponse.json({ message: 'Failed to fetch order' }, { status: 500 });
  }
}
