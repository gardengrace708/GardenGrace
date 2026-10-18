import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017';
const dbName = process.env.MONGODB_DB || 'GardenGrace';

let clientPromise;

if (!global._GardenGraceMongoClientPromise) {
  const client = new MongoClient(uri);
  global._GardenGraceMongoClientPromise = client.connect();
}

clientPromise = global._GardenGraceMongoClientPromise;

export async function getDb() {
  const client = await clientPromise;
  return client.db(dbName);
}
