'use client';

import React, { useEffect, useState } from 'react';
import { getDocs, collection } from 'firebase/firestore';
import { db } from '@/lib/firebase/client';
import styles from '../admin.page.module.css';
import tStyles from '../admin.table.module.css';

export default function AdminFinancePage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDocs(collection(db, 'orders')).then(snap => {
      setOrders(snap.docs.map(d => ({ id: d.id, ...d.data() })).sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
    }).finally(() => setLoading(false));
  }, []);

  const paid = orders.filter(o => ['paid','delivered','confirmed'].includes(o.status));
  const gmv = paid.reduce((s, o) => s + (o.totalAmount || 0), 0);
  const commission = gmv * 0.05; // 5% platform fee
  const avgOrder = paid.length ? gmv / paid.length : 0;

  const sc = (s: string) => ({ paid: '#15803d', delivered: '#14532d', confirmed: '#1e40af', pending: '#92400e', cancelled: '#991b1b', refunded: '#374151' }[s] || '#374151');

  return (
    <div className={styles.page}>
      <div className={styles.header}><h1 className={styles.title}>Finance & Transactions</h1><p className={styles.sub}>Platform financial overview</p></div>

      <div className={styles.kpiGrid}>
        <div className={styles.kpi}><p className={styles.kpiLabel}>GMV (Total Sales)</p><p className={styles.kpiVal}>${gmv.toLocaleString('en', { minimumFractionDigits: 2 })}</p><p className={styles.kpiSub}>{paid.length} paid orders</p></div>
        <div className={styles.kpi}><p className={styles.kpiLabel}>Platform Commission (5%)</p><p className={styles.kpiVal} style={{ color: '#ff6a00' }}>${commission.toLocaleString('en', { minimumFractionDigits: 2 })}</p><p className={styles.kpiSub}>Estimated earnings</p></div>
        <div className={styles.kpi}><p className={styles.kpiLabel}>Avg Order Value</p><p className={styles.kpiVal}>${avgOrder.toFixed(2)}</p><p className={styles.kpiSub}>Per transaction</p></div>
        <div className={styles.kpi}><p className={styles.kpiLabel}>Cancelled Orders</p><p className={styles.kpiVal} style={{ color: '#ef4444' }}>{orders.filter(o => o.status === 'cancelled').length}</p><p className={styles.kpiSub}>Lost revenue: ${orders.filter(o=>o.status==='cancelled').reduce((s,o)=>s+(o.totalAmount||0),0).toFixed(2)}</p></div>
      </div>

      <div className={tStyles.tableCard}>
        <div style={{ padding: '1rem', borderBottom: '1px solid #f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: '0.875rem', fontWeight: 700, color: '#111' }}>Transaction History</span>
          <span style={{ fontSize: '0.78rem', color: '#888' }}>{orders.length} total</span>
        </div>
        {loading ? <div className={tStyles.loading}>Loading...</div> : (
          <table className={tStyles.table}>
            <thead><tr><th>Order ID</th><th>Date</th><th>Amount</th><th>Commission (5%)</th><th>Status</th></tr></thead>
            <tbody>
              {orders.map(o => (
                <tr key={o.id}>
                  <td><span className={tStyles.orderId}>#{o.id.slice(0,8).toUpperCase()}</span></td>
                  <td className={tStyles.muted}>{new Date(o.createdAt).toLocaleDateString()}</td>
                  <td className={tStyles.amount}>${Number(o.totalAmount).toFixed(2)}</td>
                  <td style={{ color: '#ff6a00', fontWeight: 600 }}>${(o.totalAmount * 0.05).toFixed(2)}</td>
                  <td><span className={tStyles.pill} style={{ color: sc(o.status), background: sc(o.status) + '18' }}>{o.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
