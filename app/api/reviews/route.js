import { getDb } from '@/lib/mongodb';
import { NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('productId');

    const db = await getDb();
    const collection = db.collection('reviews');

    let reviews;
    if (productId) {
      reviews = await collection.find({ productId: Number(productId) }).sort({ createdAt: -1 }).toArray();
    } else {
      reviews = await collection.find({}).sort({ createdAt: -1 }).toArray();
    }

    return NextResponse.json({ reviews });
  } catch (error) {
    return NextResponse.json({ message: 'Reviews fetch nahi hui' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { productId, rating, comment, userId, userName, productName } = body;

    if (!productId || !rating || !userId) {
      return NextResponse.json({ message: 'Required fields missing' }, { status: 400 });
    }

    // Check if user has a delivered order for this product
    const db = await getDb();
    const ordersCollection = db.collection('orders');
    const productsCollection = db.collection('products');
    
    // Get product name if not provided
    let targetProductName = productName;
    if (!targetProductName) {
      const product = await productsCollection.findOne({ id: Number(productId) });
      targetProductName = product?.name;
    }

    if (!targetProductName) {
      return NextResponse.json({ message: 'Product not found' }, { status: 404 });
    }

    // Check if user has any orders with this product (by name)
    const anyOrder = await ordersCollection.findOne({
      userId: new ObjectId(userId),
      'items.name': targetProductName
    });

    if (!anyOrder) {
      return NextResponse.json({ message: 'Aapne is product ka order nahi kiya' }, { status: 403 });
    }

    // Check if the order is delivered (case-insensitive)
    const deliveredOrder = await ordersCollection.findOne({
      userId: new ObjectId(userId),
      'items.name': targetProductName,
      status: { $regex: /^delivered$/i }
    });

    if (!deliveredOrder) {
      return NextResponse.json({ message: `Aap is product ka review tab hi kar sakte hain jab aapka order deliver ho jaye. Current status: "${anyOrder.status}"` }, { status: 403 });
    }

    // Check if user already reviewed this product
    const reviewsCollection = db.collection('reviews');
    const existingReview = await reviewsCollection.findOne({
      productId: Number(productId),
      userId
    });

    if (existingReview) {
      return NextResponse.json({ message: 'Aapne is product ka review already kar diya hai' }, { status: 400 });
    }

    const review = {
      productId: Number(productId),
      rating: Number(rating),
      comment: comment || '',
      userId,
      userName: userName || 'Anonymous',
      createdAt: new Date()
    };

    const result = await reviewsCollection.insertOne(review);

    return NextResponse.json({ review: { ...review, id: result.insertedId } }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ message: 'Review save nahi hui' }, { status: 500 });
  }
}
