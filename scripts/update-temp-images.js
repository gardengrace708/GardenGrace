const { MongoClient } = require('mongodb');

const products = [
  { id: 1, images: ['https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=900&q=80', 'https://images.unsplash.com/photo-1597983073493-88cd35cf93b0?auto=format&fit=crop&w=900&q=80'] },
  { id: 2, images: ['https://images.unsplash.com/photo-1617019114583-affb34d1b3cd?auto=format&fit=crop&w=900&q=80', 'https://images.unsplash.com/photo-1583391733956-6c78276477e2?auto=format&fit=crop&w=900&q=80'] },
  { id: 3, images: ['https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=900&q=80', 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=900&q=80'] },
  { id: 4, images: ['https://images.unsplash.com/photo-1485968579580-b6d095142e6e?auto=format&fit=crop&w=900&q=80', 'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=900&q=80'] },
  { id: 5, images: ['https://images.unsplash.com/photo-1539008835657-9e8e9680c956?auto=format&fit=crop&w=900&q=80', 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=900&q=80'] },
  { id: 6, images: ['https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=900&q=80', 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=900&q=80'] },
  { id: 7, images: ['https://images.unsplash.com/photo-1566174053879-31528523f8ae?auto=format&fit=crop&w=900&q=80', 'https://images.unsplash.com/photo-1551803091-e20673f15770?auto=format&fit=crop&w=900&q=80'] },
  { id: 8, images: ['https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=900&q=80', 'https://images.unsplash.com/photo-1545291730-faff8ca1d4b0?auto=format&fit=crop&w=900&q=80'] }
];

async function main() {
  const client = new MongoClient(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017');
  await client.connect();
  const db = client.db(process.env.MONGODB_DB || 'makhsoos');

  for (const product of products) {
    await db.collection('products').updateOne({ id: product.id }, { $set: { images: product.images } });
  }

  await client.close();
  console.log('Temporary product images updated');
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
