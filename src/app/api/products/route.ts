import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase/admin';
import { withAuth } from '@/lib/middleware/apiAuth';

export const dynamic = 'force-dynamic';


export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category');
    const sellerId = searchParams.get('sellerId');
    const q = searchParams.get('q'); // Basic search simulation

    let queryRef: FirebaseFirestore.Query = adminDb.collection('products');

    // Currently Firebase requires composite indices for multiple queries. Keep it simple.
    if (category) queryRef = queryRef.where('categoryId', '==', category);
    if (sellerId) queryRef = queryRef.where('sellerId', '==', sellerId);
    // Active products only by default, unless seller asking for own
    if (!sellerId) queryRef = queryRef.where('status', '==', 'active');

    const snapshot = await queryRef.get();
    let products = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    // Fuzzy poor-mans search on titles for small-scale (Algolia recommended for prod)
    if (q) {
      const lowerQ = q.toLowerCase();
      products = products.filter((p: any) => p.title.toLowerCase().includes(lowerQ));
    }

    return NextResponse.json({ products }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  // Only sellers and admins can create products
  const authRes = await withAuth(req, ['seller', 'admin']);
  if (authRes.error) return authRes.error;
  const user = authRes.context!;

  try {
    const body = await req.json();
    const { title, description, price, stock, categoryId, images, attributes } = body;

    // Validate inputs
    if (!title || price == null || stock == null) {
      return NextResponse.json({ error: 'Title, price, and stock are required' }, { status: 400 });
    }

    const docRef = adminDb.collection('products').doc();
    const newProduct = {
      id: docRef.id,
      title,
      description: description || '',
      price: Number(price),
      stock: Number(stock),
      sellerId: user.uid, // Product bound to creator
      categoryId: categoryId || null,
      images: images || [],
      attributes: attributes || {},
      status: 'active', // For production: 'pending' to wait for admin review
      createdAt: new Date().toISOString(),
      rating: 0,
      reviewCount: 0
    };
    
    await docRef.set(newProduct);

    return NextResponse.json({ message: 'Product created', product: newProduct }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
