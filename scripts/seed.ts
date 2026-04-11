import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

if (!getApps().length) {
  initializeApp({ credential: cert({ projectId: process.env.FIREBASE_PROJECT_ID, clientEmail: process.env.FIREBASE_CLIENT_EMAIL, privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n') }) });
}
const db = getFirestore();

const categories = [
  { id: 'electronics', name: 'Electronics', slug: 'electronics', parentId: null },
  { id: 'clothing', name: 'Clothing', slug: 'clothing', parentId: null },
  { id: 'fashion', name: 'Fashion & Accessories', slug: 'fashion', parentId: null },
  { id: 'food', name: 'Food & Drinks', slug: 'food', parentId: null },
  { id: 'handmade', name: 'Handmade & Creative', slug: 'handmade', parentId: null },
  { id: 'home', name: 'Home & Garden', slug: 'home', parentId: null },
  { id: 'sports', name: 'Sports', slug: 'sports', parentId: null },
  { id: 'cars', name: 'Cars & Auto', slug: 'cars', parentId: null },
];

const S = 'seed';
const A = 'active';

const products: any[] = [
  // ── ELECTRONICS (30) ──
  { title: 'Premium Wireless Headphones', description: 'Over-ear ANC, 30h battery, Hi-Res Audio.', price: 299.99, stock: 15, categoryId: 'electronics', images: ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80'], rating: 4.8, reviewCount: 124, sellerId: S, status: A },
  { title: 'Mechanical Keyboard Pro', description: 'TKL Cherry MX, RGB backlight, aluminum frame.', price: 149.00, stock: 30, categoryId: 'electronics', images: ['https://images.unsplash.com/photo-1595225476474-87563907a212?w=800&q=80'], rating: 4.6, reviewCount: 89, sellerId: S, status: A },
  { title: '4K Ultra Monitor 27"', description: 'IPS 4K 144Hz HDR400, USB-C 65W.', price: 449.00, stock: 8, categoryId: 'electronics', images: ['https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=800&q=80'], rating: 4.7, reviewCount: 56, sellerId: S, status: A },
  { title: 'Smart Home Speaker', description: 'Voice-controlled 360° sound, smart home hub.', price: 89.99, stock: 25, categoryId: 'electronics', images: ['https://images.unsplash.com/photo-1589003077984-894e133dabab?w=800&q=80'], rating: 4.4, reviewCount: 210, sellerId: S, status: A },
  { title: 'Wireless Charging Pad 15W', description: 'Qi fast charger, slim non-slip surface.', price: 29.99, stock: 60, categoryId: 'electronics', images: ['https://images.unsplash.com/photo-1591370874773-6702e8f12fd8?w=800&q=80'], rating: 4.5, reviewCount: 231, sellerId: S, status: A },
  { title: 'Noise-Cancelling Earbuds', description: 'True wireless ANC, 8h + 24h case, IPX5.', price: 179.00, stock: 20, categoryId: 'electronics', images: ['https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=800&q=80'], rating: 4.7, reviewCount: 312, sellerId: S, status: A },
  { title: 'Portable SSD 1TB', description: 'USB-C 1050MB/s, shock-resistant, pocket-sized.', price: 109.00, stock: 35, categoryId: 'electronics', images: ['https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=800&q=80'], rating: 4.8, reviewCount: 178, sellerId: S, status: A },
  { title: 'Smart Watch Series X', description: 'AMOLED GPS health tracking, 7-day battery.', price: 249.00, stock: 18, categoryId: 'electronics', images: ['https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80'], rating: 4.6, reviewCount: 445, sellerId: S, status: A },
  { title: 'Webcam 4K Pro', description: '4K 30fps, ring light, AI auto-framing, USB-C.', price: 129.00, stock: 22, categoryId: 'electronics', images: ['https://images.unsplash.com/photo-1587826080692-f439cd0b70da?w=800&q=80'], rating: 4.5, reviewCount: 98, sellerId: S, status: A },
  { title: 'Gaming Mouse RGB', description: '25600 DPI, 11 buttons, 70h wireless battery.', price: 79.99, stock: 45, categoryId: 'electronics', images: ['https://images.unsplash.com/photo-1527814050087-3793815479db?w=800&q=80'], rating: 4.7, reviewCount: 267, sellerId: S, status: A },
  { title: 'USB-C Hub 10-in-1', description: '4K HDMI, 100W PD, SD, 3xUSB-A, Ethernet.', price: 59.99, stock: 50, categoryId: 'electronics', images: ['https://images.unsplash.com/photo-1625842268584-8f3296236761?w=800&q=80'], rating: 4.6, reviewCount: 189, sellerId: S, status: A },
  { title: 'Tablet 11" Pro', description: '120Hz OLED, M2 chip, 256GB, Pencil support.', price: 799.00, stock: 10, categoryId: 'electronics', images: ['https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=800&q=80'], rating: 4.9, reviewCount: 334, sellerId: S, status: A },
  { title: 'Bluetooth Speaker Waterproof', description: 'IP67, 360° sound, 24h battery, powerbank.', price: 69.99, stock: 40, categoryId: 'electronics', images: ['https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=800&q=80'], rating: 4.5, reviewCount: 156, sellerId: S, status: A },
  { title: 'Drone Mini 4K', description: '4K stabilized, 30min flight, obstacle avoidance.', price: 349.00, stock: 7, categoryId: 'electronics', images: ['https://images.unsplash.com/photo-1473968512647-3e447244af8f?w=800&q=80'], rating: 4.7, reviewCount: 88, sellerId: S, status: A },
  { title: 'E-Reader 7"', description: '300ppi glare-free, 6-week battery, waterproof.', price: 139.00, stock: 28, categoryId: 'electronics', images: ['https://images.unsplash.com/photo-1512820790803-83ca734da794?w=800&q=80'], rating: 4.8, reviewCount: 421, sellerId: S, status: A },
  { title: 'Action Camera 5K', description: '5K HyperSmooth, waterproof 10m, voice control.', price: 399.00, stock: 12, categoryId: 'electronics', images: ['https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=800&q=80'], rating: 4.8, reviewCount: 203, sellerId: S, status: A },
  { title: 'Laptop Stand Aluminum', description: '6-angle adjustable, foldable, fits 10–17".', price: 45.00, stock: 55, categoryId: 'electronics', images: ['https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=800&q=80'], rating: 4.7, reviewCount: 312, sellerId: S, status: A },
  { title: 'Portable Projector 1080p', description: '800 ANSI lumens, Android built-in, 3h battery.', price: 299.00, stock: 9, categoryId: 'electronics', images: ['https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=800&q=80'], rating: 4.5, reviewCount: 92, sellerId: S, status: A },
  { title: 'VR Headset Standalone', description: '4K per eye, 120Hz, hand tracking, 128GB.', price: 499.00, stock: 6, categoryId: 'electronics', images: ['https://images.unsplash.com/photo-1622979135225-d2ba269cf1ac?w=800&q=80'], rating: 4.7, reviewCount: 178, sellerId: S, status: A },
  { title: 'Smart Robot Vacuum', description: 'LiDAR mapping, 4000Pa, auto-empty base.', price: 449.00, stock: 8, categoryId: 'electronics', images: ['https://images.unsplash.com/photo-1558317374-067fb5f30001?w=800&q=80'], rating: 4.8, reviewCount: 267, sellerId: S, status: A },
  { title: 'Mirrorless Camera Kit', description: '24MP APS-C, 4K, 18-55mm lens, IBIS.', price: 899.00, stock: 5, categoryId: 'electronics', images: ['https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800&q=80'], rating: 4.9, reviewCount: 134, sellerId: S, status: A },
  { title: 'Gaming Headset 7.1', description: 'Virtual 7.1 surround, detachable mic, USB.', price: 89.99, stock: 25, categoryId: 'electronics', images: ['https://images.unsplash.com/photo-1599669454699-248893623440?w=800&q=80'], rating: 4.5, reviewCount: 312, sellerId: S, status: A },
  { title: 'Smart Air Purifier', description: 'HEPA H13, 60m², AQI display, 22dB quiet.', price: 199.00, stock: 14, categoryId: 'electronics', images: ['https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=800&q=80'], rating: 4.7, reviewCount: 98, sellerId: S, status: A },
  { title: 'Portable Power Bank 20000mAh', description: '65W PD, charges laptop, 3 ports, LED display.', price: 49.99, stock: 60, categoryId: 'electronics', images: ['https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=800&q=80'], rating: 4.7, reviewCount: 445, sellerId: S, status: A },
  { title: 'LED Desk Lamp Smart', description: 'Wireless charging base, 5 color temps, dimmer.', price: 55.00, stock: 35, categoryId: 'electronics', images: ['https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=800&q=80'], rating: 4.6, reviewCount: 189, sellerId: S, status: A },
  { title: 'Smart Doorbell Camera', description: '2K HDR, two-way audio, motion zones, Alexa.', price: 99.00, stock: 18, categoryId: 'electronics', images: ['https://images.unsplash.com/photo-1558002038-1055907df827?w=800&q=80'], rating: 4.4, reviewCount: 145, sellerId: S, status: A },
  { title: 'Smart Scale Body Composition', description: '13 body metrics, Bluetooth, app sync.', price: 39.99, stock: 45, categoryId: 'electronics', images: ['https://images.unsplash.com/photo-1576678927484-cc907957088c?w=800&q=80'], rating: 4.5, reviewCount: 234, sellerId: S, status: A },
  { title: 'Smart Thermostat', description: 'AI learning, energy saving, OLED display.', price: 149.00, stock: 20, categoryId: 'electronics', images: ['https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80'], rating: 4.6, reviewCount: 77, sellerId: S, status: A },
  { title: 'Foldable Keyboard Bluetooth', description: 'Full-size, 3 devices, 3-month battery.', price: 69.99, stock: 30, categoryId: 'electronics', images: ['https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800&q=80'], rating: 4.4, reviewCount: 156, sellerId: S, status: A },
  { title: 'Smart Plug Wi-Fi 4-Pack', description: 'Energy monitoring, schedules, voice control.', price: 34.99, stock: 70, categoryId: 'electronics', images: ['https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80'], rating: 4.5, reviewCount: 389, sellerId: S, status: A },

  // ── CLOTHING (30) ──
  { title: 'Oversized Linen Shirt', description: '100% linen, relaxed fit, 5 neutral tones.', price: 59.00, stock: 40, categoryId: 'clothing', images: ['https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=800&q=80'], rating: 4.6, reviewCount: 143, sellerId: S, status: A },
  { title: 'Classic White T-Shirt', description: '200gsm Pima cotton, pre-shrunk, unisex.', price: 29.00, stock: 100, categoryId: 'clothing', images: ['https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&q=80'], rating: 4.7, reviewCount: 567, sellerId: S, status: A },
  { title: 'Slim Fit Chinos', description: 'Stretch cotton, 4-way flex, 6 colors.', price: 69.00, stock: 55, categoryId: 'clothing', images: ['https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=800&q=80'], rating: 4.5, reviewCount: 234, sellerId: S, status: A },
  { title: 'Merino Wool Sweater', description: '17.5 micron merino, anti-itch, temp regulating.', price: 119.00, stock: 25, categoryId: 'clothing', images: ['https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=800&q=80'], rating: 4.8, reviewCount: 189, sellerId: S, status: A },
  { title: 'Leather Biker Jacket', description: 'Full-grain cowhide, YKK zippers, quilted lining.', price: 349.00, stock: 10, categoryId: 'clothing', images: ['https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800&q=80'], rating: 4.9, reviewCount: 78, sellerId: S, status: A },
  { title: 'Floral Midi Dress', description: 'Viscose floral print, adjustable straps, lined.', price: 79.00, stock: 35, categoryId: 'clothing', images: ['https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=800&q=80'], rating: 4.6, reviewCount: 312, sellerId: S, status: A },
  { title: 'Denim Jacket Vintage', description: 'Washed denim, relaxed fit, chest pockets.', price: 89.00, stock: 30, categoryId: 'clothing', images: ['https://images.unsplash.com/photo-1523205771623-e0faa4d2813d?w=800&q=80'], rating: 4.7, reviewCount: 198, sellerId: S, status: A },
  { title: 'Jogger Pants Fleece', description: 'Heavyweight fleece, tapered fit, zip pockets.', price: 55.00, stock: 60, categoryId: 'clothing', images: ['https://images.unsplash.com/photo-1552902865-b72c031ac5ea?w=800&q=80'], rating: 4.5, reviewCount: 445, sellerId: S, status: A },
  { title: 'Turtleneck Ribbed Knit', description: 'Ribbed turtleneck, 8 colors, slim fit.', price: 45.00, stock: 50, categoryId: 'clothing', images: ['https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=800&q=80'], rating: 4.6, reviewCount: 267, sellerId: S, status: A },
  { title: 'Silk Blouse', description: '100% mulberry silk, relaxed fit, 6 colors.', price: 129.00, stock: 20, categoryId: 'clothing', images: ['https://images.unsplash.com/photo-1485462537746-965f33f7f6a7?w=800&q=80'], rating: 4.7, reviewCount: 134, sellerId: S, status: A },
  { title: 'Hoodie Heavyweight 450gsm', description: 'French terry, kangaroo pocket, unisex.', price: 79.00, stock: 70, categoryId: 'clothing', images: ['https://images.unsplash.com/photo-1556821840-3a63f15732ce?w=800&q=80'], rating: 4.8, reviewCount: 623, sellerId: S, status: A },
  { title: 'Pleated Trousers', description: 'High-waist wool blend, tapered leg.', price: 99.00, stock: 25, categoryId: 'clothing', images: ['https://images.unsplash.com/photo-1594938298603-c8148c4b4d8a?w=800&q=80'], rating: 4.6, reviewCount: 89, sellerId: S, status: A },
  { title: 'Bomber Jacket Satin', description: 'Satin bomber, ribbed cuffs, embroidered back.', price: 109.00, stock: 18, categoryId: 'clothing', images: ['https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=800&q=80'], rating: 4.7, reviewCount: 156, sellerId: S, status: A },
  { title: 'Oxford Button-Down Shirt', description: 'Classic Oxford weave, button-down collar.', price: 65.00, stock: 45, categoryId: 'clothing', images: ['https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=800&q=80'], rating: 4.6, reviewCount: 178, sellerId: S, status: A },
  { title: 'Wide-Leg Jeans', description: 'High-rise, 100% organic cotton, raw hem.', price: 95.00, stock: 30, categoryId: 'clothing', images: ['https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=800&q=80'], rating: 4.7, reviewCount: 289, sellerId: S, status: A },
  { title: 'Polo Shirt Pique', description: 'Classic pique polo, 3-button placket, 10 colors.', price: 45.00, stock: 80, categoryId: 'clothing', images: ['https://images.unsplash.com/photo-1586363104862-3a5e2ab60d99?w=800&q=80'], rating: 4.5, reviewCount: 334, sellerId: S, status: A },
  { title: 'Trench Coat Classic', description: 'Double-breasted, water-repellent, removable lining.', price: 249.00, stock: 12, categoryId: 'clothing', images: ['https://images.unsplash.com/photo-1539533018447-63fcce2678e3?w=800&q=80'], rating: 4.8, reviewCount: 67, sellerId: S, status: A },
  { title: 'Crop Top Ribbed', description: 'Stretch ribbed, square neck, 12 colors.', price: 22.00, stock: 90, categoryId: 'clothing', images: ['https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=800&q=80'], rating: 4.6, reviewCount: 512, sellerId: S, status: A },
  { title: 'Parka Winter Jacket', description: 'Waterproof, -20°C rated, faux fur hood.', price: 199.00, stock: 15, categoryId: 'clothing', images: ['https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=800&q=80'], rating: 4.8, reviewCount: 234, sellerId: S, status: A },
  { title: 'Graphic Tee Vintage', description: 'Washed cotton, oversized, 8 designs.', price: 35.00, stock: 75, categoryId: 'clothing', images: ['https://images.unsplash.com/photo-1503341504253-dff4815485f1?w=800&q=80'], rating: 4.6, reviewCount: 389, sellerId: S, status: A },
  { title: 'Blazer Unstructured', description: 'Soft linen blend blazer, patch pockets.', price: 159.00, stock: 18, categoryId: 'clothing', images: ['https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=800&q=80'], rating: 4.7, reviewCount: 98, sellerId: S, status: A },
  { title: 'Knit Cardigan Oversized', description: 'Chunky knit, open front, 4 colors.', price: 89.00, stock: 22, categoryId: 'clothing', images: ['https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=800&q=80'], rating: 4.7, reviewCount: 278, sellerId: S, status: A },
  { title: 'Maxi Dress Boho', description: 'Flowy V-neck maxi, adjustable tie waist.', price: 85.00, stock: 25, categoryId: 'clothing', images: ['https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=800&q=80'], rating: 4.6, reviewCount: 223, sellerId: S, status: A },
  { title: 'Thermal Base Layer Set', description: 'Merino wool 200gsm top + bottom, odor-free.', price: 139.00, stock: 20, categoryId: 'clothing', images: ['https://images.unsplash.com/photo-1556821840-3a63f15732ce?w=800&q=80'], rating: 4.8, reviewCount: 89, sellerId: S, status: A },
  { title: 'Puffer Vest Down', description: '700-fill down vest, packable, 5 colors.', price: 89.00, stock: 22, categoryId: 'clothing', images: ['https://images.unsplash.com/photo-1544923246-77307dd654cb?w=800&q=80'], rating: 4.5, reviewCount: 112, sellerId: S, status: A },
  { title: 'Swimsuit One-Piece', description: 'UPF 50+, adjustable straps, 6 prints.', price: 65.00, stock: 28, categoryId: 'clothing', images: ['https://images.unsplash.com/photo-1570976447640-ac859083963f?w=800&q=80'], rating: 4.5, reviewCount: 167, sellerId: S, status: A },
  { title: 'Cargo Shorts Ripstop', description: '6-pocket, UPF 50+, quick-dry fabric.', price: 49.00, stock: 45, categoryId: 'clothing', images: ['https://images.unsplash.com/photo-1591195853828-11db59a44f43?w=800&q=80'], rating: 4.4, reviewCount: 178, sellerId: S, status: A },
  { title: 'Wrap Skirt Midi', description: 'Adjustable wrap, crinkle fabric, 4 prints.', price: 55.00, stock: 40, categoryId: 'clothing', images: ['https://images.unsplash.com/photo-1583496661160-fb5886a0aaaa?w=800&q=80'], rating: 4.5, reviewCount: 201, sellerId: S, status: A },
  { title: 'Linen Trousers Relaxed', description: 'Elastic waist, side pockets, 4 colors.', price: 69.00, stock: 35, categoryId: 'clothing', images: ['https://images.unsplash.com/photo-1594938298603-c8148c4b4d8a?w=800&q=80'], rating: 4.5, reviewCount: 145, sellerId: S, status: A },
  { title: 'Fleece Zip-Up Jacket', description: 'Anti-pill fleece, full zip, 2 pockets, unisex.', price: 75.00, stock: 40, categoryId: 'clothing', images: ['https://images.unsplash.com/photo-1544923246-77307dd654cb?w=800&q=80'], rating: 4.6, reviewCount: 203, sellerId: S, status: A },

  // ── CARS & AUTO (30) ──
  { title: 'Car Phone Mount Magnetic', description: 'MagSafe-compatible dashboard mount, 360° rotation.', price: 24.99, stock: 80, categoryId: 'cars', images: ['https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=800&q=80'], rating: 4.6, reviewCount: 445, sellerId: S, status: A },
  { title: 'Dash Cam 4K Dual', description: 'Front + rear 4K, night vision, GPS, parking mode.', price: 149.00, stock: 25, categoryId: 'cars', images: ['https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80'], rating: 4.7, reviewCount: 312, sellerId: S, status: A },
  { title: 'Car Vacuum Cleaner', description: '12V 150W, HEPA filter, 5m cord, wet & dry.', price: 39.99, stock: 50, categoryId: 'cars', images: ['https://images.unsplash.com/photo-1558317374-067fb5f30001?w=800&q=80'], rating: 4.5, reviewCount: 267, sellerId: S, status: A },
  { title: 'Tire Inflator Portable', description: 'Digital, 150PSI, auto-stop, LED light, USB-C charge.', price: 49.99, stock: 40, categoryId: 'cars', images: ['https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80'], rating: 4.8, reviewCount: 534, sellerId: S, status: A },
  { title: 'Car Jump Starter 2000A', description: '2000A peak, 20000mAh, works on 8L gas / 6L diesel.', price: 89.99, stock: 20, categoryId: 'cars', images: ['https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=800&q=80'], rating: 4.9, reviewCount: 289, sellerId: S, status: A },
  { title: 'Seat Cover Set Universal', description: 'Full set 9pcs, breathable mesh, fits most cars.', price: 59.99, stock: 35, categoryId: 'cars', images: ['https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800&q=80'], rating: 4.4, reviewCount: 178, sellerId: S, status: A },
  { title: 'Car Air Freshener Vent', description: 'Aromatherapy vent clip, 30-day fragrance, 6 scents.', price: 12.99, stock: 120, categoryId: 'cars', images: ['https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=800&q=80'], rating: 4.3, reviewCount: 623, sellerId: S, status: A },
  { title: 'OBD2 Bluetooth Scanner', description: 'Reads all fault codes, live data, iOS & Android.', price: 34.99, stock: 45, categoryId: 'cars', images: ['https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80'], rating: 4.6, reviewCount: 389, sellerId: S, status: A },
  { title: 'Steering Wheel Cover', description: 'Genuine leather, anti-slip, fits 37–38cm wheels.', price: 29.99, stock: 60, categoryId: 'cars', images: ['https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800&q=80'], rating: 4.5, reviewCount: 234, sellerId: S, status: A },
  { title: 'Car Organizer Trunk', description: '65L collapsible trunk organizer, 3 compartments.', price: 35.99, stock: 55, categoryId: 'cars', images: ['https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=800&q=80'], rating: 4.6, reviewCount: 312, sellerId: S, status: A },
  { title: 'Windshield Sun Shade', description: 'Foldable reflective sunshade, fits most windshields.', price: 19.99, stock: 90, categoryId: 'cars', images: ['https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800&q=80'], rating: 4.4, reviewCount: 445, sellerId: S, status: A },
  { title: 'Car Wireless Charger Mount', description: '15W wireless charging mount, auto-clamp, vent clip.', price: 44.99, stock: 40, categoryId: 'cars', images: ['https://images.unsplash.com/photo-1591370874773-6702e8f12fd8?w=800&q=80'], rating: 4.7, reviewCount: 267, sellerId: S, status: A },
  { title: 'LED Interior Light Kit', description: 'RGB LED strips, app control, music sync, 4pcs.', price: 22.99, stock: 70, categoryId: 'cars', images: ['https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=800&q=80'], rating: 4.5, reviewCount: 512, sellerId: S, status: A },
  { title: 'Car Backup Camera', description: '1080p waterproof reverse camera, 170° wide angle.', price: 39.99, stock: 35, categoryId: 'cars', images: ['https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80'], rating: 4.6, reviewCount: 198, sellerId: S, status: A },
  { title: 'Roof Cargo Carrier Bag', description: '15 cu ft waterproof rooftop bag, universal fit.', price: 79.99, stock: 20, categoryId: 'cars', images: ['https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800&q=80'], rating: 4.7, reviewCount: 145, sellerId: S, status: A },
  { title: 'Car Seat Gap Filler', description: 'Leather gap filler, stops items falling, 2pcs.', price: 16.99, stock: 100, categoryId: 'cars', images: ['https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=800&q=80'], rating: 4.4, reviewCount: 678, sellerId: S, status: A },
  { title: 'HUD Heads-Up Display', description: 'OBD2 HUD, speed, RPM, temp, overspeed alarm.', price: 59.99, stock: 28, categoryId: 'cars', images: ['https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80'], rating: 4.5, reviewCount: 234, sellerId: S, status: A },
  { title: 'Car Polishing Kit', description: '9-piece kit, compound + polish + wax, microfiber pads.', price: 44.99, stock: 30, categoryId: 'cars', images: ['https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800&q=80'], rating: 4.6, reviewCount: 189, sellerId: S, status: A },
  { title: 'Tinted Window Film Roll', description: '20% VLT, UV 99% block, self-adhesive, 50x300cm.', price: 29.99, stock: 45, categoryId: 'cars', images: ['https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=800&q=80'], rating: 4.3, reviewCount: 156, sellerId: S, status: A },
  { title: 'Car Floor Mats All-Weather', description: 'Heavy-duty rubber mats, custom fit, 4pcs set.', price: 54.99, stock: 40, categoryId: 'cars', images: ['https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800&q=80'], rating: 4.7, reviewCount: 423, sellerId: S, status: A },
  { title: 'Blind Spot Mirror Set', description: 'Convex wide-angle mirrors, self-adhesive, 2pcs.', price: 9.99, stock: 150, categoryId: 'cars', images: ['https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80'], rating: 4.5, reviewCount: 789, sellerId: S, status: A },
  { title: 'Car Battery Charger Smart', description: '10A smart charger, 12/24V, desulfation mode.', price: 49.99, stock: 25, categoryId: 'cars', images: ['https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=800&q=80'], rating: 4.8, reviewCount: 167, sellerId: S, status: A },
  { title: 'Parking Sensor Kit 4pcs', description: 'Ultrasonic sensors, buzzer + display, DIY install.', price: 34.99, stock: 30, categoryId: 'cars', images: ['https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80'], rating: 4.4, reviewCount: 212, sellerId: S, status: A },
  { title: 'Car Neck Pillow Memory Foam', description: 'Memory foam headrest, adjustable strap, 2pcs.', price: 27.99, stock: 60, categoryId: 'cars', images: ['https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800&q=80'], rating: 4.5, reviewCount: 334, sellerId: S, status: A },
  { title: 'Ceramic Car Wax Spray', description: 'SiO2 ceramic coating spray, 3-month protection.', price: 24.99, stock: 55, categoryId: 'cars', images: ['https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=800&q=80'], rating: 4.7, reviewCount: 445, sellerId: S, status: A },
  { title: 'Car Trash Can Mini', description: 'Leak-proof mini trash can, fits cup holder, lid.', price: 14.99, stock: 100, categoryId: 'cars', images: ['https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800&q=80'], rating: 4.4, reviewCount: 567, sellerId: S, status: A },
  { title: 'Snow Brush Ice Scraper', description: '4-in-1 extendable snow brush, foam grip, 135cm.', price: 19.99, stock: 45, categoryId: 'cars', images: ['https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80'], rating: 4.6, reviewCount: 289, sellerId: S, status: A },
  { title: 'Car GPS Tracker', description: 'Real-time GPS, 90-day standby, waterproof, app.', price: 39.99, stock: 30, categoryId: 'cars', images: ['https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=800&q=80'], rating: 4.5, reviewCount: 178, sellerId: S, status: A },
  { title: 'Microfiber Car Towel Set', description: '8pcs 400gsm microfiber towels, scratch-free.', price: 22.99, stock: 80, categoryId: 'cars', images: ['https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800&q=80'], rating: 4.7, reviewCount: 512, sellerId: S, status: A },
  { title: 'Car Emergency Kit', description: 'Jumper cables, tow rope, reflective vest, first aid.', price: 64.99, stock: 25, categoryId: 'cars', images: ['https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=800&q=80'], rating: 4.8, reviewCount: 234, sellerId: S, status: A },

  // ── FASHION & ACCESSORIES (30) ──
  { title: 'Gold Layered Necklace Set', description: '18K gold-plated 3-piece set, tarnish-resistant.', price: 28.00, stock: 75, categoryId: 'fashion', images: ['https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=800&q=80'], rating: 4.7, reviewCount: 389, sellerId: S, status: A },
  { title: 'Vintage Sunglasses', description: 'Retro round polarized UV400, spring hinges.', price: 34.99, stock: 60, categoryId: 'fashion', images: ['https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=800&q=80'], rating: 4.4, reviewCount: 218, sellerId: S, status: A },
  { title: 'Canvas Tote Bag', description: '12oz canvas, inner pocket, reinforced handles.', price: 22.00, stock: 100, categoryId: 'fashion', images: ['https://images.unsplash.com/photo-1544816155-12df9643f363?w=800&q=80'], rating: 4.5, reviewCount: 276, sellerId: S, status: A },
  { title: 'Silk Scrunchie Set 5pcs', description: 'Pure mulberry silk, 5 pastel colors, no crease.', price: 16.00, stock: 90, categoryId: 'fashion', images: ['https://images.unsplash.com/photo-1617038220319-276d3cfab638?w=800&q=80'], rating: 4.8, reviewCount: 445, sellerId: S, status: A },
  { title: 'Leather Backpack 20L', description: 'Genuine leather, laptop compartment, USB port.', price: 189.00, stock: 18, categoryId: 'fashion', images: ['https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&q=80'], rating: 4.8, reviewCount: 95, sellerId: S, status: A },
  { title: 'Minimalist Watch Steel', description: 'Sapphire glass, 5ATM, 2-year battery, slim.', price: 120.00, stock: 20, categoryId: 'fashion', images: ['https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80'], rating: 4.5, reviewCount: 77, sellerId: S, status: A },
  { title: 'Pearl Stud Earrings', description: 'Freshwater pearl studs, 925 silver, 8mm.', price: 35.00, stock: 55, categoryId: 'fashion', images: ['https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=800&q=80'], rating: 4.7, reviewCount: 312, sellerId: S, status: A },
  { title: 'Crossbody Bag Mini', description: 'Vegan leather mini crossbody, adjustable strap.', price: 45.00, stock: 40, categoryId: 'fashion', images: ['https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=800&q=80'], rating: 4.6, reviewCount: 234, sellerId: S, status: A },
  { title: 'Beanie Wool Ribbed', description: '100% merino wool beanie, 6 colors, unisex.', price: 28.00, stock: 65, categoryId: 'fashion', images: ['https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=800&q=80'], rating: 4.6, reviewCount: 189, sellerId: S, status: A },
  { title: 'Leather Belt Classic', description: 'Full-grain leather, brass buckle, 3 widths.', price: 49.00, stock: 50, categoryId: 'fashion', images: ['https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&q=80'], rating: 4.7, reviewCount: 156, sellerId: S, status: A },
  { title: 'Aviator Sunglasses Gold', description: 'Classic aviator, polarized, UV400, metal frame.', price: 39.99, stock: 45, categoryId: 'fashion', images: ['https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=800&q=80'], rating: 4.5, reviewCount: 267, sellerId: S, status: A },
  { title: 'Charm Bracelet Silver', description: '925 sterling silver, 5 charms, adjustable.', price: 42.00, stock: 35, categoryId: 'fashion', images: ['https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=800&q=80'], rating: 4.6, reviewCount: 198, sellerId: S, status: A },
  { title: 'Bucket Hat Canvas', description: 'Washed canvas bucket hat, UPF 50+, 5 colors.', price: 24.00, stock: 70, categoryId: 'fashion', images: ['https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=800&q=80'], rating: 4.4, reviewCount: 334, sellerId: S, status: A },
  { title: 'Clutch Bag Evening', description: 'Satin clutch, detachable chain, 4 colors.', price: 55.00, stock: 25, categoryId: 'fashion', images: ['https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=800&q=80'], rating: 4.5, reviewCount: 112, sellerId: S, status: A },
  { title: 'Signet Ring Gold', description: '18K gold-plated signet ring, unisex, 5 sizes.', price: 38.00, stock: 40, categoryId: 'fashion', images: ['https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=800&q=80'], rating: 4.7, reviewCount: 223, sellerId: S, status: A },
  { title: 'Scarf Cashmere Blend', description: '70% cashmere blend, 180x30cm, 8 colors.', price: 65.00, stock: 30, categoryId: 'fashion', images: ['https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=800&q=80'], rating: 4.8, reviewCount: 145, sellerId: S, status: A },
  { title: 'Tote Bag Leather Large', description: 'Pebbled leather, zip top, laptop sleeve, 30L.', price: 149.00, stock: 15, categoryId: 'fashion', images: ['https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&q=80'], rating: 4.8, reviewCount: 89, sellerId: S, status: A },
  { title: 'Hoop Earrings Gold Large', description: '18K gold-plated 50mm hoops, lightweight.', price: 22.00, stock: 80, categoryId: 'fashion', images: ['https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=800&q=80'], rating: 4.6, reviewCount: 445, sellerId: S, status: A },
  { title: 'Baseball Cap Structured', description: 'Structured 6-panel cap, embroidered logo, 8 colors.', price: 32.00, stock: 60, categoryId: 'fashion', images: ['https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=800&q=80'], rating: 4.5, reviewCount: 312, sellerId: S, status: A },
  { title: 'Wallet Slim Bifold', description: 'RFID-blocking slim leather wallet, 8 card slots.', price: 45.00, stock: 55, categoryId: 'fashion', images: ['https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&q=80'], rating: 4.7, reviewCount: 267, sellerId: S, status: A },
  { title: 'Anklet Gold Dainty', description: 'Dainty 14K gold-filled anklet, adjustable 23-26cm.', price: 18.00, stock: 90, categoryId: 'fashion', images: ['https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=800&q=80'], rating: 4.5, reviewCount: 389, sellerId: S, status: A },
  { title: 'Sunglasses Cat Eye', description: 'Retro cat-eye, polarized, UV400, acetate frame.', price: 44.99, stock: 35, categoryId: 'fashion', images: ['https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=800&q=80'], rating: 4.6, reviewCount: 178, sellerId: S, status: A },
  { title: 'Gym Bag Duffel 40L', description: 'Water-resistant duffel, shoe compartment, 40L.', price: 69.00, stock: 28, categoryId: 'fashion', images: ['https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&q=80'], rating: 4.7, reviewCount: 134, sellerId: S, status: A },
  { title: 'Cuff Bracelet Hammered', description: 'Hammered brass cuff, adjustable, boho style.', price: 25.00, stock: 50, categoryId: 'fashion', images: ['https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=800&q=80'], rating: 4.4, reviewCount: 201, sellerId: S, status: A },
  { title: 'Fedora Hat Wool', description: '100% wool felt fedora, grosgrain band, 3 colors.', price: 55.00, stock: 20, categoryId: 'fashion', images: ['https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=800&q=80'], rating: 4.6, reviewCount: 98, sellerId: S, status: A },
  { title: 'Pendant Necklace Minimalist', description: 'Dainty gold-filled pendant, 45cm chain.', price: 32.00, stock: 65, categoryId: 'fashion', images: ['https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=800&q=80'], rating: 4.7, reviewCount: 334, sellerId: S, status: A },
  { title: 'Backpack Mini Leather', description: 'Mini leather backpack, 10L, top handle + straps.', price: 89.00, stock: 22, categoryId: 'fashion', images: ['https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&q=80'], rating: 4.6, reviewCount: 156, sellerId: S, status: A },
  { title: 'Gloves Leather Lined', description: 'Cashmere-lined leather gloves, touchscreen tips.', price: 75.00, stock: 18, categoryId: 'fashion', images: ['https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=800&q=80'], rating: 4.7, reviewCount: 89, sellerId: S, status: A },
  { title: 'Stacking Ring Set 5pcs', description: 'Mixed metal stacking rings, 925 silver + gold.', price: 48.00, stock: 45, categoryId: 'fashion', images: ['https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=800&q=80'], rating: 4.8, reviewCount: 278, sellerId: S, status: A },
  { title: 'Shoulder Bag Structured', description: 'Structured leather shoulder bag, gold hardware.', price: 129.00, stock: 15, categoryId: 'fashion', images: ['https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=800&q=80'], rating: 4.7, reviewCount: 112, sellerId: S, status: A },
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

  // Products in batches of 400 (Firestore limit is 500)
  let count = 0;
  for (let i = 0; i < products.length; i += 400) {
    const batch = db.batch();
    const chunk = products.slice(i, i + 400);
    for (const product of chunk) {
      const ref = db.collection('products').doc();
      batch.set(ref, { id: ref.id, ...product, attributes: {}, createdAt: new Date().toISOString() });
    }
    await batch.commit();
    count += chunk.length;
    console.log(`  ✓ ${count}/${products.length} products written`);
  }

  console.log(`\n🎉 Done! ${categories.length} categories + ${products.length} products seeded.`);
}

seed().catch(console.error);
