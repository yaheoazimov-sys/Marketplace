'use client';

import React, { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { getDocs, collection, doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/client';
import styles from '../admin.table.module.css';

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [msg, setMsg] = useState('');

  useEffect(() => {
    getDocs(collection(db, 'users')).then(snap => {
      setUsers(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    }).finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    let list = [...users];
    if (search) list = list.filter(u => u.email?.toLowerCase().includes(search.toLowerCase()) || u.displayName?.toLowerCase().includes(search.toLowerCase()));
    if (roleFilter !== 'all') list = list.filter(u => u.role === roleFilter);
    if (statusFilter !== 'all') list = list.filter(u => u.status === statusFilter);
    return list.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
  }, [users, search, roleFilter, statusFilter]);

  const update = async (uid: string, patch: any) => {
    await updateDoc(doc(db, 'users', uid), patch);
    setUsers(prev => prev.map(u => u.id === uid ? { ...u, ...patch } : u));
    setMsg('Updated'); setTimeout(() => setMsg(''), 2000);
  };

  const rc = (r: string) => ({ admin: '#7c3aed', seller: '#0369a1', client: '#374151' }[r] || '#374151');
  const sc = (s: string) => s === 'active' ? '#15803d' : '#b91c1c';

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div><h1 className={styles.title}>User Management</h1><p className={styles.sub}>{users.length} total users</p></div>
      </div>

      <div className={styles.stats}>
        {[['All', users.length, 'all', '#111'], ['Sellers', users.filter(u=>u.role==='seller').length, 'seller', '#0369a1'], ['Buyers', users.filter(u=>u.role==='client').length, 'client', '#374151'], ['Admins', users.filter(u=>u.role==='admin').length, 'admin', '#7c3aed'], ['Blocked', users.filter(u=>u.status==='blocked').length, 'blocked', '#b91c1c']].map(([l, v, f, c]) => (
          <button key={String(f)} className={`${styles.statCard} ${roleFilter === f || (f === 'blocked' && statusFilter === 'blocked') ? styles.statCardActive : ''}`}
            onClick={() => { if (f === 'blocked') { setStatusFilter('blocked'); setRoleFilter('all'); } else { setRoleFilter(String(f)); setStatusFilter('all'); } }}>
            <span className={styles.statVal} style={{ color: String(c) }}>{v}</span>
            <span className={styles.statLabel}>{l}</span>
          </button>
        ))}
      </div>

      {msg && <div className={styles.successBanner}>✓ {msg}</div>}

      <div className={styles.toolbar}>
        <div className={styles.searchWrap}>
          <span>🔍</span>
          <input className={styles.searchInput} placeholder="Search by name or email..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
      </div>

      <div className={styles.tableCard}>
        {loading ? <div className={styles.loading}>Loading users...</div> : (
          <table className={styles.table}>
            <thead><tr><th>User</th><th>Role</th><th>Status</th><th>Joined</th><th>Actions</th></tr></thead>
            <tbody>
              {filtered.length === 0 ? <tr><td colSpan={5} className={styles.empty}>No users found</td></tr> :
                filtered.map(u => (
                  <tr key={u.id}>
                    <td>
                      <div className={styles.userCell}>
                        <div className={styles.avatar}>{(u.displayName?.[0] || u.email?.[0] || '?').toUpperCase()}</div>
                        <div><p className={styles.userName}>{u.displayName || '—'}</p><p className={styles.userEmail}>{u.email}</p></div>
                      </div>
                    </td>
                    <td>
                      <select className={styles.inlineSelect} value={u.role || 'client'} style={{ color: rc(u.role) }}
                        onChange={e => update(u.id, { role: e.target.value })}>
                        <option value="client">Buyer</option>
                        <option value="seller">Seller</option>
                        <option value="admin">Admin</option>
                      </select>
                    </td>
                    <td><span className={styles.pill} style={{ color: sc(u.status || 'active'), background: sc(u.status || 'active') + '18' }}>{u.status || 'active'}</span></td>
                    <td className={styles.muted}>{u.createdAt ? new Date(u.createdAt).toLocaleDateString() : '—'}</td>
                    <td>
                      <div className={styles.actions}>
                        <button className={u.status === 'blocked' ? styles.btnGreen : styles.btnRed}
                          onClick={() => update(u.id, { status: u.status === 'blocked' ? 'active' : 'blocked' })}>
                          {u.status === 'blocked' ? 'Unblock' : 'Block'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
