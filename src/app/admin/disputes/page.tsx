'use client';

import React, { useEffect, useState } from 'react';
import { getDocs, collection, doc, updateDoc, addDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/client';
import styles from '../admin.table.module.css';

export default function AdminDisputesPage() {
  const [disputes, setDisputes] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ orderId: '', reason: '', description: '', resolution: 'refund' });
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    Promise.all([
      getDocs(collection(db, 'disputes')),
      getDocs(collection(db, 'orders')),
    ]).then(([dSnap, oSnap]) => {
      setDisputes(dSnap.docs.map(d => ({ id: d.id, ...d.data() })));
      setOrders(oSnap.docs.map(d => ({ id: d.id, ...d.data() })));
    }).finally(() => setLoading(false));
  }, []);

  const resolve = async (id: string, resolution: string) => {
    await updateDoc(doc(db, 'disputes', id), { status: 'resolved', resolution, resolvedAt: new Date().toISOString() });
    setDisputes(prev => prev.map(d => d.id === id ? { ...d, status: 'resolved', resolution } : d));
    setMsg('Dispute resolved'); setTimeout(() => setMsg(''), 2000);
  };

  const createDispute = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const ref = await addDoc(collection(db, 'disputes'), { ...form, status: 'open', createdAt: new Date().toISOString() });
      await updateDoc(ref, { id: ref.id });
      setDisputes(prev => [{ id: ref.id, ...form, status: 'open', createdAt: new Date().toISOString() }, ...prev]);
      setShowForm(false);
      setForm({ orderId: '', reason: '', description: '', resolution: 'refund' });
    } finally { setSaving(false); }
  };

  const sc = (s: string) => s === 'open' ? '#92400e' : s === 'resolved' ? '#15803d' : '#374151';

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div><h1 className={styles.title}>Disputes & Arbitration</h1><p className={styles.sub}>{disputes.filter(d=>d.status==='open').length} open disputes</p></div>
        <button className={styles.btnPrimary} onClick={() => setShowForm(s => !s)}>+ Open Dispute</button>
      </div>

      {msg && <div className={styles.successBanner}>✓ {msg}</div>}

      {showForm && (
        <div style={{ background: '#fff', border: '1px solid #e8eaed', borderRadius: 10, padding: '1.25rem' }}>
          <h2 style={{ fontSize: '0.875rem', fontWeight: 700, marginBottom: '1rem' }}>Open New Dispute</h2>
          <form onSubmit={createDispute} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#555' }}>Order</label>
                <select style={{ padding: '0.55rem', border: '1px solid #ddd', borderRadius: 6, fontFamily: 'inherit', fontSize: '0.875rem' }} value={form.orderId} onChange={e => setForm(f => ({ ...f, orderId: e.target.value }))}>
                  <option value="">Select order</option>
                  {orders.map(o => <option key={o.id} value={o.id}>#{o.id.slice(0,8).toUpperCase()} — ${o.totalAmount}</option>)}
                </select>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#555' }}>Reason</label>
                <select style={{ padding: '0.55rem', border: '1px solid #ddd', borderRadius: 6, fontFamily: 'inherit', fontSize: '0.875rem' }} value={form.reason} onChange={e => setForm(f => ({ ...f, reason: e.target.value }))}>
                  <option value="">Select reason</option>
                  <option value="not_received">Item not received</option>
                  <option value="not_as_described">Not as described</option>
                  <option value="damaged">Item damaged</option>
                  <option value="fraud">Suspected fraud</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
              <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#555' }}>Description</label>
              <textarea rows={3} style={{ padding: '0.55rem', border: '1px solid #ddd', borderRadius: 6, fontFamily: 'inherit', fontSize: '0.875rem', resize: 'vertical' }} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Describe the dispute..." />
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
              <button type="button" onClick={() => setShowForm(false)} style={{ padding: '0.5rem 1rem', border: '1px solid #ddd', borderRadius: 6, background: 'transparent', cursor: 'pointer', fontFamily: 'inherit' }}>Cancel</button>
              <button type="submit" className={styles.btnPrimary} disabled={saving}>{saving ? 'Saving...' : 'Open Dispute'}</button>
            </div>
          </form>
        </div>
      )}

      <div className={styles.tableCard}>
        {loading ? <div className={styles.loading}>Loading disputes...</div> :
          disputes.length === 0 ? <div className={styles.loading}>No disputes yet. 🎉</div> : (
            <table className={styles.table}>
              <thead><tr><th>Order</th><th>Reason</th><th>Description</th><th>Status</th><th>Actions</th></tr></thead>
              <tbody>
                {disputes.map(d => (
                  <tr key={d.id}>
                    <td><span className={styles.orderId}>{d.orderId ? `#${d.orderId.slice(0,8).toUpperCase()}` : '—'}</span></td>
                    <td style={{ textTransform: 'capitalize', fontSize: '0.78rem' }}>{d.reason?.replace(/_/g, ' ') || '—'}</td>
                    <td className={styles.muted} style={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{d.description || '—'}</td>
                    <td><span className={styles.pill} style={{ color: sc(d.status), background: sc(d.status) + '18' }}>{d.status}</span></td>
                    <td>
                      {d.status === 'open' && (
                        <div className={styles.actions}>
                          <button className={styles.btnGreen} onClick={() => resolve(d.id, 'refund')}>Refund</button>
                          <button className={styles.btnBlue} onClick={() => resolve(d.id, 'seller_wins')}>Seller Wins</button>
                          <button className={styles.btnRed} onClick={() => resolve(d.id, 'dismissed')}>Dismiss</button>
                        </div>
                      )}
                      {d.status === 'resolved' && <span style={{ fontSize: '0.75rem', color: '#888' }}>{d.resolution}</span>}
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
