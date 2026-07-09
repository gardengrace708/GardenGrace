import { getDb } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

function normalizeOrder(order, user = null) {
  return {
    id: order.orderNumber || String(order._id || ''),
    userId: order.userId || null,

    customer:
      user && user._id
        ? {
            id: String(user._id),
            name: user.name || '',
            email: user.email || ''
          }
        : null,

    status: order.status || 'Processing',

    total: Number(order.total || 0),

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

export async function ensureSampleOrders(user) {
  const db = await getDb();
  const existingOrders = await db.collection('orders').find({ userId: new ObjectId(user.id) }).toArray();

  if (existingOrders.length === 0) {
    await db.collection('orders').insertMany([
      {
        userId: new ObjectId(user.id),
        orderNumber: `MK-${Date.now().toString().slice(-6)}`,
        status: 'Delivered',
        total: 27000,
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 14),
        items: [
          { name: 'Noor Jahan Set', size: 'M', quantity: 1, price: 18500, productId: 2 },
          { name: 'Shaan-e-Raat Kurta', size: 'L', quantity: 1, price: 8500, productId: 1 }
        ]
      },
      {
        userId: new ObjectId(user.id),
        orderNumber: `MK-${(Date.now() + 7).toString().slice(-6)}`,
        status: 'Processing',
        total: 12500,
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2),
        items: [
          { name: 'Gul-e-Zar Shirt', size: 'S', quantity: 1, price: 12500, productId: 3 }
        ]
      }
    ]);
  } else {
    // Update existing orders to add productId if missing
    for (const order of existingOrders) {
      const needsUpdate = order.items?.some(item => !item.productId);
      if (needsUpdate) {
        const productMap = {
          'Noor Jahan Set': 2,
          'Shaan-e-Raat Kurta': 1,
          'Gul-e-Zar Shirt': 3
        };
        const updatedItems = order.items.map(item => ({
          ...item,
          productId: item.productId || productMap[item.name] || null
        }));
        await db.collection('orders').updateOne(
          { _id: order._id },
          { $set: { items: updatedItems } }
        );
      }
    }
  }
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
