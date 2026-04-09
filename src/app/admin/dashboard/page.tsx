'use client';

import React, { useEffect, useState } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';

export default function AdminDashboard() {
  const [users, setUsers] = useState<any[]>([]);
  const [pendingProducts, setPendingProducts] = useState<any[]>([]);

  useEffect(() => {
    // Mocking Data for Admin Portal
    setUsers([
      { id: 'u1', email: 'client@example.com', role: 'client', status: 'active' },
      { id: 'u2', email: 'seller@example.com', role: 'seller', status: 'active' },
      { id: 'u3', email: 'bad_guy@example.com', role: 'client', status: 'blocked' },
    ]);

    setPendingProducts([
      { id: '3', title: 'Mechanical Keyboard Pro', seller: 'seller@example.com', status: 'pending' }
    ]);
  }, []);

  return (
    <ProtectedRoute allowedRoles={['admin']}>
      <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
        <h1 style={{ fontSize: '2.5rem', marginBottom: '2rem', color: '#ef4444' }}>Admin Control Panel</h1>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)', gap: '2rem' }}>
          
          {/* User Management */}
          <div style={{ background: 'var(--bg-secondary)', padding: '2rem', borderRadius: '16px', border: '1px solid var(--border-color)' }}>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem' }}>User Management</h2>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--border-color)' }}>
                  <th style={{ padding: '0.75rem 0' }}>Email</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <td style={{ padding: '0.75rem 0' }}>{u.email}</td>
                    <td style={{ textTransform: 'capitalize' }}>{u.role}</td>
                    <td style={{ color: u.status === 'blocked' ? '#ef4444' : '#16a34a' }}>{u.status}</td>
                    <td>
                      <button style={{ padding: '0.4rem 0.8rem', background: 'transparent', border: '1px solid #ef4444', color: '#ef4444', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem' }}>
                        {u.status === 'blocked' ? 'Unblock' : 'Block'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Content Moderation */}
          <div style={{ background: 'var(--bg-secondary)', padding: '2rem', borderRadius: '16px', border: '1px solid var(--border-color)' }}>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem' }}>Content Moderation</h2>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--border-color)' }}>
                  <th style={{ padding: '0.75rem 0' }}>Product</th>
                  <th>Seller</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {pendingProducts.length === 0 ? (
                  <tr><td colSpan={3} style={{ padding: '1rem 0' }}>No pending products.</td></tr>
                ) : pendingProducts.map(p => (
                  <tr key={p.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <td style={{ padding: '0.75rem 0' }}>{p.title}</td>
                    <td>{p.seller}</td>
                    <td style={{ display: 'flex', gap: '0.5rem', padding: '0.5rem 0' }}>
                      <button style={{ padding: '0.4rem 0.8rem', background: '#16a34a', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>Approve</button>
                      <button style={{ padding: '0.4rem 0.8rem', background: '#ef4444', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>Reject</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

        </div>
      </div>
    </ProtectedRoute>
  );
}
