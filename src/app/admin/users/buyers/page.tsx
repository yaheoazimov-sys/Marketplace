'use client';

import React, { useEffect, useState } from 'react';
import { getDocs, collection, doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/client';
import styles from '../../admin.table.module.css';

export default function AdminBuyersPage() {
  const [buyers, setBuyers] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    Promise.all([
      getDocs(collection(db, 'users')),
      getDocs(collection(db, 'orders')),
    ]).then(([uSnap, oSnap]) => {
      setBuyers(uSnap.docs.map(d => ({ id: d.id, ...d.data() })).filter((u: any) => u.role === 'client'));
      setOrders(oSnap.docs.map(d => ({ id: d.id, ...d.data() })));
    }).finally(() => setLoading(false));
  }, []);

  const update = async (uid: string, patch: any) => {
    await updateDoc(doc(db, 'users', uid), patch);
    setBuyers(prev => prev.map(b => b.id === uid ? { ...b, ...patch } : b));
    setMsg('Updated'); setTimeout(() => setMsg(''), 2000);
  };

  const sc = (s: string) => s === 'active' ? '#15803d' : '#b91c1c';

  return (
    <div className={styles.page}>
      <div className={styles.header}><div><h1 className={styles.title}>Buyers</h1><p className={styles.sub}>{buyers.length} registered buyers</p></div></div>
      {msg && <div className={styles.successBanner}>✓ {msg}</div>}
      <div className={styles.tableCard}>
        {loading ? <div className={styles.loading}>Loading...</div> : (
          <table className={styles.table}>
            <thead><tr><th>Buyer</th><th>Orders</th><th>Total Spent</th><th>Status</th><th>Joined</th><th>Actions</th></tr></thead>
            <tbody>
              {buyers.length === 0 ? <tr><td colSpan={6} className={styles.empty}>No buyers yet</td></tr> :
                buyers.map(b => {
                  const buyerOrders = orders.filter(o => o.clientId === b.id);
                  const spent = buyerOrders.filter(o => ['paid','delivered'].includes(o.status)).reduce((s, o) => s + (o.totalAmount || 0), 0);
                  return (
                    <tr key={b.id}>
                      <td><div className={styles.userCell}><div className={styles.avatar}>{(b.displayName?.[0] || b.email?.[0] || '?').toUpperCase()}</div><div><p className={styles.userName}>{b.displayName || '—'}</p><p className={styles.userEmail}>{b.email}</p></div></div></td>
                      <td>{buyerOrders.length}</td>
                      <td className={styles.amount}>${spent.toFixed(2)}</td>
                      <td><span className={styles.pill} style={{ color: sc(b.status || 'active'), background: sc(b.status || 'active') + '18' }}>{b.status || 'active'}</span></td>
                      <td className={styles.muted}>{b.createdAt ? new Date(b.createdAt).toLocaleDateString() : '—'}</td>
                      <td><button className={b.status === 'blocked' ? styles.btnGreen : styles.btnRed} onClick={() => update(b.id, { status: b.status === 'blocked' ? 'active' : 'blocked' })}>{b.status === 'blocked' ? 'Unblock' : 'Block'}</button></td>
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

