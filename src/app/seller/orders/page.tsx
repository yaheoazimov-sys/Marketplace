'use client';

import React, { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { getOrders } from '@/lib/firebase/firestore';
import styles from './orders.module.css';

const STATUS: Record<string, { label: string; color: string; bg: string }> = {
  pending:    { label: 'Pending',    color: '#92400e', bg: '#fef3c7' },
  confirmed:  { label: 'Confirmed',  color: '#1e40af', bg: '#dbeafe' },
  processing: { label: 'Processing', color: '#5b21b6', bg: '#ede9fe' },
  shipped:    { label: 'Shipped',    color: '#065f46', bg: '#d1fae5' },
  delivered:  { label: 'Delivered',  color: '#14532d', bg: '#bbf7d0' },
  cancelled:  { label: 'Cancelled',  color: '#991b1b', bg: '#fee2e2' },
  paid:       { label: 'Paid',       color: '#14532d', bg: '#bbf7d0' },
  refunded:   { label: 'Refunded',   color: '#374151', bg: '#f3f4f6' },
};

export default function SellerOrdersPage() {
  const { user, profile } = useAuth();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sort, setSort] = useState('newest');

  useEffect(() => {
    if (!user) return;
    getOrders(user.uid, profile?.role || 'seller')
      .then(setOrders)
      .finally(() => setLoading(false));
  }, [user, profile]);

  const filtered = useMemo(() => {
    let list = [...orders];
    if (search) list = list.filter(o =>
      o.id.toLowerCase().includes(search.toLowerCase()) ||
      o.shippingAddress?.toLowerCase().includes(search.toLowerCase())
    );
    if (statusFilter !== 'all') list = list.filter(o => o.status === statusFilter);
    if (sort === 'newest') list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    else if (sort === 'oldest') list.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    else if (sort === 'amount') list.sort((a, b) => b.totalAmount - a.totalAmount);
    return list;
  }, [orders, search, statusFilter, sort]);

  const sm = (s: string) => STATUS[s] || { label: s, color: '#374151', bg: '#f3f4f6' };

  const totalRevenue = orders.filter(o => ['paid','delivered'].includes(o.status)).reduce((s, o) => s + (o.totalAmount || 0), 0);

  return (
    <div className={styles.page}>
      {/* Header */}
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Orders</h1>
          <p className={styles.subtitle}>{orders.length} total · ${totalRevenue.toFixed(2)} revenue</p>
        </div>
      </div>

      {/* Status tabs */}
      <div className={styles.tabs}>
        {['all', 'pending', 'processing', 'shipped', 'delivered', 'cancelled'].map(s => (
          <button
            key={s}
            className={`${styles.tab} ${statusFilter === s ? styles.tabActive : ''}`}
            onClick={() => setStatusFilter(s)}
          >
            {s === 'all' ? 'All' : sm(s).label}
            <span className={styles.tabCount}>
              {s === 'all' ? orders.length : orders.filter(o => o.status === s).length}
            </span>
          </button>
        ))}
      </div>

      {/* Toolbar */}
      <div className={styles.toolbar}>
        <div className={styles.searchWrap}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#aaa" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
          <input className={styles.searchInput} placeholder="Search by order ID or address..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select className={styles.select} value={sort} onChange={e => setSort(e.target.value)}>
          <option value="newest">Newest first</option>
          <option value="oldest">Oldest first</option>
          <option value="amount">Highest amount</option>
        </select>
      </div>

      {/* Table */}
      <div className={styles.tableCard}>
        {loading ? (
          <div className={styles.skeletons}>{Array(5).fill(null).map((_, i) => <div key={i} className={styles.skeleton} />)}</div>
        ) : filtered.length === 0 ? (
          <div className={styles.empty}>
            <span>📋</span>
            <p>{orders.length === 0 ? 'No orders yet.' : 'No orders match your filters.'}</p>
          </div>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Order</th>
                <th>Date</th>
                <th>Customer</th>
                <th>Items</th>
                <th>Address</th>
                <th>Total</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(o => {
                const meta = sm(o.status);
                const itemCount = o.items?.reduce((s: number, i: any) => s + (i.quantity || 1), 0) || 0;
                return (
                  <tr key={o.id} className={styles.row}>
                    <td>
                      <span className={styles.orderId}>#{o.id.slice(0, 8).toUpperCase()}</span>
                    </td>
                    <td className={styles.dateCell}>
                      <span>{new Date(o.createdAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short' })}</span>
                      <span className={styles.time}>{new Date(o.createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</span>
                    </td>
                    <td className={styles.customerCell}>
                      <div className={styles.avatar}>{o.shippingAddress?.[0]?.toUpperCase() || '?'}</div>
                      <span className={styles.customerName}>{o.shippingAddress?.split('\n')[0] || 'Customer'}</span>
                    </td>
                    <td>
                      <div className={styles.itemsCell}>
                        {o.items?.slice(0, 3).map((item: any, i: number) => (
                          item.image
                            ? <img key={i} src={item.image} alt="" className={styles.itemThumb} />
                            : <div key={i} className={styles.itemThumbPlaceholder}>{item.title?.[0]}</div>
                        ))}
                        <span className={styles.itemCount}>{itemCount} item{itemCount !== 1 ? 's' : ''}</span>
                      </div>
                    </td>
                    <td className={styles.addrCell}>{o.shippingAddress?.split('\n').slice(1, 3).join(', ') || '—'}</td>
                    <td className={styles.amountCell}>${Number(o.totalAmount).toFixed(2)}</td>
                    <td>
                      <span className={styles.pill} style={{ color: meta.color, background: meta.bg }}>{meta.label}</span>
                    </td>
                    <td>
                      <Link href={`/seller/orders/${o.id}`} className={styles.viewBtn}>View →</Link>
                    </td>
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

