'use client';

import React, { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { getDocs, collection, doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/client';
import styles from '../admin.table.module.css';

const STATUS_META: Record<string, { color: string }> = {
  pending: { color: '#92400e' }, confirmed: { color: '#7c3aed' }, processing: { color: '#5b21b6' },
  shipped: { color: '#065f46' }, delivered: { color: '#14532d' }, cancelled: { color: '#991b1b' },
  paid: { color: '#14532d' }, refunded: { color: '#374151' },
};

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    getDocs(collection(db, 'orders')).then(snap => {
      setOrders(snap.docs.map(d => ({ id: d.id, ...d.data() })).sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
    }).finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    let list = [...orders];
    if (search) list = list.filter(o => o.id.toLowerCase().includes(search.toLowerCase()) || o.shippingAddress?.toLowerCase().includes(search.toLowerCase()));
    if (statusFilter !== 'all') list = list.filter(o => o.status === statusFilter);
    return list;
  }, [orders, search, statusFilter]);

  const totalRevenue = orders.filter(o => ['paid','delivered','confirmed'].includes(o.status)).reduce((s, o) => s + (o.totalAmount || 0), 0);
  const sc = (s: string) => STATUS_META[s]?.color || '#374151';

  const updateStatus = async (id: string, status: string) => {
    await updateDoc(doc(db, 'orders', id), { status, updatedAt: new Date().toISOString() });
    setOrders(prev => prev.map(o => o.id === id ? { ...o, status } : o));
  };

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div><h1 className={styles.title}>All Orders</h1><p className={styles.sub}>{orders.length} orders · ${totalRevenue.toFixed(2)} revenue</p></div>
      </div>

      <div className={styles.stats}>
        {[['All', orders.length, 'all'], ['Pending', orders.filter(o=>o.status==='pending').length, 'pending'], ['Processing', orders.filter(o=>['confirmed','processing'].includes(o.status)).length, 'processing'], ['Shipped', orders.filter(o=>o.status==='shipped').length, 'shipped'], ['Delivered', orders.filter(o=>o.status==='delivered').length, 'delivered'], ['Cancelled', orders.filter(o=>o.status==='cancelled').length, 'cancelled']].map(([l, v, f]) => (
          <button key={String(f)} className={`${styles.statCard} ${statusFilter === f ? styles.statCardActive : ''}`} onClick={() => setStatusFilter(String(f))}>
            <span className={styles.statVal}>{v}</span><span className={styles.statLabel}>{l}</span>
          </button>
        ))}
      </div>

      <div className={styles.toolbar}>
        <div className={styles.searchWrap}><span>🔍</span><input className={styles.searchInput} placeholder="Search by order ID or address..." value={search} onChange={e => setSearch(e.target.value)} /></div>
      </div>

      <div className={styles.tableCard}>
        {loading ? <div className={styles.loading}>Loading orders...</div> : (
          <table className={styles.table}>
            <thead><tr><th>Order ID</th><th>Date</th><th>Items</th><th>Address</th><th>Total</th><th>Status</th><th>Update</th></tr></thead>
            <tbody>
              {filtered.length === 0 ? <tr><td colSpan={7} className={styles.empty}>No orders found</td></tr> :
                filtered.map(o => (
                  <tr key={o.id}>
                    <td><Link href={`/orders/${o.id}`} className={styles.orderId}>#{o.id.slice(0,8).toUpperCase()}</Link></td>
                    <td className={styles.muted}>{new Date(o.createdAt).toLocaleDateString()}</td>
                    <td>{o.items?.length || 0} items</td>
                    <td className={styles.muted} style={{ maxWidth: 140, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{o.shippingAddress?.split('\n')[0] || '—'}</td>
                    <td className={styles.amount}>${Number(o.totalAmount).toFixed(2)}</td>
                    <td><span className={styles.pill} style={{ color: sc(o.status), background: sc(o.status) + '18' }}>{o.status}</span></td>
                    <td>
                      <select className={styles.inlineSelect} value={o.status} onChange={e => updateStatus(o.id, e.target.value)}>
                        {['pending','confirmed','processing','shipped','delivered','cancelled','refunded'].map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
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

