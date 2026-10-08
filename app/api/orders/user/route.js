import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { getDb } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export async function GET(request) {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json({ message: 'Not authenticated' }, { status: 401 });
    }

    const db = await getDb();
    const orders = await db.collection('orders')
      .find({ userId: new ObjectId(currentUser.id) })
      .sort({ createdAt: -1 })
      .toArray();

    const normalizedOrders = orders.map(order => ({
      id: order.orderNumber,
      status: order.status,
      total: Number(order.total),
      paymentProof: order.paymentProof || null,
      paymentVerified: order.paymentVerified || false,
      shippingAddress: order.shippingAddress,
      createdAt: order.createdAt.toISOString(),
      items: order.items
    }));

    return NextResponse.json({ orders: normalizedOrders });
  } catch (error) {
    console.error('Fetch user orders error:', error);
    return NextResponse.json({ message: 'Failed to fetch orders' }, { status: 500 });
  }
}
