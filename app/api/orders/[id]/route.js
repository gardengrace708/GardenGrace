import { ObjectId } from 'mongodb';
import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { getDb } from '@/lib/mongodb';
import { sendOrderStatusUpdateEmail } from '@/lib/email';

const allowedStatuses = ['Processing', 'Confirmed', 'Shipped', 'Delivered', 'Cancelled'];

function buildOrderQuery(id) {
  if (ObjectId.isValid(id)) {
    return { $or: [{ orderNumber: id }, { _id: new ObjectId(id) }] };
  }

  return { orderNumber: id };
}

function normalizeUpdatedOrder(order) {
  return {
    id: order.orderNumber || order._id.toString(),
    userId: order.userId,
    status: order.status || 'Processing',
    total: Number(order.total || 0),
    createdAt: order.createdAt ? new Date(order.createdAt).toISOString() : new Date().toISOString(),
    items: Array.isArray(order.items) ? order.items.map((item) => ({
      name: item.name || '',
      size: item.size || 'M',
      quantity: Number(item.quantity || 1),
      price: Number(item.price || 0)
    })) : []
  };
}

export async function PUT(request, { params }) {
  const currentUser = await getCurrentUser();

  if (currentUser?.user !== 1) {
    return NextResponse.json({ message: 'Admin access required' }, { status: 403 });
  }

  const body = await request.json();
  const status = body.status;

  if (!allowedStatuses.includes(status)) {
    return NextResponse.json({ message: 'Invalid order status' }, { status: 400 });
  }

  const db = await getDb();
  
  // Get the current order first to check old status and items
  const currentOrder = await db.collection('orders').findOne(buildOrderQuery(params.id));
  
  if (!currentOrder) {
    return NextResponse.json({ message: 'Order not found' }, { status: 404 });
  }

  // If order is being cancelled and wasn't already cancelled, restore product quantities
  if (status === 'Cancelled' && currentOrder.status !== 'Cancelled') {
    for (const item of currentOrder.items) {
      await db.collection('products').updateOne(
        { id: Number(item.id) },
        { $inc: { quantity: item.quantity } }
      );
    }
  }

  const result = await db.collection('orders').findOneAndUpdate(
    buildOrderQuery(params.id),
    { $set: { status, updatedAt: new Date() } },
    { returnDocument: 'after' }
  );

  if (!result) {
    return NextResponse.json({ message: 'Order not found' }, { status: 404 });
  }

  // Get user email and send status update email
  const user = await db.collection('users').findOne({ _id: result.userId });
  if (user && user.email) {
    await sendOrderStatusUpdateEmail(user.email, result.orderNumber, status);
  }

  return NextResponse.json({ order: normalizeUpdatedOrder(result) });
}
