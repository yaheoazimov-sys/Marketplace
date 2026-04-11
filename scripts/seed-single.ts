import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

if (!getApps().length) {
  initializeApp({ credential: cert({ projectId: process.env.FIREBASE_PROJECT_ID, clientEmail: process.env.FIREBASE_CLIENT_EMAIL, privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n') }) });
}
const db = getFirestore();

async function run() {
  const ref = db.collection('products').doc();
  await ref.set({
    id: ref.id,
    title: 'BOSS Tiburt Logo T-Shirt Black',
    description: 'BOSS regular-fit T-shirt in pure Supima cotton. Features the iconic large BOSS logo in textured white print across the chest. Crew neck, short sleeves, ribbed collar. A signature piece from the BOSS casualwear collection — effortlessly bold.',
    price: 89.00,
    stock: 50,
    categoryId: 'clothing',
    brand: 'BOSS',
    sellerId: 'seed',
    status: 'active',
    images: [
      'https://images.unsplash.com/photo-1503341504253-dff4815485f1?w=800&q=80',
    ],
    rating: 4.9,
    reviewCount: 847,
    attributes: { brand: 'BOSS', fit: 'Regular', material: '100% Supima Cotton', color: 'Black', logo: 'Textured White Print' },
    createdAt: new Date().toISOString(),
  });
  console.log('✅ Added: BOSS Tiburt Logo T-Shirt Black — ID:', ref.id);
}

run().catch(console.error);
