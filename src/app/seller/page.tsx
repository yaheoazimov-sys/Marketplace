'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { getProducts, getOrders } from '@/lib/firebase/firestore';
import styles from './seller.page.module.css';

export default function SellerHome() {
  const { user, profile } = useAuth();
  const [products, setProducts] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    Promise.all([
      getProducts({ sellerId: user.uid }),
      getOrders(user.uid, profile?.role || 'seller'),
    ]).then(([p, o]) => {
      setProducts(p);
      setOrders(o);
    }).finally(() => setLoading(false));
  }, [user, profile]);

  const revenue = orders.filter(o => ['paid','delivered'].includes(o.status)).reduce((s, o) => s + (o.totalAmount || 0), 0);
  const newOrders = orders.filter(o => o.status === 'pending' || o.status === 'confirmed');
  const processing = orders.filter(o => o.status === 'processing');
  const shipped = orders.filter(o => o.status === 'shipped');
  const activeProducts = products.filter(p => p.status === 'active');
  const lowStock = products.filter(p => p.stock <= 5 && p.stock > 0);
  const outOfStock = products.filter(p => p.stock === 0);

  const recentOrders = [...orders].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 5);

  const statusColor = (s: string) => ({ paid: '#15803d', delivered: '#15803d', pending: '#92400e', confirmed: '#1e40af', processing: '#5b21b6', shipped: '#065f46', cancelled: '#b91c1c' }[s] || '#374151');
  const statusBg = (s: string) => statusColor(s) + '18';

  if (loading) return <div className={styles.loading}>Loading dashboard...</div>;

  return (
    <div className={styles.page}>
      {/* Welcome */}
      <div className={styles.welcome}>
        <div>
          <h1 className={styles.title}>Welcome back, {profile?.displayName?.split(' ')[0] || 'Seller'} 👋</h1>
          <p className={styles.subtitle}>Here's what's happening in your store today.</p>
        </div>
        <Link href="/seller/products/new" className={styles.addBtn}>+ Add Product</Link>
      </div>

      {/* Stats */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <p className={styles.statLabel}>Total Revenue</p>
          <p className={styles.statVal}>${revenue.toFixed(2)}</p>
          <p className={styles.statSub}>{orders.filter(o=>['paid','delivered'].includes(o.status)).length} paid orders</p>
        </div>
        <div className={styles.statCard}>
          <p className={styles.statLabel}>Total Orders</p>
          <p className={styles.statVal}>{orders.length}</p>
          <p className={styles.statSub}>{newOrders.length} new</p>
        </div>
        <div className={styles.statCard}>
          <p className={styles.statLabel}>Products</p>
          <p className={styles.statVal}>{products.length}</p>
          <p className={styles.statSub}>{activeProducts.length} active</p>
        </div>
        <div className={styles.statCard}>
          <p className={styles.statLabel}>Low Stock</p>
          <p className={styles.statVal} style={{ color: lowStock.length > 0 ? '#ef4444' : '#111' }}>{lowStock.length + outOfStock.length}</p>
          <p className={styles.statSub}>{outOfStock.length} out of stock</p>
        </div>
      </div>

      {/* Setup checklist if no products */}
      {products.length === 0 && (
        <div className={styles.setupCard}>
          <h2 className={styles.setupTitle}>🎉 Get started selling</h2>
          <div className={styles.setupSteps}>
            <div className={styles.setupStep}>
              <div className={styles.setupIcon}>📦</div>
              <div>
                <p className={styles.setupStepTitle}>Add your first product</p>
                <p className={styles.setupStepDesc}>Fill your store with products to start selling.</p>
              </div>
              <Link href="/seller/products/new" className={styles.setupBtn}>Add Product</Link>
            </div>
            <div className={styles.setupStep}>
              <div className={styles.setupIcon}>🎨</div>
              <div>
                <p className={styles.setupStepTitle}>Customize your store</p>
                <p className={styles.setupStepDesc}>Set up your store name and branding.</p>
              </div>
              <Link href="/seller/settings" className={styles.setupBtnOutline}>Settings</Link>
            </div>
          </div>
        </div>
      )}

      <div className={styles.bottomGrid}>
        {/* Recent Orders */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h2 className={styles.cardTitle}>Recent Orders</h2>
            <Link href="/seller/orders" className={styles.cardLink}>View all →</Link>
          </div>
          {recentOrders.length === 0 ? (
            <p className={styles.empty}>No orders yet.</p>
          ) : (
            <table className={styles.table}>
              <thead><tr><th>Order</th><th>Date</th><th>Amount</th><th>Status</th></tr></thead>
              <tbody>
                {recentOrders.map(o => (
                  <tr key={o.id}>
                    <td><Link href={`/orders/${o.id}`} className={styles.orderId}>#{o.id.slice(0,8).toUpperCase()}</Link></td>
                    <td className={styles.dateCell}>{new Date(o.createdAt).toLocaleDateString()}</td>
                    <td className={styles.amountCell}>${Number(o.totalAmount).toFixed(2)}</td>
                    <td><span className={styles.pill} style={{ color: statusColor(o.status), background: statusBg(o.status) }}>{o.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Order Status Summary */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h2 className={styles.cardTitle}>Orders by Status</h2>
          </div>
          <div className={styles.statusList}>
            {[
              { label: 'New Orders', count: newOrders.length, color: '#92400e', bg: '#fef3c7' },
              { label: 'Processing', count: processing.length, color: '#5b21b6', bg: '#ede9fe' },
              { label: 'Shipped', count: shipped.length, color: '#065f46', bg: '#d1fae5' },
              { label: 'Delivered', count: orders.filter(o=>o.status==='delivered').length, color: '#14532d', bg: '#bbf7d0' },
              { label: 'Cancelled', count: orders.filter(o=>o.status==='cancelled').length, color: '#b91c1c', bg: '#fee2e2' },
            ].map(s => (
              <div key={s.label} className={styles.statusRow}>
                <div className={styles.statusLeft}>
                  <span className={styles.statusDot} style={{ background: s.color }} />
                  <span className={styles.statusLabel}>{s.label}</span>
                </div>
                <div className={styles.statusRight}>
                  <span className={styles.statusCount} style={{ color: s.color, background: s.bg }}>{s.count}</span>
                  <Link href="/seller/orders" className={styles.statusArrow}>›</Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
