'use client';

import React, { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { getOrders, updateOrderStatus } from '@/lib/firebase/firestore';
import styles from '../seller.page.module.css';
import tableStyles from './orders.module.css';

const STATUS_META: Record<string, { label: string; color: string; bg: string }> = {
  pending:    { label: 'Pending',    color: '#92400e', bg: '#fef3c7' },
  confirmed:  { label: 'Confirmed',  color: '#1e40af', bg: '#dbeafe' },
  processing: { label: 'Processing', color: '#5b21b6', bg: '#ede9fe' },
  shipped:    { label: 'Shipped',    color: '#065f46', bg: '#d1fae5' },
  delivered:  { label: 'Delivered',  color: '#14532d', bg: '#bbf7d0' },
  cancelled:  { label: 'Cancelled',  color: '#b91c1c', bg: '#fee2e2' },
  paid:       { label: 'Paid',       color: '#14532d', bg: '#bbf7d0' },
};

export default function SellerOrders() {
  const { user, profile } = useAuth();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [updatingId, setUpdatingId] = useState('');

  useEffect(() => {
    if (!user) return;
    getOrders(user.uid, profile?.role || 'seller').then(setOrders).finally(() => setLoading(false));
  }, [user, profile]);

  const filtered = useMemo(() => {
    let list = [...orders];
    if (search) list = list.filter(o => o.id.toLowerCase().includes(search.toLowerCase()) || o.shippingAddress?.toLowerCase().includes(search.toLowerCase()));
    if (filterStatus !== 'all') list = list.filter(o => o.status === filterStatus);
    return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [orders, search, filterStatus]);

  const handleStatus = async (id: string, status: string) => {
    setUpdatingId(id);
    try {
      await updateOrderStatus(id, status);
      setOrders(prev => prev.map(o => o.id === id ? { ...o, status } : o));
    } finally { setUpdatingId(''); }
  };

  const sm = (s: string) => STATUS_META[s] || { label: s, color: '#374151', bg: '#f3f4f6' };

  return (
    <div>
      <div className={styles.welcome}>
        <div>
          <h1 className={styles.title}>Orders</h1>
          <p className={styles.subtitle}>{orders.length} total orders</p>
        </div>
      </div>

      <div className={tableStyles.toolbar}>
        <div className={tableStyles.searchWrap}>
          <span>🔍</span>
          <input className={tableStyles.searchInput} placeholder="Search by order ID or address..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select className={tableStyles.select} value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
          <option value="all">All Statuses</option>
          {Object.entries(STATUS_META).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
        </select>
      </div>

      <div className={tableStyles.card}>
        {loading ? (
          <div className={tableStyles.loading}>Loading orders...</div>
        ) : filtered.length === 0 ? (
          <div className={tableStyles.empty}>No orders found.</div>
        ) : (
          <div className={tableStyles.tableWrap}>
            <table className={tableStyles.table}>
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Date</th>
                  <th>Items</th>
                  <th>Address</th>
                  <th>Total</th>
                  <th>Status</th>
                  <th>Update</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(o => {
                  const meta = sm(o.status);
                  return (
                    <tr key={o.id}>
                      <td><Link href={`/orders/${o.id}`} className={tableStyles.orderId}>#{o.id.slice(0,8).toUpperCase()}</Link></td>
                      <td className={tableStyles.muted}>{new Date(o.createdAt).toLocaleDateString()}</td>
                      <td>{o.items?.length || 0} items</td>
                      <td className={tableStyles.addr}>{o.shippingAddress?.split('\n')[0] || '—'}</td>
                      <td className={tableStyles.amount}>${Number(o.totalAmount).toFixed(2)}</td>
                      <td><span className={tableStyles.pill} style={{ color: meta.color, background: meta.bg }}>{meta.label}</span></td>
                      <td>
                        <select
                          className={tableStyles.statusSelect}
                          value={o.status}
                          disabled={updatingId === o.id}
                          onChange={e => handleStatus(o.id, e.target.value)}
                        >
                          {Object.entries(STATUS_META).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                        </select>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
