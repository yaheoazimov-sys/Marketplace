'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { createAd, getAds, deleteAd, getProducts } from '@/lib/firebase/firestore';
import styles from './ads.module.css';

const PRICE_PER_DAY = 100;

const STATUS_META: Record<string, { label: string; color: string; bg: string }> = {
  pending:  { label: 'Pending Review', color: '#92400e', bg: '#fef3c7' },
  approved: { label: 'Active',         color: '#14532d', bg: '#bbf7d0' },
  rejected: { label: 'Rejected',       color: '#991b1b', bg: '#fee2e2' },
};

function daysBetween(start: string, end: string) {
  if (!start || !end) return 0;
  const diff = new Date(end).getTime() - new Date(start).getTime();
  return Math.max(0, Math.ceil(diff / 86400000) + 1);
}

function today() { return new Date().toISOString().split('T')[0]; }
function minEnd(start: string) {
  if (!start) return today();
  const d = new Date(start); d.setDate(d.getDate() + 1);
  return d.toISOString().split('T')[0];
}

export default function SellerAdsPage() {
  const { user, profile } = useAuth();
  const [ads, setAds] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [form, setForm] = useState({
    productId: '', title: '', description: '', link: '',
    startDate: today(), endDate: '',
  });

  const days = daysBetween(form.startDate, form.endDate);
  const total = days * PRICE_PER_DAY;

  useEffect(() => {
    if (!user) return;
    Promise.all([
      getAds({ sellerId: user.uid }),
      getProducts({ sellerId: user.uid, status: 'active' }),
    ]).then(([a, p]) => { setAds(a); setProducts(p); }).finally(() => setLoading(false));
  }, [user]);

  const selectedProduct = products.find(p => p.id === form.productId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !form.productId || !form.startDate || !form.endDate) { setError('Fill all required fields'); return; }
    if (days < 1) { setError('End date must be after start date'); return; }
    setSaving(true); setError('');
    try {
      await createAd({
        sellerId: user.uid,
        sellerName: profile?.displayName || user.email || 'Seller',
        productId: form.productId,
        productTitle: selectedProduct?.title || '',
        productImage: selectedProduct?.images?.[0] || '',
        title: form.title || selectedProduct?.title || '',
        description: form.description,
        link: `/products/${form.productId}`,
        startDate: form.startDate,
        endDate: form.endDate,
        days,
        totalCost: total,
      });
      const updated = await getAds({ sellerId: user.uid });
      setAds(updated);
      setShowForm(false);
      setForm({ productId: '', title: '', description: '', link: '', startDate: today(), endDate: '' });
      setSuccess('Ad submitted for review! Admin will approve it shortly.');
      setTimeout(() => setSuccess(''), 4000);
    } catch (err: any) { setError(err.message); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Cancel this ad?')) return;
    await deleteAd(id);
    setAds(prev => prev.filter(a => a.id !== id));
  };

  const sm = (s: string) => STATUS_META[s] || { label: s, color: '#374151', bg: '#f3f4f6' };

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Advertising</h1>
          <p className={styles.subtitle}>Promote your products on the homepage · ${PRICE_PER_DAY}/day</p>
        </div>
        <button className={styles.newBtn} onClick={() => setShowForm(s => !s)}>
          {showForm ? 'Cancel' : '+ Create Ad'}
        </button>
      </div>

      {success && <div className={styles.successBanner}>✓ {success}</div>}

      {/* Create form */}
      {showForm && (
        <div className={styles.formCard}>
          <h2 className={styles.formTitle}>New Ad Campaign</h2>
          <form onSubmit={handleSubmit} className={styles.form}>

            <div className={styles.field}>
              <label>Product *</label>
              <select required value={form.productId} onChange={e => setForm(f => ({ ...f, productId: e.target.value }))}>
                <option value="">Select a product to advertise</option>
                {products.map(p => <option key={p.id} value={p.id}>{p.title} — ${p.price}</option>)}
              </select>
            </div>

            {selectedProduct && (
              <div className={styles.productPreview}>
                {selectedProduct.images?.[0] && <img src={selectedProduct.images[0]} alt="" className={styles.previewImg} />}
                <div>
                  <p className={styles.previewTitle}>{selectedProduct.title}</p>
                  <p className={styles.previewPrice}>${selectedProduct.price}</p>
                </div>
              </div>
            )}

            <div className={styles.field}>
              <label>Ad Title</label>
              <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder={selectedProduct?.title || 'Ad headline (optional)'} />
            </div>

            <div className={styles.field}>
              <label>Ad Description</label>
              <textarea rows={2} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Short promotional text..." />
            </div>

            {/* Date picker */}
            <div className={styles.dateSection}>
              <h3 className={styles.dateSectionTitle}>Campaign Duration</h3>
              <div className={styles.dateRow}>
                <div className={styles.field}>
                  <label>Start Date *</label>
                  <input type="date" required min={today()} value={form.startDate}
                    onChange={e => setForm(f => ({ ...f, startDate: e.target.value, endDate: f.endDate && f.endDate <= e.target.value ? '' : f.endDate }))} />
                </div>
                <div className={styles.dateArrow}>→</div>
                <div className={styles.field}>
                  <label>End Date *</label>
                  <input type="date" required min={minEnd(form.startDate)} value={form.endDate}
                    onChange={e => setForm(f => ({ ...f, endDate: e.target.value }))} />
                </div>
              </div>

              {/* Pricing calculator */}
              <div className={styles.calculator}>
                <div className={styles.calcRow}>
                  <span>Duration</span>
                  <span className={styles.calcVal}>{days > 0 ? `${days} day${days !== 1 ? 's' : ''}` : '—'}</span>
                </div>
                <div className={styles.calcRow}>
                  <span>Price per day</span>
                  <span className={styles.calcVal}>${PRICE_PER_DAY}</span>
                </div>
                <div className={styles.calcDivider} />
                <div className={styles.calcTotal}>
                  <span>Total Cost</span>
                  <span className={styles.calcTotalVal}>${total > 0 ? total.toLocaleString() : '0'}</span>
                </div>
                {days > 0 && (
                  <div className={styles.calcDates}>
                    {form.startDate} → {form.endDate}
                  </div>
                )}
              </div>

              {/* Quick duration buttons */}
              <div className={styles.quickDurations}>
                {[
                  { label: '3 days', days: 3 },
                  { label: '7 days', days: 7 },
                  { label: '14 days', days: 14 },
                  { label: '30 days', days: 30 },
                ].map(({ label, days: d }) => {
                  const start = form.startDate || today();
                  const end = new Date(start);
                  end.setDate(end.getDate() + d - 1);
                  const endStr = end.toISOString().split('T')[0];
                  const isActive = days === d;
                  return (
                    <button key={label} type="button"
                      className={`${styles.quickBtn} ${isActive ? styles.quickBtnActive : ''}`}
                      onClick={() => setForm(f => ({ ...f, endDate: endStr }))}>
                      {label} — ${d * PRICE_PER_DAY}
                    </button>
                  );
                })}
              </div>
            </div>

            {error && <div className={styles.error}>{error}</div>}

            <div className={styles.formActions}>
              <button type="button" className={styles.cancelBtn} onClick={() => setShowForm(false)}>Cancel</button>
              <button type="submit" className={styles.submitBtn} disabled={saving || days < 1}>
                {saving ? 'Submitting...' : `Submit for Review · $${total.toLocaleString()}`}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Ads list */}
      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>My Campaigns <span className={styles.badge}>{ads.length}</span></h2>
        {loading ? (
          <div className={styles.loading}>Loading...</div>
        ) : ads.length === 0 ? (
          <div className={styles.empty}>
            <span>📢</span>
            <p>No ad campaigns yet.</p>
            <button className={styles.newBtn} onClick={() => setShowForm(true)}>Create your first ad</button>
          </div>
        ) : (
          <div className={styles.adsList}>
            {ads.map(ad => {
              const meta = sm(ad.status);
              const now = today();
              const isLive = ad.status === 'approved' && ad.startDate <= now && ad.endDate >= now;
              const isUpcoming = ad.status === 'approved' && ad.startDate > now;
              return (
                <div key={ad.id} className={styles.adCard}>
                  <div className={styles.adLeft}>
                    {ad.productImage && <img src={ad.productImage} alt="" className={styles.adImg} />}
                    <div className={styles.adInfo}>
                      <div className={styles.adTitleRow}>
                        <p className={styles.adTitle}>{ad.title || ad.productTitle}</p>
                        {isLive && <span className={styles.liveBadge}>🔴 LIVE</span>}
                        {isUpcoming && <span className={styles.upcomingBadge}>⏰ Upcoming</span>}
                      </div>
                      <p className={styles.adProduct}>{ad.productTitle}</p>
                      <div className={styles.adDates}>
                        <span>📅 {ad.startDate} → {ad.endDate}</span>
                        <span>·</span>
                        <span>{ad.days} day{ad.days !== 1 ? 's' : ''}</span>
                        <span>·</span>
                        <span className={styles.adCost}>${ad.totalCost?.toLocaleString()}</span>
                      </div>
                      {ad.adminNote && (
                        <p className={styles.adminNote}>Admin: {ad.adminNote}</p>
                      )}
                    </div>
                  </div>
                  <div className={styles.adRight}>
                    <span className={styles.statusPill} style={{ color: meta.color, background: meta.bg }}>{meta.label}</span>
                    {ad.status === 'pending' && (
                      <button className={styles.deleteBtn} onClick={() => handleDelete(ad.id)}>Cancel</button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
