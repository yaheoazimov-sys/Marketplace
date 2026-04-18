import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, updateDoc, doc } from 'firebase/firestore';

const app = initializeApp({
  apiKey: "AIzaSyAVtOFYZ_0r2pzJI1vvpped1wwCQtjOwiY",
  authDomain: "yahyoshopai.firebaseapp.com",
  projectId: "yahyoshopai",
  storageBucket: "yahyoshopai.firebasestorage.app",
  messagingSenderId: "1054569171754",
  appId: "1:1054569171754:web:c534e4584fb2d5ba7a6c53",
});
const db = getFirestore(app);

const items = [
  {
    title: 'BOSS Cap-US Baseball Cap Navy',
    brand: 'BOSS',
    description: 'BOSS cotton-twill baseball cap in navy blue. Large embroidered BOSS logo on front panel with contrast white outline. Adjustable strap at back, curved peak, sandwich brim detail.',
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
    title: 'BOSS Zip-Up Track Jacket Black',
    brand: 'BOSS',
    description: 'BOSS slim-fit zip-up sweat jacket in stretch cotton. Stand collar, full-length zip, side pockets. Embroidered BOSS logo on chest. Premium athleisure essential.',
    categoryId: 'clothing',
    price: 229.00,
    comparePrice: 279.00,
    stock: 25,
    sku: 'BOSS-ZIP-BLK-001',
    sizes: ['XS','S','M','L','XL','XXL'],
    colors: ['Black'],
    tags: ['boss', 'zip jacket', 'track jacket', 'black', 'athleisure'],
    images: [
      'https://images.unsplash.com/photo-1544923246-77307dd654cb?w=800&q=80',
      'https://images.unsplash.com/photo-1556821840-3a63f15732ce?w=800&q=80',
    ],
    rating: 4.8,
    reviewCount: 312,
  },
  {
    title: 'BOSS Tiburt Logo T-Shirt Black',
    brand: 'BOSS',
    description: 'BOSS regular-fit T-shirt in pure Supima cotton. Large BOSS logo in textured white print across the chest. Crew neck, short sleeves, ribbed collar. Iconic streetwear staple.',
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
];

async function run() {
  console.log('Adding 4 products...\n');
  for (const item of items) {
    const ref = await addDoc(collection(db, 'products'), {
      ...item,
      sellerId: 'seed',
      status: 'active',
      attributes: { brand: item.brand },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    await updateDoc(doc(db, 'products', ref.id), { id: ref.id });
    console.log(`✓ ${item.title} — $${item.price}`);
  }
  console.log('\nDone!');
  process.exit(0);
}

run().catch(e => { console.error(e.message); process.exit(1); });
