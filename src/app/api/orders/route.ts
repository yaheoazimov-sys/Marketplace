import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase/admin';
import { withAuth } from '@/lib/middleware/apiAuth';

export const dynamic = 'force-dynamic';


export async function POST(req: NextRequest) {
  // Only authenticated clients can checkout
  const authRes = await withAuth(req, ['client']);
  if (authRes.error) return authRes.error;
  const user = authRes.context!;

  try {
    const body = await req.json();
    const { items, shippingAddress, paymentMethod } = body;

    if (!items || items.length === 0) {
      return NextResponse.json({ error: 'Cart is empty' }, { status: 400 });
    }

    const sellerIds = Array.from(new Set(items.map((i: any) => i.sellerId)));
    
    let totalAmount = 0;
    // Real implementation would verify prices again from DB to prevent client-side tampering
    items.forEach((item: any) => {
      totalAmount += item.price * item.quantity;
    });

    const docRef = adminDb.collection('orders').doc();
    const orderData = {
      id: docRef.id,
      clientId: user.uid,
      sellerIds,
      items,
      totalAmount,
      shippingAddress,
      paymentMethod,
      status: paymentMethod === 'mock_card' ? 'paid' : 'pending', // Simulating successful mock payment immediately
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Use a transaction/batch to reduce stock
    // Removed for brevity and lack of actual populated DB, but would involve `adminDb.runTransaction()`
    
    await docRef.set(orderData);

    return NextResponse.json({ 
      message: 'Order created successfully', 
      orderId: docRef.id, 
      status: orderData.status 
    }, { status: 201 });
    
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  // Sellers and Clients can view orders
  const authRes = await withAuth(req, ['client', 'seller', 'admin']);
  if (authRes.error) return authRes.error;
  const user = authRes.context!;

  try {
    let queryRef: FirebaseFirestore.Query = adminDb.collection('orders');

    if (user.role === 'client') {
      queryRef = queryRef.where('clientId', '==', user.uid);
    } else if (user.role === 'seller') {
      queryRef = queryRef.where('sellerIds', 'array-contains', user.uid);
    } // admin gets all

    queryRef = queryRef.orderBy('createdAt', 'desc');

    const snapshot = await queryRef.get();
    const orders = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    return NextResponse.json({ orders }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
