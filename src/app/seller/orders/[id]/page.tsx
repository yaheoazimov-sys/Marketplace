'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { getOrder, updateOrderStatus } from '@/lib/firebase/firestore';
import { useAuth } from '@/contexts/AuthContext';
import styles from './detail.module.css';

const STATUS_STEPS = ['pending', 'confirmed', 'processing', 'shipped', 'delivered'];

const STATUS: Record<string, { label: string; color: string; bg: string; icon: string }> = {
  pending:    { label: 'Pending',    color: '#92400e', bg: '#fef3c7', icon: '🕐' },
  confirmed:  { label: 'Confirmed',  color: '#7c3aed', bg: '#dbeafe', icon: '✅' },
  processing: { label: 'Processing', color: '#5b21b6', bg: '#ede9fe', icon: '⚙️' },
  shipped:    { label: 'Shipped',    color: '#065f46', bg: '#d1fae5', icon: '🚚' },
  delivered:  { label: 'Delivered',  color: '#14532d', bg: '#bbf7d0', icon: '📦' },
  cancelled:  { label: 'Cancelled',  color: '#991b1b', bg: '#fee2e2', icon: '✕' },
  paid:       { label: 'Paid',       color: '#14532d', bg: '#bbf7d0', icon: '💳' },
  refunded:   { label: 'Refunded',   color: '#374151', bg: '#f3f4f6', icon: '↩' },
};

