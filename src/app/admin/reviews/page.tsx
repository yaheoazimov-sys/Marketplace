'use client';

import React, { useEffect, useState } from 'react';
import { getDocs, collection, deleteDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase/client';
import styles from '../admin.table.module.css';

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [msg, setMsg] = useState('');

  useEffect(() => {
    getDocs(collection(db, 'reviews')).then(snap => {
      setReviews(snap.docs.map(d => ({ id: d.id, ...d.data() })).sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
    }).finally(() => setLoading(false));
  }, []);

  const remove = async (id: string) => {
    if (!confirm('Delete this review?')) return;
    await deleteDoc(doc(db, 'reviews', id));
    setReviews(prev => prev.filter(r => r.id !== id));
    setMsg('Review deleted'); setTimeout(() => setMsg(''), 2000);
  };

  const filtered = reviews.filter(r => !search || r.text?.toLowerCase().includes(search.toLowerCase()) || r.userName?.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className={styles.page}>
      <div className={styles.header}><div><h1 className={styles.title}>Reviews Moderation</h1><p className={styles.sub}>{reviews.length} total reviews</p></div></div>
      {msg && <div className={styles.successBanner}>✓ {msg}</div>}
      <div className={styles.toolbar}>
        <div className={styles.searchWrap}><span>🔍</span><input className={styles.searchInput} placeholder="Search reviews..." value={search} onChange={e => setSearch(e.target.value)} /></div>
      </div>
      <div className={styles.tableCard}>
        {loading ? <div className={styles.loading}>Loading...</div> : (
          <table className={styles.table}>
            <thead><tr><th>User</th><th>Rating</th><th>Review</th><th>Date</th><th>Actions</th></tr></thead>
            <tbody>
              {filtered.length === 0 ? <tr><td colSpan={5} className={styles.empty}>No reviews found</td></tr> :
                filtered.map(r => (
                  <tr key={r.id}>
                    <td><p style={{ fontSize: '0.82rem', fontWeight: 600 }}>{r.userName}</p></td>
                    <td><span style={{ color: '#f59e0b', fontWeight: 700 }}>{'★'.repeat(r.rating)}{'☆'.repeat(5-r.rating)}</span></td>
                    <td className={styles.muted} style={{ maxWidth: 250, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.text}</td>
                    <td className={styles.muted}>{new Date(r.createdAt).toLocaleDateString()}</td>
                    <td><button className={styles.btnRed} onClick={() => remove(r.id)}>Delete</button></td>
                  </tr>
                ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
