import { NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';

export async function POST(request, { params }) {
  try {
    const { id } = params;
    const body = await request.json();
    const { paymentProof } = body;

    if (!paymentProof) {
      return NextResponse.json({ message: 'Payment proof image URL is required' }, { status: 400 });
    }

    const db = await getDb();
    
    // Find and update the order
    const result = await db.collection('orders').updateOne(
      { orderNumber: id },
      { $set: { paymentProof } }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ message: 'Order not found' }, { status: 404 });
    }

    const updatedOrder = await db.collection('orders').findOne({ orderNumber: id });

    return NextResponse.json({
      message: 'Payment proof uploaded successfully',
      order: {
        id: updatedOrder.orderNumber,
        paymentProof: updatedOrder.paymentProof,
        status: updatedOrder.status
      }
    });
  } catch (error) {
    console.error('Payment proof upload error:', error);
    return NextResponse.json({ message: 'Failed to upload payment proof' }, { status: 500 });
  }
}
