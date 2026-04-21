'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { getDocs, collection, query, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase/client';
import styles from './admin.page.module.css';

export default function AdminDashboardPage() {
  const [stats, setStats] = useState({ users: 0, sellers: 0, buyers: 0, products: 0, orders: 0, revenue: 0, pending: 0, ads: 0 });
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [topProducts, setTopProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [usersSnap, productsSnap, ordersSnap, adsSnap] = await Promise.all([
          getDocs(collection(db, 'users')),
          getDocs(collection(db, 'products')),
          getDocs(collection(db, 'orders')),
          getDocs(collection(db, 'ads')),
        ]);

        const users = usersSnap.docs.map(d => d.data());
        const orders = ordersSnap.docs.map(d => ({ id: d.id, ...d.data() })) as any[];
        const products = productsSnap.docs.map(d => ({ id: d.id, ...d.data() })) as any[];

        const revenue = orders.filter(o => ['paid','delivered','confirmed'].includes(o.status)).reduce((s, o) => s + (o.totalAmount || 0), 0);
        const pending = orders.filter(o => o.status === 'pending').length;

        setStats({
          users: users.length,
          sellers: users.filter(u => u.role === 'seller').length,
          buyers: users.filter(u => u.role === 'client').length,
          products: products.length,
          orders: orders.length,
          revenue,
          pending,
          ads: adsSnap.docs.filter(d => d.data().status === 'pending').length,
        });

        setRecentOrders(orders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 6));
        setTopProducts(products.sort((a, b) => (b.reviewCount || 0) - (a.reviewCount || 0)).slice(0, 5));
      } finally { setLoading(false); }
    }
    load();
  }, []);

  const sc = (s: string) => ({ paid: '#15803d', delivered: '#15803d', confirmed: '#1e40af', pending: '#92400e', cancelled: '#991b1b', processing: '#5b21b6', shipped: '#065f46' }[s] || '#374151');

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>Dashboard</h1>
        <p className={styles.sub}>Platform overview</p>
      </div>

      {/* KPI Stats */}
      <div className={styles.kpiGrid}>
        <div className={styles.kpi}><p className={styles.kpiLabel}>Total Revenue</p><p className={styles.kpiVal}>${stats.revenue.toLocaleString('en', { minimumFractionDigits: 2 })}</p><p className={styles.kpiSub}>GMV all time</p></div>
        <div className={styles.kpi}><p className={styles.kpiLabel}>Total Orders</p><p className={styles.kpiVal}>{stats.orders}</p><p className={styles.kpiSub} style={{ color: stats.pending > 0 ? '#f59e0b' : '#888' }}>{stats.pending} pending</p></div>
        <div className={styles.kpi}><p className={styles.kpiLabel}>Users</p><p className={styles.kpiVal}>{stats.users}</p><p className={styles.kpiSub}>{stats.sellers} sellers · {stats.buyers} buyers</p></div>
        <div className={styles.kpi}><p className={styles.kpiLabel}>Products</p><p className={styles.kpiVal}>{stats.products}</p><p className={styles.kpiSub}>Active listings</p></div>
        {stats.ads > 0 && <div className={styles.kpi} style={{ borderColor: '#f59e0b' }}><p className={styles.kpiLabel}>Pending Ads</p><p className={styles.kpiVal} style={{ color: '#f59e0b' }}>{stats.ads}</p><Link href="/admin/ads" className={styles.kpiLink}>Review →</Link></div>}
      </div>

      {/* Quick actions */}
      <div className={styles.quickActions}>
        <Link href="/admin/users" className={styles.qa}><span>👥</span> Manage Users</Link>
        <Link href="/admin/products" className={styles.qa}><span>📦</span> Moderate Products</Link>
        <Link href="/admin/orders" className={styles.qa}><span>🧾</span> All Orders</Link>
        <Link href="/admin/ads" className={styles.qa}><span>📢</span> Ad Approvals {stats.ads > 0 && <span className={styles.qaBadge}>{stats.ads}</span>}</Link>
        <Link href="/admin/disputes" className={styles.qa}><span>⚖️</span> Disputes</Link>
        <Link href="/admin/finance" className={styles.qa}><span>💰</span> Finance</Link>
      </div>

      <div className={styles.bottomGrid}>
        {/* Recent Orders */}
        <div className={styles.card}>
          <div className={styles.cardHead}><h2 className={styles.cardTitle}>Recent Orders</h2><Link href="/admin/orders" className={styles.cardLink}>View all →</Link></div>
          {loading ? <div className={styles.loading}>Loading...</div> : (
            <table className={styles.table}>
              <thead><tr><th>Order</th><th>Date</th><th>Amount</th><th>Status</th></tr></thead>
              <tbody>
                {recentOrders.map(o => (
                  <tr key={o.id}>
                    <td><Link href={`/orders/${o.id}`} className={styles.orderId}>#{o.id.slice(0,8).toUpperCase()}</Link></td>
                    <td className={styles.muted}>{new Date(o.createdAt).toLocaleDateString()}</td>
                    <td className={styles.amount}>${Number(o.totalAmount).toFixed(2)}</td>
                    <td><span className={styles.pill} style={{ color: sc(o.status), background: sc(o.status) + '18' }}>{o.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Top Products */}
        <div className={styles.card}>
          <div className={styles.cardHead}><h2 className={styles.cardTitle}>Top Products</h2><Link href="/admin/products" className={styles.cardLink}>View all →</Link></div>
          {loading ? <div className={styles.loading}>Loading...</div> : (
            <div className={styles.productList}>
              {topProducts.map((p, i) => (
                <div key={p.id} className={styles.productRow}>
                  <span className={styles.rank}>#{i + 1}</span>
                  {p.images?.[0] && <img src={p.images[0]} alt="" className={styles.productThumb} />}
                  <div className={styles.productInfo}>
                    <p className={styles.productName}>{p.title}</p>
                    <p className={styles.productMeta}>{p.reviewCount || 0} reviews · ${p.price}</p>
                  </div>
                  <span className={styles.productRating}>★ {p.rating?.toFixed(1) || '—'}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
