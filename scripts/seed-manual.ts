import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

if (!getApps().length) {
  initializeApp({ credential: cert({ projectId: process.env.FIREBASE_PROJECT_ID, clientEmail: process.env.FIREBASE_CLIENT_EMAIL, privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n') }) });
}
const db = getFirestore();

const items = [
  {
    title: 'Brunello Cucinelli Leather Sneakers Navy',
    brand: 'Brunello Cucinelli',
    description: 'Brunello Cucinelli low-top sneakers in smooth navy calfskin leather with suede toe cap. White rubber sole, gold logo embossing, lace-up closure. Crafted in Italy. The ultimate luxury casual sneaker.',
    categoryId: 'fashion',
    price: 895.00,
    comparePrice: 1050.00,
    stock: 8,
    sku: 'BC-SNK-NAVY-001',
    sizes: ['39','40','41','42','43','44','45'],
    colors: ['Navy'],
    tags: ['brunello cucinelli', 'sneakers', 'luxury', 'leather', 'italian'],
    images: [
      'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80',
      'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=800&q=80',
    ],
    rating: 4.9,
    reviewCount: 34,
  },
  {
    title: 'BOSS Cap-US Baseball Cap Navy',
    brand: 'BOSS',
    description: 'BOSS cotton-twill baseball cap in navy blue. Large embroidered BOSS logo on front panel with contrast outline. Adjustable strap at back, curved peak, sandwich brim detail. As seen in campaign.',
    categoryId: 'fashion',
    price: 69.00,
    comparePrice: 0,
    stock: 55,
    sku: 'BOSS-CAP-NAVY-001',
    sizes: ['One Size'],
    colors: ['Navy'],
    tags: ['boss', 'cap', 'baseball cap', 'navy', 'hat'],
    images: [
      'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=800&q=80',
      'https://images.unsplash.com/photo-1521369909029-2afed882baee?w=800&q=80',
    ],
    rating: 4.7,
    reviewCount: 128,
  },
  {
    title: 'BOSS Tiburt Logo T-Shirt Black',
    brand: 'BOSS',
    description: 'BOSS regular-fit T-shirt in pure Supima cotton. Features the iconic large BOSS logo in textured white print across the chest. Crew neck, short sleeves, ribbed collar. A signature piece from the BOSS casualwear collection — effortlessly bold.',
    categoryId: 'clothing',
    price: 89.00,
    comparePrice: 0,
    stock: 50,
    sku: 'BOSS-TEE-BLK-001',
    sizes: ['XS','S','M','L','XL','XXL'],
    colors: ['Black'],
    tags: ['boss', 't-shirt', 'logo', 'black', 'cotton'],
    images: [
      'https://images.unsplash.com/photo-1503341504253-dff4815485f1?w=800&q=80',
      'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&q=80',
    ],
    rating: 4.9,
    reviewCount: 847,
  },
];

async function seed() {
  console.log('🛍️  Adding 3 products to Firestore...\n');
  const batch = db.batch();
  for (const item of items) {
    const ref = db.collection('products').doc();
    batch.set(ref, {
      id: ref.id,
      ...item,
      sellerId: 'seed',
      status: 'active',
      attributes: { brand: item.brand, material: 'Premium' },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    console.log(`  ✓ ${item.title} — $${item.price}`);
  }
  await batch.commit();
  console.log('\n✅ Done! Products are now live in your store.');
  console.log('🌐 Visit your store to see them.');
}

seed().catch(console.error);
