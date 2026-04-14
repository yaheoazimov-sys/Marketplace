'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import ProtectedRoute from '@/components/ProtectedRoute';
import Navbar from '@/components/Navbar';
import { useAuth } from '@/contexts/AuthContext';
import styles from './admin.module.css';

const ROLES = ['client', 'seller', 'admin'];
const STATUSES = ['active', 'blocked'];

export default function AdminDashboard() {
  return <ProtectedRoute allowedRoles={['admin']}><AdminContent /></ProtectedRoute>;
}

function AdminContent() {
  const { user } = useAuth();
  const [tab, setTab] = useState<'users' | 'products'>('users');
  const [users, setUsers] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [msg, setMsg] = useState('');

  const token = useCallback(async () => (await user?.getIdToken()) ?? '', [user]);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/users', { headers: { Authorization: `Bearer ${await token()}` } });
      const d = await res.json();
      setUsers(d.users || []);
    } catch { setUsers([]); }
    finally { setLoading(false); }
  }, [token]);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/products', { headers: { Authorization: `Bearer ${await token()}` } });
      const d = await res.json();
      setProducts(d.products || []);
    } catch { setProducts([]); }
    finally { setLoading(false); }
  }, [token]);

  useEffect(() => { if (tab === 'users') fetchUsers(); else fetchProducts(); }, [tab, fetchUsers, fetchProducts]);

  const updateUser = async (uid: string, patch: any) => {
    try {
      await fetch('/api/users', { method: 'PATCH', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${await token()}` }, body: JSON.stringify({ uid, ...patch }) });
      setMsg('Updated'); setTimeout(() => setMsg(''), 2000);
      fetchUsers();
    } catch {}
  };

  const deleteProduct = async (id: string) => {
    if (!confirm('Delete this product?')) return;
    await fetch(`/api/products/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${await token()}` } });
    fetchProducts();
  };

  const filteredUsers = users.filter(u => !search || u.email?.toLowerCase().includes(search.toLowerCase()) || u.displayName?.toLowerCase().includes(search.toLowerCase()));
  const filteredProducts = products.filter(p => !search || p.title?.toLowerCase().includes(search.toLowerCase()));

  const roleColor = (r: string) => r === 'admin' ? '#7c3aed' : r === 'seller' ? '#0369a1' : '#374151';
  const statusColor = (s: string) => s === 'active' ? '#15803d' : '#b91c1c';

  return (
    <>
      <Navbar />
      <div className={styles.page}>
        <div className={styles.header}>
          <div>
            <h1 className={styles.title}>Admin Panel</h1>
            <p className={styles.subtitle}>Platform management</p>
          </div>
          <div className={styles.tabs}>
            <button className={`${styles.tab} ${tab === 'users' ? styles.tabActive : ''}`} onClick={() => setTab('users')}>👥 Users</button>
            <button className={`${styles.tab} ${tab === 'products' ? styles.tabActive : ''}`} onClick={() => setTab('products')}>📦 Products</button>
          </div>
        </div>

        <div className={styles.stats}>
          <div className={styles.stat}><span className={styles.statVal}>{users.length}</span><span className={styles.statLabel}>Total Users</span></div>
          <div className={styles.stat}><span className={styles.statVal}>{users.filter(u => u.role === 'seller').length}</span><span className={styles.statLabel}>Sellers</span></div>
          <div className={styles.stat}><span className={styles.statVal}>{users.filter(u => u.status === 'blocked').length}</span><span className={styles.statLabel}>Blocked</span></div>
          <div className={styles.stat}><span className={styles.statVal}>{products.length}</span><span className={styles.statLabel}>Products</span></div>
        </div>

        {msg && <div className={styles.successBanner}>✓ {msg}</div>}

        <div className={styles.section}>
          <div className={styles.toolbar}>
            <div className={styles.searchWrap}>
              <span>🔍</span>
              <input className={styles.searchInput} placeholder={tab === 'users' ? 'Search users...' : 'Search products...'} value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            {tab === 'products' && (
              <Link href="/seller/dashboard" className={styles.btnPrimary}>+ Add Product</Link>
            )}
          </div>

          {loading ? (
            <div className={styles.skeletons}>{Array(5).fill(null).map((_, i) => <div key={i} className={styles.skeleton} />)}</div>
          ) : tab === 'users' ? (
            <div className={styles.tableWrap}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>User</th>
                    <th>Role</th>
                    <th>Status</th>
                    <th>Joined</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.length === 0 ? (
                    <tr><td colSpan={5} className={styles.emptyCell}>No users found</td></tr>
                  ) : filteredUsers.map(u => (
                    <tr key={u.id}>
                      <td>
                        <div className={styles.userCell}>
                          <div className={styles.avatar}>{(u.displayName?.[0] || u.email?.[0] || '?').toUpperCase()}</div>
                          <div>
                            <p className={styles.userName}>{u.displayName || '—'}</p>
                            <p className={styles.userEmail}>{u.email}</p>
                          </div>
                        </div>
                      </td>
                      <td>
                        <select
                          className={styles.inlineSelect}
                          value={u.role || 'client'}
                          style={{ color: roleColor(u.role) }}
                          onChange={e => updateUser(u.id, { role: e.target.value })}
                        >
                          {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                        </select>
                      </td>
                      <td>
                        <span className={styles.statusPill} style={{ color: statusColor(u.status), background: statusColor(u.status) + '18' }}>
                          {u.status || 'active'}
                        </span>
                      </td>
                      <td className={styles.dateCell}>{u.createdAt ? new Date(u.createdAt).toLocaleDateString() : '—'}</td>
                      <td>
                        <button
                          className={u.status === 'blocked' ? styles.btnUnblock : styles.btnBlock}
                          onClick={() => updateUser(u.id, { status: u.status === 'blocked' ? 'active' : 'blocked' })}
                        >
                          {u.status === 'blocked' ? 'Unblock' : 'Block'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className={styles.tableWrap}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Category</th>
                    <th>Price</th>
                    <th>Stock</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.length === 0 ? (
                    <tr><td colSpan={6} className={styles.emptyCell}>No products found</td></tr>
                  ) : filteredProducts.map(p => (
                    <tr key={p.id}>
                      <td>
                        <div className={styles.productCell}>
                          {p.images?.[0] && <img src={p.images[0]} alt="" className={styles.thumb} />}
                          <span className={styles.productName}>{p.title}</span>
                        </div>
                      </td>
                      <td><span className={styles.catTag}>{p.categoryId}</span></td>
                      <td className={styles.priceCell}>${Number(p.price).toFixed(2)}</td>
                      <td style={{ color: p.stock === 0 ? '#ef4444' : '#333' }}>{p.stock}</td>
                      <td><span className={styles.statusPill} style={{ color: p.status === 'active' ? '#15803d' : '#b91c1c', background: p.status === 'active' ? '#15803d18' : '#b91c1c18' }}>{p.status}</span></td>
                      <td><button className={styles.btnBlock} onClick={() => deleteProduct(p.id)}>Delete</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
