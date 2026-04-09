import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase/admin';
import { withAuth } from '@/lib/middleware/apiAuth';

export const dynamic = 'force-dynamic';


export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const docRef = adminDb.collection('products').doc(id);
    const docSnap = await docRef.get();

    if (!docSnap.exists) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    return NextResponse.json({ product: { id: docSnap.id, ...docSnap.data() } }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const authRes = await withAuth(req, ['seller', 'admin']);
  if (authRes.error) return authRes.error;
  const user = authRes.context!;

  try {
    const docRef = adminDb.collection('products').doc(id);
    const docSnap = await docRef.get();

    if (!docSnap.exists) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    const product = docSnap.data();
    if (user.role !== 'admin' && product?.sellerId !== user.uid) {
      return NextResponse.json({ error: 'You can only edit your own products' }, { status: 403 });
    }

    const body = await req.json();
    const updateData = { ...body, updatedAt: new Date().toISOString() };
    
    // Disallow overriding critical root fields blindly
    delete updateData.id;
    delete updateData.sellerId; 

    await docRef.update(updateData);

    return NextResponse.json({ message: 'Product updated', product: { ...product, ...updateData } }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const authRes = await withAuth(req, ['seller', 'admin']);
  if (authRes.error) return authRes.error;
  const user = authRes.context!;

  try {
    const docRef = adminDb.collection('products').doc(id);
    const docSnap = await docRef.get();

    if (!docSnap.exists) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    const product = docSnap.data();
    if (user.role !== 'admin' && product?.sellerId !== user.uid) {
      return NextResponse.json({ error: 'You can only delete your own products' }, { status: 403 });
    }

    await docRef.delete();

    return NextResponse.json({ message: 'Product deleted' }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
