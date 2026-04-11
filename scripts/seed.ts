import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

if (!getApps().length) {
  initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
  });
}

const db = getFirestore();

const categories = [
  { id: 'electronics', name: 'Electronics', slug: 'electronics', parentId: null },
  { id: 'clothing', name: 'Clothing', slug: 'clothing', parentId: null },
  { id: 'home', name: 'Home & Garden', slug: 'home', parentId: null },
  { id: 'sports', name: 'Sports', slug: 'sports', parentId: null },
  { id: 'fashion', name: 'Fashion & Accessories', slug: 'fashion', parentId: null },
  { id: 'food', name: 'Food & Drinks', slug: 'food', parentId: null },
  { id: 'handmade', name: 'Handmade & Creative', slug: 'handmade', parentId: null },
];

const products = [
  {
    title: 'Premium Wireless Headphones',
    description: 'Over-ear noise-cancelling headphones with 30h battery life and Hi-Res Audio support.',
    price: 299.99,
    stock: 15,
    categoryId: 'electronics',
    images: ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80'],
    sellerId: 'seed',
    status: 'active',
    rating: 4.8,
    reviewCount: 124,
  },
  {
    title: 'Mechanical Keyboard Pro',
    description: 'TKL mechanical keyboard with Cherry MX switches, RGB backlight and aluminum frame.',
    price: 149.00,
    stock: 30,
    categoryId: 'electronics',
    images: ['https://images.unsplash.com/photo-1595225476474-87563907a212?w=800&q=80'],
    sellerId: 'seed',
    status: 'active',
    rating: 4.6,
    reviewCount: 89,
  },
  {
    title: '4K Ultra Monitor 27"',
    description: '27-inch IPS 4K display, 144Hz refresh rate, HDR400, USB-C 65W charging.',
    price: 449.00,
    stock: 8,
    categoryId: 'electronics',
    images: ['https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=800&q=80'],
    sellerId: 'seed',
    status: 'active',
    rating: 4.7,
    reviewCount: 56,
  },
  {
    title: 'Smart Home Speaker',
    description: 'Voice-controlled smart speaker with 360° sound, built-in assistant and smart home hub.',
    price: 89.99,
    stock: 25,
    categoryId: 'electronics',
    images: ['https://images.unsplash.com/photo-1589003077984-894e133dabab?w=800&q=80'],
    sellerId: 'seed',
    status: 'active',
    rating: 4.4,
    reviewCount: 210,
  },
  {
    title: 'Minimalist Wrist Watch',
    description: 'Slim stainless steel watch with sapphire glass, 5ATM water resistance and 2-year battery.',
    price: 120.00,
    stock: 20,
    categoryId: 'clothing',
    images: ['https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80'],
    sellerId: 'seed',
    status: 'active',
    rating: 4.5,
    reviewCount: 77,
  },
  {
    title: 'Ergonomic Office Chair',
    description: 'Fully adjustable mesh chair with lumbar support, 4D armrests and 5-year warranty.',
    price: 399.00,
    stock: 10,
    categoryId: 'home',
    images: ['https://images.unsplash.com/photo-1592078615290-033ee584e267?w=800&q=80'],
    sellerId: 'seed',
    status: 'active',
    rating: 4.9,
    reviewCount: 43,
  },
  {
    title: 'Yoga Mat Premium',
    description: 'Non-slip 6mm thick eco-friendly TPE yoga mat with alignment lines and carry strap.',
    price: 45.00,
    stock: 50,
    categoryId: 'sports',
    images: ['https://images.unsplash.com/photo-1601925228008-f5e4c5e5b8e4?w=800&q=80'],
    sellerId: 'seed',
    status: 'active',
    rating: 4.6,
    reviewCount: 188,
  },
  {
    title: 'Running Shoes Air Max',
    description: 'Lightweight breathable running shoes with responsive foam sole and reflective details.',
    price: 129.99,
    stock: 35,
    categoryId: 'sports',
    images: ['https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80'],
    sellerId: 'seed',
    status: 'active',
    rating: 4.7,
    reviewCount: 302,
  },
  {
    title: 'Leather Backpack',
    description: 'Genuine leather 20L backpack with laptop compartment, USB charging port and anti-theft zipper.',
    price: 189.00,
    stock: 18,
    categoryId: 'clothing',
    images: ['https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&q=80'],
    sellerId: 'seed',
    status: 'active',
    rating: 4.8,
    reviewCount: 95,
  },
  {
    title: 'Ceramic Coffee Set',
    description: 'Handmade ceramic coffee set for 4: cups, saucers and a pour-over dripper. Dishwasher safe.',
    price: 65.00,
    stock: 22,
    categoryId: 'home',
    images: ['https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=800&q=80'],
    sellerId: 'seed',
    status: 'active',
    rating: 4.5,
    reviewCount: 61,
  },

  // 👕 Fashion & Accessories
  {
    title: 'Oversized Linen Shirt',
    description: 'Breathable 100% linen oversized shirt, perfect for summer. Available in 5 neutral tones.',
    price: 59.00,
    stock: 40,
    categoryId: 'fashion',
    images: ['https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=800&q=80'],
    sellerId: 'seed',
    status: 'active',
    rating: 4.6,
    reviewCount: 143,
  },
  {
    title: 'Vintage Sunglasses',
    description: 'Retro round polarized sunglasses with UV400 protection and spring hinges.',
    price: 34.99,
    stock: 60,
    categoryId: 'fashion',
    images: ['https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=800&q=80'],
    sellerId: 'seed',
    status: 'active',
    rating: 4.4,
    reviewCount: 218,
  },
  {
    title: 'Gold Layered Necklace Set',
    description: '18K gold-plated layered necklace set of 3, tarnish-resistant, hypoallergenic.',
    price: 28.00,
    stock: 75,
    categoryId: 'fashion',
    images: ['https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=800&q=80'],
    sellerId: 'seed',
    status: 'active',
    rating: 4.7,
    reviewCount: 389,
  },
  {
    title: 'Canvas Tote Bag',
    description: 'Heavy-duty 12oz canvas tote with inner pocket, reinforced handles and custom print.',
    price: 22.00,
    stock: 100,
    categoryId: 'fashion',
    images: ['https://images.unsplash.com/photo-1544816155-12df9643f363?w=800&q=80'],
    sellerId: 'seed',
    status: 'active',
    rating: 4.5,
    reviewCount: 276,
  },

  // 🍔 Food & Drinks
  {
    title: 'Artisan Coffee Beans 1kg',
    description: 'Single-origin Ethiopian Yirgacheffe beans, medium roast, notes of blueberry and jasmine.',
    price: 24.99,
    stock: 80,
    categoryId: 'food',
    images: ['https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=800&q=80'],
    sellerId: 'seed',
    status: 'active',
    rating: 4.9,
    reviewCount: 512,
  },
  {
    title: 'Raw Wildflower Honey 500g',
    description: 'Unfiltered raw honey from mountain wildflowers. Rich in antioxidants and enzymes.',
    price: 18.00,
    stock: 55,
    categoryId: 'food',
    images: ['https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=800&q=80'],
    sellerId: 'seed',
    status: 'active',
    rating: 4.8,
    reviewCount: 334,
  },
  {
    title: 'Premium Matcha Powder 100g',
    description: 'Ceremonial grade Japanese matcha from Uji, Kyoto. Vibrant green, smooth umami taste.',
    price: 32.00,
    stock: 45,
    categoryId: 'food',
    images: ['https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=800&q=80'],
    sellerId: 'seed',
    status: 'active',
    rating: 4.7,
    reviewCount: 198,
  },
  {
    title: 'Dark Chocolate Gift Box',
    description: 'Assorted 70–90% dark chocolate truffles, 24 pieces. Vegan, gluten-free, no palm oil.',
    price: 38.00,
    stock: 30,
    categoryId: 'food',
    images: ['https://images.unsplash.com/photo-1549007994-cb92caebd54b?w=800&q=80'],
    sellerId: 'seed',
    status: 'active',
    rating: 4.8,
    reviewCount: 421,
  },

  // 🛍️ Handmade & Creative
  {
    title: 'Hand-Poured Soy Candle',
    description: 'Natural soy wax candle with cotton wick, 50h burn time. Scents: lavender, cedar, vanilla.',
    price: 19.99,
    stock: 65,
    categoryId: 'handmade',
    images: ['https://images.unsplash.com/photo-1602607144535-11be3fe59c5e?w=800&q=80'],
    sellerId: 'seed',
    status: 'active',
    rating: 4.9,
    reviewCount: 607,
  },
  {
    title: 'Macramé Wall Hanging',
    description: 'Boho-style handwoven macramé wall art, 60×90cm, natural cotton rope on driftwood.',
    price: 55.00,
    stock: 15,
    categoryId: 'handmade',
    images: ['https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80'],
    sellerId: 'seed',
    status: 'active',
    rating: 4.7,
    reviewCount: 89,
  },
  {
    title: 'Handmade Leather Journal',
    description: 'A5 genuine leather journal with 200 pages of acid-free paper. Lay-flat binding.',
    price: 42.00,
    stock: 28,
    categoryId: 'handmade',
    images: ['https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=800&q=80'],
    sellerId: 'seed',
    status: 'active',
    rating: 4.8,
    reviewCount: 154,
  },
  {
    title: 'Watercolor Portrait Commission',
    description: 'Custom hand-painted watercolor portrait from your photo. A4 size, ships in 7–10 days.',
    price: 75.00,
    stock: 10,
    categoryId: 'handmade',
    images: ['https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=800&q=80'],
    sellerId: 'seed',
    status: 'active',
    rating: 5.0,
    reviewCount: 47,
  },
];

async function seed() {
  console.log('🌱 Seeding Firestore...\n');

  // Categories
  const catBatch = db.batch();
  for (const cat of categories) {
    catBatch.set(db.collection('categories').doc(cat.id), cat);
  }
  await catBatch.commit();
  console.log(`✅ ${categories.length} categories added`);

  // Products
  const prodBatch = db.batch();
  for (const product of products) {
    const ref = db.collection('products').doc();
    prodBatch.set(ref, {
      id: ref.id,
      ...product,
      attributes: {},
      createdAt: new Date().toISOString(),
    });
  }
  await prodBatch.commit();
  console.log(`✅ ${products.length} products added`);

  console.log('\n🎉 Done! Check your Firestore console.');
}

seed().catch(console.error);
