import { getDb } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

function normalizeOrder(order, user = null) {
  // Handle guest users - use guestEmail or shippingAddress.email
  const isGuestUser = !order.userId && (order.guestEmail || order.shippingAddress?.email);

  const customer = isGuestUser
    ? {
        id: null,
        name: order.shippingAddress?.name || 'Guest Customer',
        email: order.guestEmail || order.shippingAddress?.email || '',
        phone: order.shippingAddress?.phone || ''
      }
    : user && user._id
    ? {
        id: String(user._id),
        name: user.name || '',
        email: user.email || '',
        phone: order.shippingAddress?.phone || ''
      }
    : null;

  return {
    id: order.orderNumber || String(order._id || ''),
    userId: order.userId || null,
    guestEmail: order.guestEmail || null,
    customer,
    shippingAddress: order.shippingAddress || null,
    status: order.status || 'Processing',
    total: Number(order.total || 0),
    paymentProof: order.paymentProof || null,
    paymentVerified: order.paymentVerified || false,
    advancePayment: order.advancePayment || 300,
    justConfirmed: order.justConfirmed || false,
    createdAt: order.createdAt
      ? new Date(order.createdAt).toISOString()
      : new Date().toISOString(),
    items: Array.isArray(order.items)
      ? order.items.map((item) => ({
          name: item.name || '',
          size: item.size || 'M',
          quantity: Number(item.quantity || 1),
          price: Number(item.price || 0),
          productId: item.productId || null
        }))
      : []
  };
}



export async function getOrdersForUser(user) {
  const db = await getDb();
  const orders = await db.collection('orders').find({ userId: new ObjectId(user.id) }).sort({ createdAt: -1 }).toArray();
  return orders.map((order) => normalizeOrder(order));
}

export async function getOrders() {
  const db = await getDb();

  const [orders, users] = await Promise.all([
    db.collection('orders').find({}).sort({ createdAt: -1 }).toArray(),
    db.collection('users').find({}).toArray()
  ]);

  const usersById = new Map(
    users
      .filter((user) => user && user._id)
      .map((user) => [String(user._id), user])
  );

  return orders.map((order) => {
    const user = usersById.get(String(order.userId));

    return normalizeOrder(order, user);
  });
}
