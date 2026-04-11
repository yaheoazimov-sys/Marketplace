import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

if (!getApps().length) {
  initializeApp({ credential: cert({ projectId: process.env.FIREBASE_PROJECT_ID, clientEmail: process.env.FIREBASE_CLIENT_EMAIL, privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n') }) });
}
const db = getFirestore();

// Hugo Boss real product lineup with authentic descriptions and pricing
const bossClothing = [
  { title: 'BOSS Slim-Fit Suit Jacket', description: 'BOSS slim-fit jacket in virgin wool. Notch lapels, two-button closure, chest welt pocket. Italian craftsmanship.', price: 595.00, stock: 12, images: ['https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=800&q=80'] },
  { title: 'BOSS Slim-Fit Suit Trousers', description: 'Matching slim-fit trousers in virgin wool. Flat front, side pockets, belt loops. Part of BOSS suit collection.', price: 295.00, stock: 15, images: ['https://images.unsplash.com/photo-1594938298603-c8148c4b4d8a?w=800&q=80'] },
  { title: 'BOSS Regular-Fit Oxford Shirt', description: 'BOSS regular-fit shirt in pure cotton Oxford weave. Button-down collar, chest pocket, curved hem.', price: 129.00, stock: 30, images: ['https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=800&q=80'] },
  { title: 'BOSS Slim-Fit Dress Shirt White', description: 'Classic BOSS slim-fit dress shirt in easy-iron cotton. Spread collar, French cuffs, mother-of-pearl buttons.', price: 149.00, stock: 25, images: ['https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&q=80'] },
  { title: 'BOSS Merino Wool Turtleneck', description: 'BOSS slim-fit turtleneck in fine merino wool. Ribbed collar, cuffs and hem. Signature embroidered logo.', price: 199.00, stock: 20, images: ['https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=800&q=80'] },
  { title: 'BOSS Leather Biker Jacket', description: 'BOSS biker jacket in genuine nappa leather. Asymmetric zip, quilted lining, silver-tone hardware.', price: 895.00, stock: 8, images: ['https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800&q=80'] },
  { title: 'BOSS Slim-Fit Chinos', description: 'BOSS slim-fit chinos in stretch cotton. Five-pocket styling, logo patch at back. Versatile smart-casual.', price: 169.00, stock: 35, images: ['https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=800&q=80'] },
  { title: 'BOSS Relaxed-Fit Jeans', description: 'BOSS relaxed-fit jeans in comfort-stretch denim. Five-pocket design, logo patch, slightly tapered leg.', price: 189.00, stock: 28, images: ['https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=800&q=80'] },
  { title: 'BOSS Zip-Up Hoodie', description: 'BOSS zip-up hoodie in French terry cotton. Drawstring hood, kangaroo pocket, embroidered logo.', price: 229.00, stock: 22, images: ['https://images.unsplash.com/photo-1556821840-3a63f15732ce?w=800&q=80'] },
  { title: 'BOSS Logo Polo Shirt', description: 'BOSS slim-fit polo in Pima cotton piqué. Three-button placket, ribbed collar and cuffs, embroidered logo.', price: 119.00, stock: 40, images: ['https://images.unsplash.com/photo-1586363104862-3a5e2ab60d99?w=800&q=80'] },
  { title: 'BOSS Wool-Blend Overcoat', description: 'BOSS slim-fit overcoat in wool-cashmere blend. Notch lapels, double-breasted, satin lining. Timeless elegance.', price: 795.00, stock: 6, images: ['https://images.unsplash.com/photo-1539533018447-63fcce2678e3?w=800&q=80'] },
  { title: 'BOSS Slim-Fit T-Shirt 3-Pack', description: 'Pack of 3 BOSS slim-fit T-shirts in Supima cotton. Crew neck, short sleeves, embroidered logo on chest.', price: 89.00, stock: 50, images: ['https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&q=80'] },
  { title: 'BOSS Tailored Waistcoat', description: 'BOSS slim-fit waistcoat in virgin wool. Five-button closure, welt pockets, adjustable back strap.', price: 249.00, stock: 10, images: ['https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=800&q=80'] },
  { title: 'BOSS Linen Blazer', description: 'BOSS regular-fit blazer in pure linen. Notch lapels, patch pockets, unlined for summer comfort.', price: 349.00, stock: 14, images: ['https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=800&q=80'] },
  { title: 'BOSS Swim Shorts', description: 'BOSS swim shorts with quick-dry fabric. Elasticated waistband, drawstring, side and back pockets.', price: 99.00, stock: 30, images: ['https://images.unsplash.com/photo-1591195853828-11db59a44f43?w=800&q=80'] },
  { title: 'BOSS Slim-Fit Tuxedo Jacket', description: 'BOSS slim-fit tuxedo jacket in stretch wool. Satin peak lapels, single-button closure, welt pockets.', price: 695.00, stock: 5, images: ['https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=800&q=80'] },
  { title: 'BOSS Puffer Jacket', description: 'BOSS regular-fit puffer jacket with down filling. Stand collar, zip closure, logo patch. Packable design.', price: 399.00, stock: 16, images: ['https://images.unsplash.com/photo-1544923246-77307dd654cb?w=800&q=80'] },
  { title: 'BOSS Knit Cardigan', description: 'BOSS regular-fit cardigan in merino wool. V-neck, button closure, ribbed trims, embroidered logo.', price: 249.00, stock: 18, images: ['https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=800&q=80'] },
  { title: 'BOSS Slim-Fit Shorts', description: 'BOSS slim-fit shorts in stretch cotton. Belt loops, zip fly, side and back pockets. Smart-casual style.', price: 109.00, stock: 25, images: ['https://images.unsplash.com/photo-1591195853828-11db59a44f43?w=800&q=80'] },
  { title: 'BOSS Graphic Print T-Shirt', description: 'BOSS relaxed-fit T-shirt with seasonal graphic print. 100% cotton, crew neck, dropped shoulders.', price: 79.00, stock: 35, images: ['https://images.unsplash.com/photo-1503341504253-dff4815485f1?w=800&q=80'] },
  { title: 'BOSS Slim-Fit Turtleneck Sweater', description: 'BOSS slim-fit sweater in cotton-silk blend. Ribbed turtleneck, long sleeves, embroidered logo at hem.', price: 219.00, stock: 20, images: ['https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=800&q=80'] },
  { title: 'BOSS Cargo Trousers', description: 'BOSS relaxed-fit cargo trousers in ripstop cotton. Multiple pockets, drawstring waist, tapered leg.', price: 199.00, stock: 22, images: ['https://images.unsplash.com/photo-1594938298603-c8148c4b4d8a?w=800&q=80'] },
  { title: 'BOSS Denim Jacket', description: 'BOSS regular-fit denim jacket in stretch cotton. Chest pockets, button closure, embroidered logo.', price: 249.00, stock: 18, images: ['https://images.unsplash.com/photo-1523205771623-e0faa4d2813d?w=800&q=80'] },
  { title: 'BOSS Slim-Fit Trench Coat', description: 'BOSS slim-fit trench coat in water-repellent cotton. Double-breasted, storm flap, removable belt.', price: 595.00, stock: 8, images: ['https://images.unsplash.com/photo-1539533018447-63fcce2678e3?w=800&q=80'] },
  { title: 'BOSS Loungewear Set', description: 'BOSS loungewear set: long-sleeve top + jogger pants in French terry. Embroidered logo, relaxed fit.', price: 179.00, stock: 20, images: ['https://images.unsplash.com/photo-1552902865-b72c031ac5ea?w=800&q=80'] },
  { title: 'BOSS Slim-Fit Linen Shirt', description: 'BOSS slim-fit shirt in pure linen. Spread collar, chest pocket, curved hem. Perfect for warm weather.', price: 139.00, stock: 28, images: ['https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=800&q=80'] },
  { title: 'BOSS Wool Turtleneck Coat', description: 'BOSS slim-fit coat in boiled wool. Funnel neck, concealed button closure, side pockets. Minimalist design.', price: 695.00, stock: 7, images: ['https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=800&q=80'] },
  { title: 'BOSS Slim-Fit Jogger Pants', description: 'BOSS slim-fit joggers in stretch cotton. Elasticated waistband, zip pockets, tapered leg, logo waistband.', price: 149.00, stock: 30, images: ['https://images.unsplash.com/photo-1552902865-b72c031ac5ea?w=800&q=80'] },
  { title: 'BOSS Bomber Jacket', description: 'BOSS slim-fit bomber in satin-finish fabric. Ribbed collar, cuffs and hem, zip closure, logo patch.', price: 329.00, stock: 12, images: ['https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=800&q=80'] },
  { title: 'BOSS Slim-Fit Suit (2-Piece)', description: 'Complete BOSS slim-fit suit in virgin wool. Jacket + trousers. Notch lapels, flat-front trousers. Business essential.', price: 849.00, stock: 6, images: ['https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=800&q=80'] },
];

async function seedBoss() {
  console.log('👔 Updating clothing to BOSS brand...\n');

  // 1. Delete all existing clothing products
  const snapshot = await db.collection('products').where('categoryId', '==', 'clothing').get();
  if (snapshot.docs.length > 0) {
    const deleteBatch = db.batch();
    snapshot.docs.forEach(doc => deleteBatch.delete(doc.ref));
    await deleteBatch.commit();
    console.log(`🗑️  Deleted ${snapshot.docs.length} old clothing items`);
  }

  // 2. Add BOSS products
  const batch = db.batch();
  for (const item of bossClothing) {
    const ref = db.collection('products').doc();
    batch.set(ref, {
      id: ref.id,
      ...item,
      categoryId: 'clothing',
      brand: 'BOSS',
      sellerId: 'seed',
      status: 'active',
      rating: Number((4.5 + Math.random() * 0.5).toFixed(1)),
      reviewCount: Math.floor(50 + Math.random() * 300),
      attributes: { brand: 'BOSS', material: 'Premium' },
      createdAt: new Date().toISOString(),
    });
  }
  await batch.commit();
  console.log(`✅ Added ${bossClothing.length} BOSS clothing items`);
  console.log('\n🎉 Done! All clothing is now BOSS brand.');
}

seedBoss().catch(console.error);
