import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017';
const dbName = process.env.MONGODB_DB || 'makhsoos';

let clientPromise;

if (!global._makhsoosMongoClientPromise) {
  const client = new MongoClient(uri, {
    maxPoolSize: 10,
    minPoolSize: 2,
    maxIdleTimeMS: 60000,
    connectTimeoutMS: 60000,
    socketTimeoutMS: 60000,
    serverSelectionTimeoutMS: 60000,
    retryWrites: true,
    retryReads: true
  });
  global._makhsoosMongoClientPromise = client.connect();
}

clientPromise = global._makhsoosMongoClientPromise;

export async function getDb() {
  try {
    const client = await clientPromise;
    return client.db(dbName);
  } catch (error) {
    console.error('MongoDB connection error:', error);
    // Reset the global promise to force reconnection
    global._makhsoosMongoClientPromise = null;
    throw error;
  }
}
