import { NextRequest } from 'next/server';
import { withAuth } from '../apiAuth';

// Mock Firebase Admin
jest.mock('@/lib/firebase/admin', () => ({
  adminAuth: {
    verifyIdToken: jest.fn().mockResolvedValue({ uid: 'test-uid', email: 'test@example.com' })
  },
  adminDb: {
    collection: jest.fn().mockReturnValue({
      doc: jest.fn().mockReturnValue({
        get: jest.fn().mockResolvedValue({
          exists: true,
          data: () => ({ role: 'seller', status: 'active' })
        })
      })
    })
  }
}));

describe('RBAC Middleware (withAuth)', () => {
  it('rejects unauthorized requests without authorization header', async () => {
    const req = new NextRequest('http://localhost/api/test');
    const result = await withAuth(req, ['client']);
    
    expect(result.error).toBeDefined();
    // Assuming JSON response decoding
    expect(result.error?.status).toBe(401);
  });

  it('verifies token and checks firestore role successfully', async () => {
    const req = new NextRequest('http://localhost/api/test', {
      headers: new Headers({
        'Authorization': 'Bearer mock-token'
      })
    });

    // We allow seller
    const result = await withAuth(req, ['seller', 'admin']);
    
    expect(result.error).toBeUndefined();
    expect(result.context?.role).toBe('seller');
    expect(result.context?.uid).toBe('test-uid');
  });

  it('blocks users trying to access unauthorized endpoints', async () => {
    const req = new NextRequest('http://localhost/api/test', {
      headers: new Headers({
        'Authorization': 'Bearer mock-token'
      })
    });

    // Endpoint only for admins
    const result = await withAuth(req, ['admin']);
    
    expect(result.error).toBeDefined();
    expect(result.error?.status).toBe(403); // Forbidden
  });
});
