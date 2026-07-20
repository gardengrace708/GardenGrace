import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017';
const dbName = process.env.MONGODB_DB || 'makhsoos';

let clientPromise;

if (!global._makhsoosMongoClientPromise) {
  const client = new MongoClient(uri);
  global._makhsoosMongoClientPromise = client.connect();
}

clientPromise = global._makhsoosMongoClientPromise;

export async function getDb() {
  const client = await clientPromise;
  return client.db(dbName);
}
