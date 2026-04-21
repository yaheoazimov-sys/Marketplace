'use client';

import React, { useEffect, useState } from 'react';
import { getDocs, collection, doc, updateDoc, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase/client';
import styles from '../../admin.table.module.css';

export default function AdminSellersPage() {
  const [sellers, setSellers] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    Promise.all([
      getDocs(collection(db, 'users')),
      getDocs(collection(db, 'products')),
    ]).then(([uSnap, pSnap]) => {
      setSellers(uSnap.docs.map(d => ({ id: d.id, ...d.data() })).filter((u: any) => u.role === 'seller'));
      setProducts(pSnap.docs.map(d => ({ id: d.id, ...d.data() })));
    }).finally(() => setLoading(false));
  }, []);

  const update = async (uid: string, patch: any) => {
    await updateDoc(doc(db, 'users', uid), patch);
    setSellers(prev => prev.map(s => s.id === uid ? { ...s, ...patch } : s));
    setMsg('Updated'); setTimeout(() => setMsg(''), 2000);
  };

  const sc = (s: string) => s === 'active' ? '#15803d' : '#b91c1c';

  return (
    <div className={styles.page}>
      <div className={styles.header}><div><h1 className={styles.title}>Sellers</h1><p className={styles.sub}>{sellers.length} registered sellers</p></div></div>
      {msg && <div className={styles.successBanner}>✓ {msg}</div>}
      <div className={styles.tableCard}>
        {loading ? <div className={styles.loading}>Loading...</div> : (
          <table className={styles.table}>
            <thead><tr><th>Seller</th><th>Products</th><th>Status</th><th>Joined</th><th>Actions</th></tr></thead>
            <tbody>
              {sellers.length === 0 ? <tr><td colSpan={5} className={styles.empty}>No sellers yet</td></tr> :
                sellers.map(s => {
                  const sellerProducts = products.filter(p => p.sellerId === s.id);
                  return (
                    <tr key={s.id}>
                      <td><div className={styles.userCell}><div className={styles.avatar}>{(s.displayName?.[0] || s.email?.[0] || '?').toUpperCase()}</div><div><p className={styles.userName}>{s.displayName || '—'}</p><p className={styles.userEmail}>{s.email}</p></div></div></td>
                      <td>{sellerProducts.length} products</td>
                      <td><span className={styles.pill} style={{ color: sc(s.status || 'active'), background: sc(s.status || 'active') + '18' }}>{s.status || 'active'}</span></td>
                      <td className={styles.muted}>{s.createdAt ? new Date(s.createdAt).toLocaleDateString() : '—'}</td>
                      <td><div className={styles.actions}>
                        <button className={s.status === 'blocked' ? styles.btnGreen : styles.btnRed} onClick={() => update(s.id, { status: s.status === 'blocked' ? 'active' : 'blocked' })}>{s.status === 'blocked' ? 'Unblock' : 'Block'}</button>
                        <button className={styles.btnBlue} onClick={() => update(s.id, { role: 'client' })}>Demote</button>
                      </div></td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

