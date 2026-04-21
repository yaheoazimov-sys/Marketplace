import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase/admin';
import { withAuth } from '@/lib/middleware/apiAuth';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  const authRes = await withAuth(req, ['admin']);
  if (authRes.error) return authRes.error;
  try {
    const snapshot = await adminDb().collection('users').orderBy('createdAt', 'desc').get();
    const users = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
    return NextResponse.json({ users }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  const authRes = await withAuth(req, ['admin']);
  if (authRes.error) return authRes.error;
  try {
    const { uid, status, role } = await req.json();
    if (!uid) return NextResponse.json({ error: 'uid required' }, { status: 400 });
    const update: any = {};
    if (status) update.status = status;
    if (role) update.role = role;
    await adminDb().collection('users').doc(uid).update(update);
    return NextResponse.json({ message: 'User updated' }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

