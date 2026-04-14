import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase/admin';
import { withAuth } from '@/lib/middleware/apiAuth';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const authRes = await withAuth(req, ['client', 'seller', 'admin']);
  if (authRes.error) return authRes.error;
  const user = authRes.context!;

  try {
    const { id } = await params;
    const doc = await adminDb().collection('orders').doc(id).get();
    if (!doc.exists) return NextResponse.json({ error: 'Order not found' }, { status: 404 });

    const order = { id: doc.id, ...doc.data() } as any;

    // Access control
    if (user.role === 'client' && order.clientId !== user.uid)
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    if (user.role === 'seller' && !order.sellerIds?.includes(user.uid))
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    return NextResponse.json({ order }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const authRes = await withAuth(req, ['seller', 'admin']);
  if (authRes.error) return authRes.error;
  const user = authRes.context!;

  try {
    const { id } = await params;
    const { status, note } = await req.json();

    const VALID = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'];
    if (!VALID.includes(status)) return NextResponse.json({ error: 'Invalid status' }, { status: 400 });

    const db = adminDb();
    const ref = db.collection('orders').doc(id);
    const doc = await ref.get();
    if (!doc.exists) return NextResponse.json({ error: 'Order not found' }, { status: 404 });

    const order = doc.data() as any;
    if (user.role === 'seller' && !order.sellerIds?.includes(user.uid))
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const now = new Date().toISOString();
    const timeline = order.timeline || [];
    timeline.push({ status, note: note || '', timestamp: now, updatedBy: user.uid });

    await ref.update({ status, timeline, updatedAt: now });
    return NextResponse.json({ message: 'Status updated', status }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
