import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase/admin';
import { withAuth } from '@/lib/middleware/apiAuth';

export const dynamic = 'force-dynamic';


export async function GET(req: NextRequest) {
  try {
    const snapshot = await adminDb.collection('categories').get();
    const categories = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    return NextResponse.json({ categories }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  // Only Admins can modify categories
  const authRes = await withAuth(req, ['admin']);
  if (authRes.error) return authRes.error;

  try {
    const body = await req.json();
    const { name, slug, parentId } = body;

    if (!name || !slug) {
      return NextResponse.json({ error: 'Name and slug are required' }, { status: 400 });
    }

    const docRef = adminDb.collection('categories').doc();
    const newCategory = { id: docRef.id, name, slug, parentId: parentId || null };
    
    await docRef.set(newCategory);

    return NextResponse.json({ message: 'Category created', category: newCategory }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
