'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import Navbar from '@/components/Navbar';
import { STATUS_META } from '../page';
import styles from './detail.module.css';

const TIMELINE_STEPS = ['pending', 'confirmed', 'processing', 'shipped', 'delivered'];
const STEP_ICON: Record<string, string> = { pending: '🕐', confirmed: '✅', processing: '⚙️', shipped: '🚚', delivered: '📦', cancelled: '✕', refunded: '↩', paid: '💳' };
const MANAGE_STATUSES = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'];

export default function OrderDetailPage() {
  return <ProtectedRoute><OrderDetail /></ProtectedRoute>;
}

function OrderDetail() {
  const { id } = useParams<{ id: string }>();
  const { user, profile } = useAuth();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updating, setUpdating] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [note, setNote] = useState('');
  const [showForm, setShowForm] = useState(false);

  const canManage = profile?.role === 'seller' || profile?.role === 'admin';

  const fetchOrder = async () => {
    if (!user) return;
    try {
      const token = await user.getIdToken();
      const res = await fetch(`/api/orders/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) { setError('Order not found'); return; }
      const d = await res.json();
      setOrder(d.order);
      setNewStatus(d.order.status);
    } catch { setError('Failed to load order'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchOrder(); }, [user, id]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setUpdating(true); setError('');
    try {
      const token = await user.getIdToken();
      const res = await fetch(`/api/orders/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status: newStatus, note }),
      });
      if (!res.ok) { const d = await res.json(); throw new Error(d.error); }
      setNote(''); setShowForm(false);
      fetchOrder();
    } catch (err: any) { setError(err.message); }
    finally { setUpdating(false); }
  };

  if (loading) return <><Navbar /><div className={styles.loading}>Loading order...</div></>;
  if (error || !order) return <><Navbar /><div className={styles.loading}>{error || 'Order not found'}</div></>;

  const sm = (s: string) => STATUS_META[s] || { label: s, color: '#374151', bg: '#f3f4f6' };
  const meta = sm(order.status);
  const isCancelled = ['cancelled', 'refunded'].includes(order.status);
  const currentStepIdx = TIMELINE_STEPS.indexOf(order.status);

  const timelineEvents = [
    { status: 'pending', timestamp: order.createdAt, note: 'Order placed by customer' },
    ...(order.timeline || []),
  ];

  const subtotal = order.items?.reduce((s: number, i: any) => s + i.price * (i.quantity || 1), 0) || 0;
  const tax = +(subtotal * 0.08).toFixed(2);
  const total = subtotal + tax;

  return (
    <>
      <Navbar />
      <div className={styles.page}>
        <div className={styles.container}>

          <div className={styles.breadcrumb}>
            <Link href="/orders">Orders</Link>
            <span>/</span>
            <span>#{order.id.slice(0, 8).toUpperCase()}</span>
          </div>

          <div className={styles.header}>
            <div>
              <h1 className={styles.title}>Order #{order.id.slice(0, 8).toUpperCase()}</h1>
              <p className={styles.date}>
                {new Date(order.createdAt).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                {' · '}
                {new Date(order.createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
            <span className={styles.statusBadge} style={{ color: meta.color, background: meta.bg }}>{meta.label}</span>
          </div>

          <div className={styles.grid}>
            <div className={styles.left}>

              {/* Progress bar */}
              {!isCancelled && (
                <div className={styles.card}>
                  <p className={styles.cardTitle}>Order Progress</p>
                  <div className={styles.progressBar}>
                    {TIMELINE_STEPS.map((step, i) => {
                      const done = currentStepIdx >= i;
                      const active = currentStepIdx === i;
                      return (
                        <React.Fragment key={step}>
                          <div className={`${styles.progressStep} ${done ? styles.progressDone : ''} ${active ? styles.progressActive : ''}`}>
                            <div className={styles.progressDot}>
                              {done ? '✓' : <span className={styles.progressNum}>{i + 1}</span>}
                            </div>
                            <span className={styles.progressLabel}>{sm(step).label}</span>
                          </div>
                          {i < TIMELINE_STEPS.length - 1 && (
                            <div className={`${styles.progressLine} ${currentStepIdx > i ? styles.progressLineDone : ''}`} />
                          )}
                        </React.Fragment>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Items */}
              <div className={styles.card}>
                <p className={styles.cardTitle}>Items Ordered</p>
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
                      <div className={styles.itemPrice}>
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
                  <div className={styles.totalRowBold}><span>Total</span><span>${total.toFixed(2)}</span></div>
                </div>
              </div>

              {/* Activity Timeline */}
              <div className={styles.card}>
                <p className={styles.cardTitle}>Activity Timeline</p>
                <div className={styles.timeline}>
                  {timelineEvents.map((ev, i) => {
                    const isLast = i === timelineEvents.length - 1;
                    return (
                      <div key={i} className={styles.timelineItem}>
                        <div className={`${styles.timelineDot} ${isLast ? styles.timelineDotActive : ''}`}>
                          {STEP_ICON[ev.status] || '•'}
                        </div>
                        <div className={styles.timelineContent}>
                          <p className={styles.timelineStatus}>{sm(ev.status).label}</p>
                          {ev.note && <p className={styles.timelineNote}>{ev.note}</p>}
                          <p className={styles.timelineTime}>
                            {new Date(ev.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                            {' · '}
                            {new Date(ev.timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Right column */}
            <div className={styles.right}>

              {/* Order Info */}
              <div className={styles.card}>
                <p className={styles.cardTitle}>Order Details</p>
                <div className={styles.infoRow}><span className={styles.infoLabel}>Order ID</span><span className={styles.infoValue} style={{ fontFamily: 'monospace', fontSize: '0.78rem' }}>{order.id}</span></div>
                <div className={styles.infoRow}><span className={styles.infoLabel}>Payment</span><span className={styles.infoValue}>{order.paymentMethod || 'Card'}</span></div>
                <div className={styles.infoRow}><span className={styles.infoLabel}>Items</span><span className={styles.infoValue}>{order.items?.length || 0}</span></div>
                <div className={styles.infoRow}><span className={styles.infoLabel}>Total</span><span className={styles.infoValue} style={{ fontWeight: 700 }}>${Number(order.totalAmount).toFixed(2)}</span></div>
                <div className={styles.infoRow}><span className={styles.infoLabel}>Updated</span><span className={styles.infoValue}>{new Date(order.updatedAt || order.createdAt).toLocaleDateString()}</span></div>
              </div>

              {/* Shipping */}
              <div className={styles.card}>
                <p className={styles.cardTitle}>Shipping Address</p>
                <p style={{ fontSize: '0.875rem', color: '#333', lineHeight: 1.6, whiteSpace: 'pre-line' }}>
                  {order.shippingAddress || '—'}
                </p>
              </div>

              {/* Manage Status (seller/admin only) */}
              {canManage && (
                <div className={styles.card}>
                  <p className={styles.cardTitle}>Manage Order</p>
                  {!showForm ? (
                    <button className={styles.btnManage} onClick={() => setShowForm(true)}>
                      Update Status
                    </button>
                  ) : (
                    <form onSubmit={handleUpdate} className={styles.statusForm}>
                      <select className={styles.select} value={newStatus} onChange={e => setNewStatus(e.target.value)}>
                        {MANAGE_STATUSES.map(s => <option key={s} value={s}>{sm(s).label}</option>)}
                      </select>
                      <textarea
                        className={styles.noteInput}
                        rows={2}
                        value={note}
                        onChange={e => setNote(e.target.value)}
                        placeholder="Add a note (optional)..."
                      />
                      {error && <div className={styles.errorMsg}>{error}</div>}
                      <div className={styles.btnRow}>
                        <button type="button" className={styles.btnOutline} onClick={() => setShowForm(false)}>Cancel</button>
                        <button type="submit" className={styles.btnPrimary} disabled={updating}>
                          {updating ? 'Saving...' : 'Update'}
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
