import { NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const since = searchParams.get('since');

    const db = await getDb();
    let query = {};
    
    if (since) {
      query = {
        createdAt: { $gt: new Date(since) }
      };
    }

    const orders = await db.collection('orders')
      .find(query)
      .sort({ createdAt: -1 })
      .limit(10)
      .toArray();

    return NextResponse.json({
      orders: orders.map(order => ({
        id: order.orderNumber,
        total: Number(order.total),
        shippingAddress: order.shippingAddress,
        createdAt: order.createdAt.toISOString()
      }))
    });
  } catch (error) {
    console.error('Error fetching new orders:', error);
    return NextResponse.json({ message: 'Failed to fetch orders' }, { status: 500 });
  }
}
