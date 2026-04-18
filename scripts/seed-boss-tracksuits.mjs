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

const tracksuits = [
  {
    title: 'BOSS Tracksuit Set Black — Zip Jacket + Joggers',
    brand: 'BOSS',
    description: 'BOSS matching tracksuit set: zip-up jacket + jogger trousers in stretch cotton. Stand collar, full-length zip, embroidered BOSS logo. Elasticated waistband on joggers. Complete athleisure look.',
    categoryId: 'clothing',
    price: 389.00,
    comparePrice: 459.00,
    stock: 20,
    sku: 'BOSS-TS-BLK-001',
    sizes: ['XS','S','M','L','XL','XXL'],
    colors: ['Black'],
    tags: ['boss', 'tracksuit', 'set', 'black', 'joggers', 'zip jacket'],
    images: [
      'https://images.unsplash.com/photo-1552902865-b72c031ac5ea?w=800&q=80',
      'https://images.unsplash.com/photo-1556821840-3a63f15732ce?w=800&q=80',
    ],
    rating: 4.8,
    reviewCount: 234,
  },
  {
    title: 'BOSS Tracksuit Set Navy — Zip Jacket + Joggers',
    brand: 'BOSS',
    description: 'BOSS matching tracksuit in navy. Zip-up jacket with stand collar and embroidered logo. Slim-fit joggers with elasticated waistband and zip pockets. Premium stretch cotton.',
    categoryId: 'clothing',
    price: 389.00,
    comparePrice: 459.00,
    stock: 18,
    sku: 'BOSS-TS-NVY-001',
    sizes: ['XS','S','M','L','XL','XXL'],
    colors: ['Navy'],
    tags: ['boss', 'tracksuit', 'set', 'navy', 'joggers'],
    images: [
      'https://images.unsplash.com/photo-1544923246-77307dd654cb?w=800&q=80',
      'https://images.unsplash.com/photo-1552902865-b72c031ac5ea?w=800&q=80',
    ],
    rating: 4.7,
    reviewCount: 189,
  },
  {
    title: 'BOSS Tracksuit Set Grey — Zip Jacket + Joggers',
    brand: 'BOSS',
    description: 'BOSS tracksuit in grey marl. French terry cotton, zip-up jacket with BOSS logo, matching tapered joggers. Versatile smart-casual athleisure.',
    categoryId: 'clothing',
    price: 369.00,
    comparePrice: 429.00,
    stock: 22,
    sku: 'BOSS-TS-GRY-001',
    sizes: ['XS','S','M','L','XL','XXL'],
    colors: ['Grey'],
    tags: ['boss', 'tracksuit', 'set', 'grey', 'joggers'],
    images: [
      'https://images.unsplash.com/photo-1556821840-3a63f15732ce?w=800&q=80',
      'https://images.unsplash.com/photo-1552902865-b72c031ac5ea?w=800&q=80',
    ],
    rating: 4.6,
    reviewCount: 156,
  },
  {
    title: 'BOSS Zip-Up Track Jacket Black',
    brand: 'BOSS',
    description: 'BOSS slim-fit zip-up sweat jacket in stretch cotton. Stand collar, full-length zip, side pockets. Embroidered BOSS logo on chest. Signature athleisure piece.',
    categoryId: 'clothing',
    price: 229.00,
    comparePrice: 269.00,
    stock: 30,
    sku: 'BOSS-ZJ-BLK-001',
    sizes: ['XS','S','M','L','XL','XXL'],
    colors: ['Black'],
    tags: ['boss', 'zip jacket', 'track top', 'black'],
    images: [
      'https://images.unsplash.com/photo-1544923246-77307dd654cb?w=800&q=80',
      'https://images.unsplash.com/photo-1556821840-3a63f15732ce?w=800&q=80',
    ],
    rating: 4.8,
    reviewCount: 312,
  },
  {
    title: 'BOSS Zip-Up Track Jacket Navy',
    brand: 'BOSS',
    description: 'BOSS regular-fit zip-through sweatshirt in navy. Funnel neck, raglan sleeves, ribbed cuffs. BOSS logo embroidery. Versatile athleisure piece.',
    categoryId: 'clothing',
    price: 229.00,
    comparePrice: 0,
    stock: 25,
    sku: 'BOSS-ZJ-NVY-001',
    sizes: ['XS','S','M','L','XL','XXL'],
    colors: ['Navy'],
    tags: ['boss', 'zip jacket', 'track top', 'navy'],
    images: [
      'https://images.unsplash.com/photo-1556821840-3a63f15732ce?w=800&q=80',
      'https://images.unsplash.com/photo-1544923246-77307dd654cb?w=800&q=80',
    ],
    rating: 4.7,
    reviewCount: 198,
  },
  {
    title: 'BOSS Jogger Pants Black',
    brand: 'BOSS',
    description: 'BOSS slim-fit jogger trousers in stretch cotton. Elasticated logo waistband, zip pockets, tapered leg. Pairs perfectly with BOSS zip jacket.',
    categoryId: 'clothing',
    price: 169.00,
    comparePrice: 199.00,
    stock: 40,
    sku: 'BOSS-JG-BLK-001',
    sizes: ['XS','S','M','L','XL','XXL'],
    colors: ['Black'],
    tags: ['boss', 'joggers', 'sweatpants', 'black', 'tracksuit bottoms'],
    images: [
      'https://images.unsplash.com/photo-1552902865-b72c031ac5ea?w=800&q=80',
      'https://images.unsplash.com/photo-1594938298603-c8148c4b4d8a?w=800&q=80',
    ],
    rating: 4.7,
    reviewCount: 267,
  },
  {
    title: 'BOSS Jogger Pants Navy',
    brand: 'BOSS',
    description: 'BOSS slim-fit joggers in navy stretch cotton. Logo waistband, side zip pockets, tapered fit. Essential athleisure bottom.',
    categoryId: 'clothing',
    price: 169.00,
    comparePrice: 0,
    stock: 35,
    sku: 'BOSS-JG-NVY-001',
    sizes: ['XS','S','M','L','XL','XXL'],
    colors: ['Navy'],
    tags: ['boss', 'joggers', 'navy', 'tracksuit bottoms'],
    images: [
      'https://images.unsplash.com/photo-1594938298603-c8148c4b4d8a?w=800&q=80',
      'https://images.unsplash.com/photo-1552902865-b72c031ac5ea?w=800&q=80',
    ],
    rating: 4.6,
    reviewCount: 145,
  },
  {
    title: 'BOSS Hoodie Tracksuit Set Black',
    brand: 'BOSS',
    description: 'BOSS hoodie + jogger tracksuit set in French terry cotton. Drawstring hood, kangaroo pocket, embroidered logo. Matching tapered joggers with logo waistband.',
    categoryId: 'clothing',
    price: 349.00,
    comparePrice: 419.00,
    stock: 15,
    sku: 'BOSS-HTS-BLK-001',
    sizes: ['XS','S','M','L','XL','XXL'],
    colors: ['Black'],
    tags: ['boss', 'hoodie', 'tracksuit', 'set', 'black'],
    images: [
      'https://images.unsplash.com/photo-1556821840-3a63f15732ce?w=800&q=80',
      'https://images.unsplash.com/photo-1552902865-b72c031ac5ea?w=800&q=80',
    ],
    rating: 4.9,
    reviewCount: 178,
  },
];

async function run() {
  console.log(`Adding ${tracksuits.length} BOSS tracksuit products...\n`);
  for (const item of tracksuits) {
    const ref = await addDoc(collection(db, 'products'), {
      ...item,
      sellerId: 'seed',
      status: 'active',
      attributes: { brand: item.brand, material: 'Stretch Cotton' },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    await updateDoc(doc(db, 'products', ref.id), { id: ref.id });
    console.log(`✓ ${item.title} — $${item.price}`);
  }
  console.log('\n✅ Done! All BOSS tracksuits are live.');
  process.exit(0);
}

run().catch(e => { console.error(e.message); process.exit(1); });