const ALL_STATUSES = ['pending','confirmed','processing','shipped','delivered','cancelled','refunded'];

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const router = useRouter();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [newStatus, setNewStatus] = useState('');
  const [note, setNote] = useState('');
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) return;
    getOrder(id).then(o => {
      if (!o) { router.push('/seller/orders'); return; }
      setOrder(o);
      setNewStatus(o.status);
    }).finally(() => setLoading(false));
  }, [id]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdating(true); setError('');
    try {
      await updateOrderStatus(id, newStatus, note);
      const updated = await getOrder(id);
      setOrder(updated);
      setNote('');
    } catch (err: any) { setError(err.message); }
    finally { setUpdating(false); }
  };

  if (loading) return <div className={styles.loading}>Loading order...</div>;
  if (!order) return null;

  const sm = (s: string) => STATUS[s] || { label: s, color: '#374151', bg: '#f3f4f6', icon: '•' };
  const meta = sm(order.status);
  const isCancelled = ['cancelled', 'refunded'].includes(order.status);
  const currentStep = STATUS_STEPS.indexOf(order.status);
  const subtotal = order.items?.reduce((s: number, i: any) => s + i.price * (i.quantity || 1), 0) || 0;
  const tax = +(subtotal * 0.08).toFixed(2);

  const timeline: any[] = [
    { status: 'pending', timestamp: order.createdAt, note: 'Order placed', auto: true },
    ...(order.timeline || []),
  ];

  return (
    <div className={styles.page}>
      {/* Breadcrumb */}
      <div className={styles.breadcrumb}>
        <Link href="/seller/orders">Orders</Link>
        <span>/</span>
        <span>#{order.id.slice(0, 8).toUpperCase()}</span>
      </div>

      {/* Header */}
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Order #{order.id.slice(0, 8).toUpperCase()}</h1>
          <p className={styles.date}>
            {new Date(order.createdAt).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            {' · '}
            {new Date(order.createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>
        <span className={styles.statusBadge} style={{ color: meta.color, background: meta.bg }}>
          {meta.icon} {meta.label}
        </span>
      </div>

      <div className={styles.grid}>
        {/* LEFT */}
        <div className={styles.left}>

          {/* Progress */}
          {!isCancelled && (
            <div className={styles.card}>
              <h2 className={styles.cardTitle}>Order Progress</h2>
              <div className={styles.progress}>
                {STATUS_STEPS.map((step, i) => {
                  const done = currentStep >= i;
                  const active = currentStep === i;
                  return (
                    <React.Fragment key={step}>
                      <div className={`${styles.step} ${done ? styles.stepDone : ''} ${active ? styles.stepActive : ''}`}>
                        <div className={styles.stepDot}>{done ? '✓' : i + 1}</div>
                        <span className={styles.stepLabel}>{sm(step).label}</span>
                      </div>
                      {i < STATUS_STEPS.length - 1 && (
                        <div className={`${styles.stepLine} ${currentStep > i ? styles.stepLineDone : ''}`} />
                      )}
                    </React.Fragment>
                  );
                })}
              </div>
            </div>
          )}

          {/* Items */}
          <div className={styles.card}>
            <h2 className={styles.cardTitle}>Items · {order.items?.length || 0}</h2>
            <div className={styles.itemList}>
              {order.items?.map((item: any, i: number) => (
                <div key={i} className={styles.item}>
                  <div className={styles.itemImg}>
                    {item.image ? <img src={item.image} alt={item.title} /> : <span>📦</span>}
                  </div>
                  <div className={styles.itemInfo}>
                    <p className={styles.itemTitle}>{item.title}</p>
                    {item.size && <p className={styles.itemMeta}>Size: {item.size}</p>}
                    {item.color && <p className={styles.itemMeta}>Color: {item.color}</p>}
                    <p className={styles.itemMeta}>Qty: {item.quantity || 1}</p>
                  </div>
                  <div className={styles.itemPrices}>
                    <p className={styles.itemTotal}>${(item.price * (item.quantity || 1)).toFixed(2)}</p>
                    <p className={styles.itemUnit}>${item.price.toFixed(2)} each</p>
                  </div>
                </div>
              ))}
            </div>
            <div className={styles.totals}>
              <div className={styles.totalRow}><span>Subtotal</span><span>${subtotal.toFixed(2)}</span></div>
              <div className={styles.totalRow}><span>Shipping</span><span className={styles.free}>Free</span></div>
              <div className={styles.totalRow}><span>Tax (8%)</span><span>${tax.toFixed(2)}</span></div>
              <div className={styles.totalRowBold}><span>Total</span><span>${(subtotal + tax).toFixed(2)}</span></div>
            </div>
          </div>

          {/* Timeline */}
          <div className={styles.card}>
            <h2 className={styles.cardTitle}>Activity Timeline</h2>
            <div className={styles.timeline}>
              {[...timeline].reverse().map((ev, i) => {
                const evMeta = sm(ev.status);
                const isFirst = i === 0;
                return (
                  <div key={i} className={styles.timelineItem}>
                    <div className={`${styles.timelineDot} ${isFirst ? styles.timelineDotActive : ''}`}
                      style={isFirst ? { background: evMeta.color, borderColor: evMeta.color } : {}}>
                      {evMeta.icon}
                    </div>
                    <div className={styles.timelineContent}>
                      <div className={styles.timelineHeader}>
                        <span className={styles.timelineStatus} style={{ color: evMeta.color }}>{evMeta.label}</span>
                        <span className={styles.timelineTime}>
                          {new Date(ev.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          {' '}
                          {new Date(ev.timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      {ev.note && <p className={styles.timelineNote}>{ev.note}</p>}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* RIGHT */}
        <div className={styles.right}>

          {/* Update Status */}
          <div className={styles.card}>
            <h2 className={styles.cardTitle}>Update Status</h2>
            <form onSubmit={handleUpdate} className={styles.statusForm}>
              <select className={styles.statusSelect} value={newStatus} onChange={e => setNewStatus(e.target.value)}>
                {ALL_STATUSES.map(s => <option key={s} value={s}>{sm(s).label}</option>)}
              </select>
              <textarea
                className={styles.noteInput}
                rows={2}
                value={note}
                onChange={e => setNote(e.target.value)}
                placeholder="Add a note (optional)..."
              />
              {error && <p className={styles.error}>{error}</p>}
              <button type="submit" className={styles.updateBtn} disabled={updating}>
                {updating ? 'Updating...' : 'Update Status'}
              </button>
            </form>
          </div>

          {/* Order Info */}
          <div className={styles.card}>
            <h2 className={styles.cardTitle}>Order Details</h2>
            <div className={styles.infoList}>
              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>Order ID</span>
                <span className={styles.infoValue} style={{ fontFamily: 'monospace', fontSize: '0.75rem' }}>{order.id}</span>
              </div>
              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>Payment</span>
                <span className={styles.infoValue}>{order.paymentMethod || 'Card'}</span>
              </div>
              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>Items</span>
                <span className={styles.infoValue}>{order.items?.length || 0}</span>
              </div>
              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>Total</span>
                <span className={styles.infoValue} style={{ fontWeight: 700 }}>${Number(order.totalAmount).toFixed(2)}</span>
              </div>
              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>Updated</span>
                <span className={styles.infoValue}>{new Date(order.updatedAt || order.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          </div>

          {/* Shipping */}
          <div className={styles.card}>
            <h2 className={styles.cardTitle}>Shipping Address</h2>
            <p className={styles.address}>{order.shippingAddress || '—'}</p>
          </div>

          {/* Customer */}
          <div className={styles.card}>
            <h2 className={styles.cardTitle}>Customer</h2>
            <div className={styles.customerBlock}>
              <div className={styles.customerAvatar}>{order.shippingAddress?.[0]?.toUpperCase() || '?'}</div>
              <div>
                <p className={styles.customerName}>{order.shippingAddress?.split('\n')[0] || 'Customer'}</p>
                <p className={styles.customerSub}>Order #{order.id.slice(0, 8).toUpperCase()}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
