import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase/admin';
import { withAuth } from '@/lib/middleware/apiAuth';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
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
    const totalAmount = items.reduce((sum: number, item: any) => sum + item.price * item.quantity, 0);

    const db = adminDb();
    const docRef = db.collection('orders').doc();
    const orderData = {
      id: docRef.id,
      clientId: user.uid,
      sellerIds,
      items,
      totalAmount,
      shippingAddress,
      paymentMethod,
      status: paymentMethod === 'mock_card' ? 'paid' : 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await docRef.set(orderData);
    return NextResponse.json({ message: 'Order created successfully', orderId: docRef.id, status: orderData.status }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const authRes = await withAuth(req, ['client', 'seller', 'admin']);
  if (authRes.error) return authRes.error;
  const user = authRes.context!;

  try {
    const db = adminDb();
    let queryRef: FirebaseFirestore.Query = db.collection('orders');

    if (user.role === 'client') {
      queryRef = queryRef.where('clientId', '==', user.uid);
    } else if (user.role === 'seller') {
      queryRef = queryRef.where('sellerIds', 'array-contains', user.uid);
    }

    queryRef = queryRef.orderBy('createdAt', 'desc');

    const snapshot = await queryRef.get();
    const orders = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    return NextResponse.json({ orders }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

