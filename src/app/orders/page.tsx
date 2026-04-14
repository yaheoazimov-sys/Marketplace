'use client';

import React, { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import Navbar from '@/components/Navbar';
import styles from './orders.module.css';

export const STATUS_META: Record<string, { label: string; color: string; bg: string }> = {
  pending:    { label: 'Pending',    color: '#92400e', bg: '#fef3c7' },
  confirmed:  { label: 'Confirmed',  color: '#1e40af', bg: '#dbeafe' },
  processing: { label: 'Processing', color: '#5b21b6', bg: '#ede9fe' },
  shipped:    { label: 'Shipped',    color: '#065f46', bg: '#d1fae5' },
  delivered:  { label: 'Delivered',  color: '#14532d', bg: '#bbf7d0' },
  cancelled:  { label: 'Cancelled',  color: '#7f1d1d', bg: '#fee2e2' },
  refunded:   { label: 'Refunded',   color: '#374151', bg: '#f3f4f6' },
  paid:       { label: 'Paid',       color: '#14532d', bg: '#bbf7d0' },
};

export default function OrdersPage() {
  return (
    <ProtectedRoute>
      <OrdersContent />
    </ProtectedRoute>
  );
}

function OrdersContent() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortBy, setSortBy] = useState('newest');

  useEffect(() => {
    if (!user) return;
    (async () => {
      try {
        const token = await user.getIdToken();
        const res = await fetch('/api/orders', { headers: { Authorization: `Bearer ${token}` } });
        const d = await res.json();
        setOrders(d.orders || []);
      } catch { setOrders([]); }
      finally { setLoading(false); }
    })();
  }, [user]);

  const filtered = useMemo(() => {
    let list = [...orders];
    if (search) list = list.filter(o =>
      o.id.toLowerCase().includes(search.toLowerCase()) ||
      o.shippingAddress?.toLowerCase().includes(search.toLowerCase())
    );
    if (filterStatus !== 'all') list = list.filter(o => o.status === filterStatus);
    if (sortBy === 'newest') list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    else if (sortBy === 'oldest') list.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    else if (sortBy === 'amount_desc') list.sort((a, b) => b.totalAmount - a.totalAmount);
    return list;
  }, [orders, search, filterStatus, sortBy]);

  const totalSpent = orders
    .filter(o => !['cancelled', 'refunded'].includes(o.status))
    .reduce((s, o) => s + (o.totalAmount || 0), 0);

  const sm = (s: string) => STATUS_META[s] || { label: s, color: '#374151', bg: '#f3f4f6' };

  return (
    <>
      <Navbar />
      <div className={styles.page}>
        <div className={styles.container}>

          <div className={styles.header}>
            <div>
              <h1 className={styles.title}>My Orders</h1>
              <p className={styles.subtitle}>{orders.length} orders · ${totalSpent.toFixed(2)} total spent</p>
            </div>
            <Link href="/" className={styles.btnOutline}>← Continue Shopping</Link>
          </div>

          <div className={styles.filters}>
            <div className={styles.searchWrap}>
              <span className={styles.searchIcon}>🔍</span>
              <input className={styles.searchInput} placeholder="Search by order ID or address..." value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <select className={styles.select} value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
              <option value="all">All Statuses</option>
              {Object.entries(STATUS_META).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
            </select>
            <select className={styles.select} value={sortBy} onChange={e => setSortBy(e.target.value)}>
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="amount_desc">Highest Amount</option>
            </select>
          </div>

          {loading ? (
            <div className={styles.skeletons}>
              {Array(4).fill(null).map((_, i) => <div key={i} className={styles.skeleton} />)}
            </div>
          ) : filtered.length === 0 ? (
            <div className={styles.empty}>
              <span className={styles.emptyIcon}>📦</span>
              <p className={styles.emptyText}>{orders.length === 0 ? "You haven't placed any orders yet." : 'No orders match your filters.'}</p>
              {orders.length === 0 && <Link href="/" className={styles.btnPrimary}>Start Shopping</Link>}
            </div>
          ) : (
            <div className={styles.list}>
              {filtered.map(o => {
                const meta = sm(o.status);
                const date = new Date(o.createdAt);
                const itemCount = o.items?.reduce((s: number, i: any) => s + (i.quantity || 1), 0) || 0;
                return (
                  <Link href={`/orders/${o.id}`} key={o.id} className={styles.orderCard}>
                    <div className={styles.orderTop}>
                      <div className={styles.orderLeft}>
                        <span className={styles.orderId}>#{o.id.slice(0, 8).toUpperCase()}</span>
                        <span className={styles.orderDate}>
                          {date.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                          {' · '}
                          {date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <span className={styles.statusPill} style={{ color: meta.color, background: meta.bg }}>
                        {meta.label}
                      </span>
                    </div>

                    <div className={styles.orderMid}>
                      <div className={styles.orderImages}>
                        {o.items?.slice(0, 4).map((item: any, i: number) => (
                          item.image
                            ? <img key={i} src={item.image} alt={item.title} className={styles.itemThumb} />
                            : <div key={i} className={styles.itemThumbPlaceholder}>{item.title?.[0]}</div>
                        ))}
                        {(o.items?.length || 0) > 4 && <div className={styles.itemThumbMore}>+{o.items.length - 4}</div>}
                      </div>
                      <div className={styles.orderSummary}>
                        <p className={styles.orderItems}>{itemCount} item{itemCount !== 1 ? 's' : ''}</p>
                        <p className={styles.orderAddr}>{o.shippingAddress?.split('\n')[0] || '—'}</p>
                      </div>
                    </div>

                    <div className={styles.orderBottom}>
                      <span className={styles.orderTotal}>${Number(o.totalAmount).toFixed(2)}</span>
                      <span className={styles.viewLink}>View details →</span>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
