import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

if (!getApps().length) {
  initializeApp({ credential: cert({ projectId: process.env.FIREBASE_PROJECT_ID, clientEmail: process.env.FIREBASE_CLIENT_EMAIL, privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n') }) });
}
const db = getFirestore();

const extra = [
  // T-Shirts (like in photo 1)
  { title: 'BOSS Logo T-Shirt Black', description: 'BOSS regular-fit T-shirt in pure cotton. Large contrast BOSS logo print on chest. Crew neck, short sleeves. Iconic streetwear staple.', price: 79.00, stock: 60, images: ['https://images.unsplash.com/photo-1503341504253-dff4815485f1?w=800&q=80'] },
  { title: 'BOSS Logo T-Shirt White', description: 'BOSS regular-fit T-shirt in Supima cotton. Bold BOSS logo print. Crew neck, ribbed collar. Essential wardrobe piece.', price: 79.00, stock: 55, images: ['https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&q=80'] },
  { title: 'BOSS Logo T-Shirt Navy', description: 'BOSS slim-fit T-shirt in stretch cotton. Embossed BOSS logo. Crew neck, short sleeves. Available in navy blue.', price: 85.00, stock: 45, images: ['https://images.unsplash.com/photo-1503341504253-dff4815485f1?w=800&q=80'] },
  { title: 'BOSS Logo T-Shirt Grey Marl', description: 'BOSS relaxed-fit T-shirt in cotton-modal blend. Tonal BOSS logo. Soft grey marl, crew neck.', price: 89.00, stock: 40, images: ['https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&q=80'] },
  { title: 'BOSS Graphic Logo Tee Oversized', description: 'BOSS oversized T-shirt with large graphic logo. 100% organic cotton, dropped shoulders, boxy fit.', price: 95.00, stock: 35, images: ['https://images.unsplash.com/photo-1503341504253-dff4815485f1?w=800&q=80'] },

  // Zip Jackets / Track Tops (like in photo 2)
  { title: 'BOSS Zip-Up Track Jacket Black', description: 'BOSS slim-fit zip-up sweat jacket in stretch cotton. Stand collar, full-length zip, side pockets. Embroidered BOSS logo on chest. As seen in campaign.', price: 229.00, stock: 25, images: ['https://images.unsplash.com/photo-1544923246-77307dd654cb?w=800&q=80'] },
  { title: 'BOSS Zip-Up Track Jacket Navy', description: 'BOSS regular-fit zip-through sweatshirt. Funnel neck, raglan sleeves, ribbed cuffs. BOSS logo embroidery. Navy colourway.', price: 229.00, stock: 20, images: ['https://images.unsplash.com/photo-1556821840-3a63f15732ce?w=800&q=80'] },
  { title: 'BOSS Zip-Up Track Jacket Grey', description: 'BOSS slim-fit zip jacket in French terry. Stand collar, two side pockets, tonal BOSS logo. Versatile athleisure piece.', price: 219.00, stock: 22, images: ['https://images.unsplash.com/photo-1544923246-77307dd654cb?w=800&q=80'] },
  { title: 'BOSS Tracksuit Set Black', description: 'BOSS matching tracksuit: zip-up jacket + jogger trousers. Stretch cotton, embroidered logos. Complete athleisure look.', price: 389.00, stock: 15, images: ['https://images.unsplash.com/photo-1552902865-b72c031ac5ea?w=800&q=80'] },
  { title: 'BOSS Half-Zip Sweatshirt', description: 'BOSS slim-fit half-zip sweatshirt in cotton-blend. Ribbed collar, cuffs and hem. Embroidered BOSS logo at chest.', price: 179.00, stock: 28, images: ['https://images.unsplash.com/photo-1556821840-3a63f15732ce?w=800&q=80'] },

  // Caps (like in photo 3)
  { title: 'BOSS Cap Navy Logo', description: 'BOSS cotton-twill baseball cap. Embroidered BOSS logo on front panel. Adjustable strap, curved peak. As seen in campaign.', price: 69.00, stock: 50, images: ['https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=800&q=80'] },
  { title: 'BOSS Cap Black', description: 'BOSS structured 6-panel cap in cotton. Tonal embroidered BOSS logo. Adjustable snapback closure.', price: 65.00, stock: 55, images: ['https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=800&q=80'] },
  { title: 'BOSS Cap White', description: 'BOSS cotton baseball cap in white. Contrast BOSS logo embroidery. Pre-curved peak, adjustable strap.', price: 65.00, stock: 45, images: ['https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=800&q=80'] },
  { title: 'BOSS Bucket Hat', description: 'BOSS cotton bucket hat with all-over logo print. Wide brim, unstructured crown. Casual summer essential.', price: 79.00, stock: 30, images: ['https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=800&q=80'] },
  { title: 'BOSS Beanie Logo', description: 'BOSS ribbed knit beanie in wool blend. Embroidered BOSS logo. Fold-up cuff, one size fits all.', price: 59.00, stock: 40, images: ['https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=800&q=80'] },

  // Trousers / Jeans (like in photo 4 - Kaiton)
  { title: 'BOSS Kaiton Slim-Fit Trousers Black', description: 'BOSS Kaiton slim-fit trousers in High Motion stretch fabric. 4-way stretch, responsible cotton. Slim fit from hip to ankle. As seen in campaign.', price: 169.00, stock: 30, images: ['https://images.unsplash.com/photo-1594938298603-c8148c4b4d8a?w=800&q=80'] },
  { title: 'BOSS Kaiton Slim-Fit Trousers Navy', description: 'BOSS Kaiton slim-fit in High Motion stretch cotton. Flat front, belt loops, side and back pockets. Navy colourway.', price: 169.00, stock: 28, images: ['https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=800&q=80'] },
  { title: 'BOSS Kaiton Slim-Fit Trousers Khaki', description: 'BOSS Kaiton slim-fit chinos in stretch cotton. High Motion technology for all-day comfort. Khaki colourway.', price: 169.00, stock: 25, images: ['https://images.unsplash.com/photo-1594938298603-c8148c4b4d8a?w=800&q=80'] },
  { title: 'BOSS Delaware Slim-Fit Jeans Black', description: 'BOSS Delaware slim-fit jeans in stretch denim. Five-pocket design, BOSS logo patch. Black wash.', price: 189.00, stock: 35, images: ['https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=800&q=80'] },
  { title: 'BOSS Delaware Slim-Fit Jeans Blue', description: 'BOSS Delaware slim-fit jeans in comfort-stretch denim. Classic five-pocket styling. Mid-blue wash.', price: 189.00, stock: 32, images: ['https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=800&q=80'] },
  { title: 'BOSS Taber Tapered Jeans', description: 'BOSS Taber tapered-fit jeans in stretch denim. Slightly higher rise, tapered from thigh to ankle. Dark blue wash.', price: 199.00, stock: 20, images: ['https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=800&q=80'] },
  { title: 'BOSS Slim-Fit Suit Trousers Grey', description: 'BOSS slim-fit trousers in virgin wool. Flat front, side pockets, belt loops. Part of BOSS suit collection. Grey melange.', price: 249.00, stock: 15, images: ['https://images.unsplash.com/photo-1594938298603-c8148c4b4d8a?w=800&q=80'] },

  // Hoodies & Sweatshirts
  { title: 'BOSS Weedo Hoodie Black', description: 'BOSS regular-fit hoodie in French terry cotton. Drawstring hood, kangaroo pocket, embroidered BOSS logo. Essential piece.', price: 199.00, stock: 40, images: ['https://images.unsplash.com/photo-1556821840-3a63f15732ce?w=800&q=80'] },
  { title: 'BOSS Weedo Hoodie Grey', description: 'BOSS regular-fit hoodie in cotton-blend French terry. Adjustable hood, front pocket, ribbed trims. Grey marl.', price: 199.00, stock: 35, images: ['https://images.unsplash.com/photo-1556821840-3a63f15732ce?w=800&q=80'] },
  { title: 'BOSS Salbo Sweatshirt', description: 'BOSS slim-fit sweatshirt in stretch cotton. Crew neck, ribbed cuffs and hem. Embroidered BOSS logo at chest.', price: 159.00, stock: 30, images: ['https://images.unsplash.com/photo-1556821840-3a63f15732ce?w=800&q=80'] },

  // Shirts
  { title: 'BOSS Slim-Fit Shirt Blue Stripe', description: 'BOSS slim-fit shirt in pure cotton. Classic blue stripe pattern. Spread collar, single cuffs. Business casual essential.', price: 139.00, stock: 25, images: ['https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=800&q=80'] },
  { title: 'BOSS Slim-Fit Shirt Black', description: 'BOSS slim-fit shirt in easy-iron cotton. Spread collar, single cuffs, curved hem. Versatile black colourway.', price: 129.00, stock: 30, images: ['https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=800&q=80'] },
  { title: 'BOSS Casual Overshirt', description: 'BOSS relaxed-fit overshirt in cotton-linen blend. Chest pockets, button closure. Wear open as a light jacket.', price: 179.00, stock: 18, images: ['https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=800&q=80'] },

  // Polos
  { title: 'BOSS Pado Polo Black', description: 'BOSS slim-fit polo in Pima cotton piqué. Three-button placket, ribbed collar and cuffs. Embroidered BOSS logo. Black.', price: 119.00, stock: 45, images: ['https://images.unsplash.com/photo-1586363104862-3a5e2ab60d99?w=800&q=80'] },
  { title: 'BOSS Pado Polo White', description: 'BOSS slim-fit polo in Pima cotton piqué. Classic white. Three-button placket, embroidered logo at chest.', price: 119.00, stock: 40, images: ['https://images.unsplash.com/photo-1586363104862-3a5e2ab60d99?w=800&q=80'] },
  { title: 'BOSS Pado Polo Navy', description: 'BOSS slim-fit polo in stretch cotton piqué. Navy blue. Ribbed collar, embroidered BOSS logo.', price: 125.00, stock: 38, images: ['https://images.unsplash.com/photo-1586363104862-3a5e2ab60d99?w=800&q=80'] },
  { title: 'BOSS Paule Tech Polo', description: 'BOSS slim-fit polo in moisture-wicking tech fabric. Ideal for golf and sport. Embroidered logo, stretch fit.', price: 139.00, stock: 25, images: ['https://images.unsplash.com/photo-1586363104862-3a5e2ab60d99?w=800&q=80'] },

  // Jackets & Coats
  { title: 'BOSS Nolan Leather Jacket', description: 'BOSS slim-fit jacket in genuine nappa leather. Zip closure, side pockets, quilted lining. Signature BOSS hardware.', price: 795.00, stock: 8, images: ['https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800&q=80'] },
  { title: 'BOSS Overshirt Jacket', description: 'BOSS relaxed-fit overshirt jacket in heavy cotton. Chest and side pockets, button closure. Transitional season essential.', price: 249.00, stock: 15, images: ['https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=800&q=80'] },
  { title: 'BOSS Padded Jacket', description: 'BOSS slim-fit padded jacket with down filling. Stand collar, zip closure, logo patch. Lightweight warmth.', price: 349.00, stock: 12, images: ['https://images.unsplash.com/photo-1544923246-77307dd654cb?w=800&q=80'] },
  { title: 'BOSS Wool Coat Camel', description: 'BOSS slim-fit coat in wool-cashmere blend. Double-breasted, notch lapels, satin lining. Camel colourway.', price: 695.00, stock: 6, images: ['https://images.unsplash.com/photo-1539533018447-63fcce2678e3?w=800&q=80'] },

  // Suits
  { title: 'BOSS H-Huge Slim-Fit Suit Navy', description: 'BOSS H-Huge slim-fit suit in virgin wool. Jacket + trousers. Notch lapels, two-button closure. Navy blue. Business essential.', price: 895.00, stock: 5, images: ['https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=800&q=80'] },
  { title: 'BOSS H-Huge Slim-Fit Suit Charcoal', description: 'BOSS H-Huge slim-fit suit in stretch wool. Charcoal grey. Jacket + flat-front trousers. Ideal for business and formal occasions.', price: 895.00, stock: 5, images: ['https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=800&q=80'] },

  // Underwear / Loungewear
  { title: 'BOSS 3-Pack Logo Boxer Briefs', description: 'Pack of 3 BOSS boxer briefs in stretch cotton. Elasticated logo waistband. Essential everyday comfort.', price: 69.00, stock: 60, images: ['https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&q=80'] },
  { title: 'BOSS Loungewear Joggers', description: 'BOSS slim-fit jogger trousers in French terry. Elasticated logo waistband, zip pockets, tapered leg.', price: 129.00, stock: 30, images: ['https://images.unsplash.com/photo-1552902865-b72c031ac5ea?w=800&q=80'] },
];

async function seedExtra() {
  console.log('👔 Adding extra BOSS clothing...\n');
  const batch = db.batch();
  for (const item of extra) {
    const ref = db.collection('products').doc();
    batch.set(ref, {
      id: ref.id,
      ...item,
      categoryId: 'clothing',
      brand: 'BOSS',
      sellerId: 'seed',
      status: 'active',
      rating: Number((4.5 + Math.random() * 0.5).toFixed(1)),
      reviewCount: Math.floor(40 + Math.random() * 400),
      attributes: { brand: 'BOSS' },
      createdAt: new Date().toISOString(),
    });
  }
  await batch.commit();
  console.log(`✅ Added ${extra.length} extra BOSS items`);
  console.log('🎉 Done!');
}

seedExtra().catch(console.error);
