'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { getProducts, getOrders } from '@/lib/firebase/firestore';
import styles from './home.module.css';

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
    ]).then(([p, o]) => { setProducts(p); setOrders(o); }).finally(() => setLoading(false));
  }, [user, profile]);

  const revenue = orders.filter(o => ['paid','delivered'].includes(o.status)).reduce((s, o) => s + (o.totalAmount || 0), 0);
  const newOrders = orders.filter(o => o.status === 'pending');
  const processing = orders.filter(o => o.status === 'processing' || o.status === 'confirmed');
  const readyToShip = orders.filter(o => o.status === 'shipped');

  return (
    <div className={styles.page}>
      {/* Welcome + Setup */}
      <div className={styles.mainCol}>
        {products.length === 0 && (
          <div className={styles.welcomeCard}>
            <h2 className={styles.welcomeTitle}>Congratulations on registering! 🎉</h2>
            <div className={styles.setupForm}>
              <p className={styles.setupStep}>Store Setup <span className={styles.stepBadge}>Step 1 of 2</span></p>
              <div className={styles.field}><label>Store name</label><input defaultValue="My Store" /></div>
              <div className={styles.field}><label>Store email</label><input defaultValue={profile?.email || ''} /></div>
              <div className={styles.field}><label>Your name</label><input defaultValue={profile?.displayName || ''} /></div>
              <div className={styles.field}><label>Phone</label><input placeholder="+1" /></div>
              <button className={styles.saveBtn}>Save</button>
            </div>

            <div className={styles.tips}>
              <p className={styles.tipsTitle}>Follow our tips to start selling</p>
              <div className={styles.tipCard}>
                <span className={styles.tipIcon}>📦</span>
                <div>
                  <p className={styles.tipTitle}>Add your first product</p>
                  <p className={styles.tipDesc}>Filling your store with products is the first step to launching it. Add your product and see how it looks on the site.</p>
                </div>
              </div>
              <div className={styles.tipActions}>
                <Link href="/seller/products/new" className={styles.tipBtn}>Add Product</Link>
                <button className={styles.tipSkip}>Skip</button>
              </div>
            </div>
          </div>
        )}

        {products.length > 0 && (
          <div className={styles.recentCard}>
            <div className={styles.cardHeader}>
              <h3 className={styles.cardTitle}>Recent Products</h3>
              <Link href="/seller/products" className={styles.cardLink}>All products →</Link>
            </div>
            <table className={styles.table}>
              <thead><tr><th>Product</th><th>Price</th><th>Stock</th><th>Status</th></tr></thead>
              <tbody>
                {products.slice(0, 5).map(p => (
                  <tr key={p.id}>
                    <td className={styles.productCell}>
                      {p.images?.[0] && <img src={p.images[0]} alt="" className={styles.thumb} />}
                      <span>{p.title}</span>
                    </td>
                    <td>${Number(p.price).toFixed(2)}</td>
                    <td style={{ color: p.stock === 0 ? '#ef4444' : '#333' }}>{p.stock}</td>
                    <td><span className={styles.pill} style={{ background: p.status === 'active' ? '#dcfce7' : '#f3f4f6', color: p.status === 'active' ? '#15803d' : '#6b7280' }}>{p.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Right panel — Stats */}
      <div className={styles.sideCol}>
        <div className={styles.statsCard}>
          <div className={styles.statsHeader}>
            <span className={styles.statsTitle}>Store Metrics</span>
            <span className={styles.statsDate}>Today</span>
          </div>
          <div className={styles.statsGrid}>
            <div className={styles.statItem}>
              <p className={styles.statVal}>{loading ? '—' : orders.length}</p>
              <p className={styles.statLabel}>Orders</p>
            </div>
            <div className={styles.statItem}>
              <p className={styles.statVal}>{loading ? '—' : products.length}</p>
              <p className={styles.statLabel}>Products</p>
            </div>
            <div className={styles.statItem}>
              <p className={styles.statVal}>${loading ? '0' : revenue.toFixed(0)}</p>
              <p className={styles.statLabel}>Revenue</p>
            </div>
            <div className={styles.statItem}>
              <p className={styles.statVal}>{loading ? '0' : orders.length > 0 ? ((orders.filter(o=>['paid','delivered'].includes(o.status)).length / orders.length) * 100).toFixed(0) + '%' : '0%'}</p>
              <p className={styles.statLabel}>Conversion</p>
            </div>
          </div>
        </div>

        <div className={styles.ordersCard}>
          <div className={styles.cardHeader}>
            <span className={styles.cardTitle}>Orders</span>
            <Link href="/seller/orders" className={styles.cardLink}>›</Link>
          </div>
          <Link href="/seller/orders?status=pending" className={styles.orderRow}>
            <div className={styles.orderRowLeft}>
              <span className={styles.orderDot} style={{ background: '#ef4444' }} />
              <span className={styles.orderLabel}>New orders</span>
            </div>
            <div className={styles.orderRowRight}>
              <span className={styles.orderCount}>{newOrders.length}</span>
              <span className={styles.orderAmount}>${newOrders.reduce((s,o)=>s+(o.totalAmount||0),0).toFixed(0)}</span>
              <span className={styles.orderArrow}>›</span>
            </div>
          </Link>
          <Link href="/seller/orders?status=processing" className={styles.orderRow}>
            <div className={styles.orderRowLeft}>
              <span className={styles.orderDot} style={{ background: '#f59e0b' }} />
              <span className={styles.orderLabel}>Processing</span>
            </div>
            <div className={styles.orderRowRight}>
              <span className={styles.orderCount}>{processing.length}</span>
              <span className={styles.orderAmount}>${processing.reduce((s,o)=>s+(o.totalAmount||0),0).toFixed(0)}</span>
              <span className={styles.orderArrow}>›</span>
            </div>
          </Link>
          <Link href="/seller/orders?status=shipped" className={styles.orderRow}>
            <div className={styles.orderRowLeft}>
              <span className={styles.orderDot} style={{ background: '#22c55e' }} />
              <span className={styles.orderLabel}>Ready to ship</span>
            </div>
            <div className={styles.orderRowRight}>
              <span className={styles.orderCount}>{readyToShip.length}</span>
              <span className={styles.orderAmount}>${readyToShip.reduce((s,o)=>s+(o.totalAmount||0),0).toFixed(0)}</span>
              <span className={styles.orderArrow}>›</span>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}

