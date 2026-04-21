import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase/admin';
import { withAuth } from '@/lib/middleware/apiAuth';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET() {
  try {
    const snapshot = await adminDb().collection('categories').orderBy('order').get();
    const categories = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    return NextResponse.json({ categories }, { status: 200 });
  } catch {
    // fallback without orderBy if index not ready
    try {
      const snapshot = await adminDb().collection('categories').get();
      const categories = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      return NextResponse.json({ categories }, { status: 200 });
    } catch (err: any) {
      return NextResponse.json({ error: err.message }, { status: 500 });
    }
  }
}

export async function POST(req: NextRequest) {
  const authRes = await withAuth(req, ['admin']);
  if (authRes.error) return authRes.error;

  try {
    const body = await req.json();
    const { name, slug, parentId, icon, order } = body;
    if (!name || !slug) return NextResponse.json({ error: 'Name and slug are required' }, { status: 400 });

    const db = adminDb();
    const ref = db.collection('categories').doc(slug);
    const cat = { id: slug, name, slug, parentId: parentId || null, icon: icon || null, order: order ?? 99 };
    await ref.set(cat);
    return NextResponse.json({ message: 'Category created', category: cat }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  const authRes = await withAuth(req, ['admin']);
  if (authRes.error) return authRes.error;

  try {
    const body = await req.json();
    const { id, name, slug, parentId, icon, order } = body;
    if (!id) return NextResponse.json({ error: 'id is required' }, { status: 400 });

    await adminDb().collection('categories').doc(id).update({ name, slug, parentId: parentId || null, icon: icon || null, order: order ?? 99 });
    return NextResponse.json({ message: 'Category updated' }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const authRes = await withAuth(req, ['admin']);
  if (authRes.error) return authRes.error;

  try {
    const { id } = await req.json();
    if (!id) return NextResponse.json({ error: 'id is required' }, { status: 400 });

    const db = adminDb();
    // Also remove parentId from children
    const children = await db.collection('categories').where('parentId', '==', id).get();
    const batch = db.batch();
    children.docs.forEach(d => batch.update(d.ref, { parentId: null }));
    batch.delete(db.collection('categories').doc(id));
    await batch.commit();
    return NextResponse.json({ message: 'Category deleted' }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

