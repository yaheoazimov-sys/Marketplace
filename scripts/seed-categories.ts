import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

if (!getApps().length) {
  initializeApp({ credential: cert({ projectId: process.env.FIREBASE_PROJECT_ID, clientEmail: process.env.FIREBASE_CLIENT_EMAIL, privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n') }) });
}
const db = getFirestore();

// id = slug (used as Firestore doc ID for easy lookup)
const categories = [
  // ── Root categories ──
  { id: 'clothing',     name: 'Clothing',            slug: 'clothing',     parentId: null, icon: '👔', order: 1 },
  { id: 'electronics',  name: 'Electronics',          slug: 'electronics',  parentId: null, icon: '💻', order: 2 },
  { id: 'fashion',      name: 'Fashion & Accessories', slug: 'fashion',      parentId: null, icon: '👜', order: 3 },
  { id: 'cars',         name: 'Cars & Auto',           slug: 'cars',         parentId: null, icon: '🚗', order: 4 },
  { id: 'sports',       name: 'Sports & Outdoors',     slug: 'sports',       parentId: null, icon: '⚽', order: 5 },
  { id: 'home',         name: 'Home & Garden',         slug: 'home',         parentId: null, icon: '🏠', order: 6 },
  { id: 'food',         name: 'Food & Drinks',         slug: 'food',         parentId: null, icon: '🍔', order: 7 },
  { id: 'handmade',     name: 'Handmade & Creative',   slug: 'handmade',     parentId: null, icon: '🛍️', order: 8 },

  // ── Clothing → subcategories ──
  { id: 'clothing-men',     name: "Men's Clothing",   slug: 'clothing-men',     parentId: 'clothing', icon: '🧥', order: 1 },
  { id: 'clothing-women',   name: "Women's Clothing", slug: 'clothing-women',   parentId: 'clothing', icon: '👗', order: 2 },
  { id: 'clothing-kids',    name: "Kids' Clothing",   slug: 'clothing-kids',    parentId: 'clothing', icon: '🧒', order: 3 },
  { id: 'clothing-sport',   name: 'Sportswear',       slug: 'clothing-sport',   parentId: 'clothing', icon: '🏃', order: 4 },

  // ── Men's Clothing → sub-subcategories ──
  { id: 'men-suits',    name: 'Suits & Blazers',  slug: 'men-suits',    parentId: 'clothing-men', icon: null, order: 1 },
  { id: 'men-shirts',   name: 'Shirts',           slug: 'men-shirts',   parentId: 'clothing-men', icon: null, order: 2 },
  { id: 'men-tshirts',  name: 'T-Shirts & Polos', slug: 'men-tshirts',  parentId: 'clothing-men', icon: null, order: 3 },
  { id: 'men-trousers', name: 'Trousers & Jeans', slug: 'men-trousers', parentId: 'clothing-men', icon: null, order: 4 },
  { id: 'men-jackets',  name: 'Jackets & Coats',  slug: 'men-jackets',  parentId: 'clothing-men', icon: null, order: 5 },
  { id: 'men-hoodies',  name: 'Hoodies & Sweatshirts', slug: 'men-hoodies', parentId: 'clothing-men', icon: null, order: 6 },

  // ── Women's Clothing → sub-subcategories ──
  { id: 'women-dresses',  name: 'Dresses',          slug: 'women-dresses',  parentId: 'clothing-women', icon: null, order: 1 },
  { id: 'women-tops',     name: 'Tops & Blouses',   slug: 'women-tops',     parentId: 'clothing-women', icon: null, order: 2 },
  { id: 'women-trousers', name: 'Trousers & Jeans', slug: 'women-trousers', parentId: 'clothing-women', icon: null, order: 3 },
  { id: 'women-skirts',   name: 'Skirts',           slug: 'women-skirts',   parentId: 'clothing-women', icon: null, order: 4 },
  { id: 'women-jackets',  name: 'Jackets & Coats',  slug: 'women-jackets',  parentId: 'clothing-women', icon: null, order: 5 },

  // ── Electronics → subcategories ──
  { id: 'electronics-phones',    name: 'Phones & Tablets',  slug: 'electronics-phones',    parentId: 'electronics', icon: '📱', order: 1 },
  { id: 'electronics-computers', name: 'Computers & Laptops', slug: 'electronics-computers', parentId: 'electronics', icon: '🖥️', order: 2 },
  { id: 'electronics-audio',     name: 'Audio & Headphones', slug: 'electronics-audio',     parentId: 'electronics', icon: '🎧', order: 3 },
  { id: 'electronics-cameras',   name: 'Cameras & Drones',   slug: 'electronics-cameras',   parentId: 'electronics', icon: '📷', order: 4 },
  { id: 'electronics-gaming',    name: 'Gaming',             slug: 'electronics-gaming',    parentId: 'electronics', icon: '🎮', order: 5 },
  { id: 'electronics-smarthome', name: 'Smart Home',         slug: 'electronics-smarthome', parentId: 'electronics', icon: '🏡', order: 6 },
  { id: 'electronics-wearables', name: 'Wearables',          slug: 'electronics-wearables', parentId: 'electronics', icon: '⌚', order: 7 },

  // ── Fashion & Accessories → subcategories ──
  { id: 'fashion-bags',     name: 'Bags & Wallets',  slug: 'fashion-bags',     parentId: 'fashion', icon: '👜', order: 1 },
  { id: 'fashion-jewelry',  name: 'Jewelry',         slug: 'fashion-jewelry',  parentId: 'fashion', icon: '💍', order: 2 },
  { id: 'fashion-watches',  name: 'Watches',         slug: 'fashion-watches',  parentId: 'fashion', icon: '⌚', order: 3 },
  { id: 'fashion-sunglasses', name: 'Sunglasses',    slug: 'fashion-sunglasses', parentId: 'fashion', icon: '🕶️', order: 4 },
  { id: 'fashion-hats',     name: 'Hats & Caps',     slug: 'fashion-hats',     parentId: 'fashion', icon: '🧢', order: 5 },
  { id: 'fashion-belts',    name: 'Belts & Scarves', slug: 'fashion-belts',    parentId: 'fashion', icon: null, order: 6 },

  // ── Cars & Auto → subcategories ──
  { id: 'cars-accessories', name: 'Car Accessories',  slug: 'cars-accessories', parentId: 'cars', icon: '🔧', order: 1 },
  { id: 'cars-electronics', name: 'Car Electronics',  slug: 'cars-electronics', parentId: 'cars', icon: '📡', order: 2 },
  { id: 'cars-care',        name: 'Car Care',         slug: 'cars-care',        parentId: 'cars', icon: '🧽', order: 3 },
  { id: 'cars-parts',       name: 'Parts & Tools',    slug: 'cars-parts',       parentId: 'cars', icon: '⚙️', order: 4 },

  // ── Sports → subcategories ──
  { id: 'sports-fitness',   name: 'Fitness & Gym',   slug: 'sports-fitness',   parentId: 'sports', icon: '🏋️', order: 1 },
  { id: 'sports-running',   name: 'Running',         slug: 'sports-running',   parentId: 'sports', icon: '🏃', order: 2 },
  { id: 'sports-outdoor',   name: 'Outdoor & Hiking', slug: 'sports-outdoor',  parentId: 'sports', icon: '🏕️', order: 3 },
  { id: 'sports-team',      name: 'Team Sports',     slug: 'sports-team',      parentId: 'sports', icon: '⚽', order: 4 },
  { id: 'sports-yoga',      name: 'Yoga & Pilates',  slug: 'sports-yoga',      parentId: 'sports', icon: '🧘', order: 5 },

  // ── Home → subcategories ──
  { id: 'home-furniture',   name: 'Furniture',       slug: 'home-furniture',   parentId: 'home', icon: '🛋️', order: 1 },
  { id: 'home-kitchen',     name: 'Kitchen',         slug: 'home-kitchen',     parentId: 'home', icon: '🍳', order: 2 },
  { id: 'home-bedding',     name: 'Bedding & Bath',  slug: 'home-bedding',     parentId: 'home', icon: '🛏️', order: 3 },
  { id: 'home-decor',       name: 'Decor & Lighting', slug: 'home-decor',      parentId: 'home', icon: '🕯️', order: 4 },
  { id: 'home-garden',      name: 'Garden & Tools',  slug: 'home-garden',      parentId: 'home', icon: '🌿', order: 5 },

  // ── Food → subcategories ──
  { id: 'food-coffee',      name: 'Coffee & Tea',    slug: 'food-coffee',      parentId: 'food', icon: '☕', order: 1 },
  { id: 'food-snacks',      name: 'Snacks & Sweets', slug: 'food-snacks',      parentId: 'food', icon: '🍫', order: 2 },
  { id: 'food-organic',     name: 'Organic & Health', slug: 'food-organic',    parentId: 'food', icon: '🥗', order: 3 },
  { id: 'food-drinks',      name: 'Drinks',          slug: 'food-drinks',      parentId: 'food', icon: '🥤', order: 4 },

  // ── Handmade → subcategories ──
  { id: 'handmade-art',     name: 'Art & Prints',    slug: 'handmade-art',     parentId: 'handmade', icon: '🎨', order: 1 },
  { id: 'handmade-candles', name: 'Candles & Soaps', slug: 'handmade-candles', parentId: 'handmade', icon: '🕯️', order: 2 },
  { id: 'handmade-jewelry', name: 'Handmade Jewelry', slug: 'handmade-jewelry', parentId: 'handmade', icon: '💎', order: 3 },
  { id: 'handmade-home',    name: 'Home Decor',      slug: 'handmade-home',    parentId: 'handmade', icon: '🏺', order: 4 },
];

async function seed() {
  console.log('🌳 Seeding tree categories...\n');
  const batch = db.batch();
  for (const cat of categories) {
    batch.set(db.collection('categories').doc(cat.id), cat);
  }
  await batch.commit();
  console.log(`✅ ${categories.length} categories seeded`);
  console.log('\nTree structure:');
  const roots = categories.filter(c => !c.parentId);
  for (const root of roots) {
    console.log(`  ${root.icon || '•'} ${root.name}`);
    const children = categories.filter(c => c.parentId === root.id);
    for (const child of children) {
      console.log(`    ├─ ${child.icon || '•'} ${child.name}`);
      const grandchildren = categories.filter(c => c.parentId === child.id);
      for (const gc of grandchildren) {
        console.log(`    │   └─ ${gc.name}`);
      }
    }
  }
}

seed().catch(console.error);
