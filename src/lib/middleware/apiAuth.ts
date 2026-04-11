import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebase/admin';

export type AllowedRoles = 'client' | 'seller' | 'admin';

export interface RouteContext {
  uid: string;
  email: string;
  role: AllowedRoles;
}

export async function withAuth(
  req: NextRequest,
  allowedRoles?: AllowedRoles[]
): Promise<{ error?: NextResponse; context?: RouteContext }> {
  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return { error: NextResponse.json({ error: 'Missing or invalid authorization token' }, { status: 401 }) };
    }

    const idToken = authHeader.split('Bearer ')[1];

    const decodedToken = await adminAuth().verifyIdToken(idToken);
    const { uid, email } = decodedToken;

    const userDoc = await adminDb().collection('users').doc(uid).get();

    if (!userDoc.exists) {
      return { error: NextResponse.json({ error: 'User profile not found in database' }, { status: 403 }) };
    }

    const userData = userDoc.data();
    const userRole = userData?.role as AllowedRoles;

    if (userData?.status === 'blocked') {
      return { error: NextResponse.json({ error: 'Account is blocked' }, { status: 403 }) };
    }

    if (allowedRoles && !allowedRoles.includes(userRole)) {
      return { error: NextResponse.json({ error: `Requires one of roles: ${allowedRoles.join(', ')}` }, { status: 403 }) };
    }

    return { context: { uid, email: email || '', role: userRole } };
  } catch (err: any) {
    console.error('Auth Middleware Error:', err.message);
    return { error: NextResponse.json({ error: 'Unauthorized', details: err.message }, { status: 401 }) };
  }
}
