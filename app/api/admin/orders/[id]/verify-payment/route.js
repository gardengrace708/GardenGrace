import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { getDb } from '@/lib/mongodb';

export async function POST(request, { params }) {
  try {
    const currentUser = await getCurrentUser();

    if (currentUser?.user !== 1) {
      return NextResponse.json({ message: 'Admin access required' }, { status: 403 });
    }

    const { id } = params;
    const body = await request.json();
    const { verified } = body;

    const db = await getDb();
    
    if (verified) {
      // If payment is verified, change status to Processing
      const result = await db.collection('orders').updateOne(
        { orderNumber: id },
        { $set: { status: 'Processing', paymentVerified: true, paymentVerifiedAt: new Date(), justConfirmed: true } }
      );

      if (result.matchedCount === 0) {
        return NextResponse.json({ message: 'Order not found' }, { status: 404 });
      }

      const updatedOrder = await db.collection('orders').findOne({ orderNumber: id });

      return NextResponse.json({
        message: 'Payment verified and order confirmed',
        order: {
          id: updatedOrder.orderNumber,
          status: updatedOrder.status,
          paymentVerified: updatedOrder.paymentVerified,
          justConfirmed: updatedOrder.justConfirmed
        }
      });
    } else {
      // If payment is not verified, keep as Pending but mark as rejected
      const result = await db.collection('orders').updateOne(
        { orderNumber: id },
        { $set: { paymentVerified: false, paymentVerifiedAt: new Date() } }
      );

      if (result.matchedCount === 0) {
        return NextResponse.json({ message: 'Order not found' }, { status: 404 });
      }

      return NextResponse.json({
        message: 'Payment rejected',
        order: { id, paymentVerified: false }
      });
    }
  } catch (error) {
    console.error('Payment verification error:', error);
    return NextResponse.json({ message: 'Failed to verify payment' }, { status: 500 });
  }
}
