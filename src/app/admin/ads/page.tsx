'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import ProtectedRoute from '@/components/ProtectedRoute';
import Navbar from '@/components/Navbar';
import { getAds, updateAdStatus } from '@/lib/firebase/firestore';
import styles from './admin-ads.module.css';

const STATUS_META: Record<string, { label: string; color: string; bg: string }> = {
  pending:  { label: 'Pending',  color: '#92400e', bg: '#fef3c7' },
  approved: { label: 'Approved', color: '#14532d', bg: '#bbf7d0' },
  rejected: { label: 'Rejected', color: '#991b1b', bg: '#fee2e2' },
};

export default function AdminAdsPage() {
  return <ProtectedRoute allowedRoles={['admin']}><AdminAdsContent /></ProtectedRoute>;
}

function AdminAdsContent() {
  const [ads, setAds] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('pending');
  const [noteMap, setNoteMap] = useState<Record<string, string>>({});
  const [processing, setProcessing] = useState<string | null>(null);
  const [msg, setMsg] = useState('');

  const fetchAds = async () => {
    setLoading(true);
    try {
      const all = await getAds();
      setAds(all);
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchAds(); }, []);

  const handleAction = async (id: string, action: 'approved' | 'rejected') => {
    setProcessing(id);
    try {
      await updateAdStatus(id, action, noteMap[id] || '');
      setAds(prev => prev.map(a => a.id === id ? { ...a, status: action, adminNote: noteMap[id] || '' } : a));
      setMsg(`Ad ${action} successfully`);
      setTimeout(() => setMsg(''), 3000);
    } finally { setProcessing(null); }
  };

  const filtered = ads.filter(a => filter === 'all' || a.status === filter);
  const counts = { all: ads.length, pending: ads.filter(a => a.status === 'pending').length, approved: ads.filter(a => a.status === 'approved').length, rejected: ads.filter(a => a.status === 'rejected').length };
  const sm = (s: string) => STATUS_META[s] || { label: s, color: '#374151', bg: '#f3f4f6' };
  const today = new Date().toISOString().split('T')[0];

  return (
    <>
      <Navbar />
      <div className={styles.page}>
        <div className={styles.container}>
          <div className={styles.header}>
            <div>
              <h1 className={styles.title}>Ad Approvals</h1>
              <p className={styles.subtitle}>Review and approve seller advertising campaigns</p>
            </div>
            <Link href="/admin/dashboard" className={styles.backBtn}>← Admin Panel</Link>
          </div>

          {msg && <div className={styles.successBanner}>✓ {msg}</div>}

          {/* Stats */}
          <div className={styles.stats}>
            {Object.entries(counts).map(([k, v]) => (
              <button key={k} className={`${styles.statCard} ${filter === k ? styles.statCardActive : ''}`} onClick={() => setFilter(k)}>
                <span className={styles.statVal}>{v}</span>
                <span className={styles.statLabel}>{k.charAt(0).toUpperCase() + k.slice(1)}</span>
              </button>
            ))}
          </div>

          {/* List */}
          {loading ? (
            <div className={styles.loading}>Loading ads...</div>
          ) : filtered.length === 0 ? (
            <div className={styles.empty}><span>📢</span><p>No {filter} ads.</p></div>
          ) : (
            <div className={styles.list}>
              {filtered.map(ad => {
                const meta = sm(ad.status);
                const isLive = ad.status === 'approved' && ad.startDate <= today && ad.endDate >= today;
                return (
                  <div key={ad.id} className={styles.card}>
                    <div className={styles.cardTop}>
                      <div className={styles.adLeft}>
                        {ad.productImage && <img src={ad.productImage} alt="" className={styles.adImg} />}
                        <div className={styles.adInfo}>
                          <div className={styles.adTitleRow}>
                            <p className={styles.adTitle}>{ad.title || ad.productTitle}</p>
                            {isLive && <span className={styles.liveBadge}>🔴 LIVE</span>}
                            <span className={styles.statusPill} style={{ color: meta.color, background: meta.bg }}>{meta.label}</span>
                          </div>
                          <p className={styles.adSeller}>Seller: <strong>{ad.sellerName}</strong></p>
                          <p className={styles.adProduct}>Product: {ad.productTitle}</p>
                          {ad.description && <p className={styles.adDesc}>{ad.description}</p>}
                          <div className={styles.adMeta}>
                            <span>📅 {ad.startDate} → {ad.endDate}</span>
                            <span>·</span>
                            <span>{ad.days} day{ad.days !== 1 ? 's' : ''}</span>
                            <span>·</span>
                            <span className={styles.cost}>${ad.totalCost?.toLocaleString()}</span>
                            <span>·</span>
                            <span className={styles.submitted}>Submitted {new Date(ad.createdAt).toLocaleDateString()}</span>
                          </div>
                          {ad.adminNote && <p className={styles.existingNote}>Note: {ad.adminNote}</p>}
                        </div>
                      </div>
                      <Link href={`/products/${ad.productId}`} className={styles.viewProduct} target="_blank">View Product →</Link>
                    </div>

                    {/* Action area — only for pending */}
                    {ad.status === 'pending' && (
                      <div className={styles.actionArea}>
                        <div className={styles.noteField}>
                          <input
                            placeholder="Add a note for the seller (optional)..."
                            value={noteMap[ad.id] || ''}
                            onChange={e => setNoteMap(prev => ({ ...prev, [ad.id]: e.target.value }))}
                            className={styles.noteInput}
                          />
                        </div>
                        <div className={styles.actionBtns}>
                          <button
                            className={styles.rejectBtn}
                            onClick={() => handleAction(ad.id, 'rejected')}
                            disabled={processing === ad.id}
                          >
                            ✕ Reject
                          </button>
                          <button
                            className={styles.approveBtn}
                            onClick={() => handleAction(ad.id, 'approved')}
                            disabled={processing === ad.id}
                          >
                            {processing === ad.id ? 'Processing...' : '✓ Approve'}
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Re-action for approved/rejected */}
                    {ad.status !== 'pending' && (
                      <div className={styles.reActionArea}>
                        <button className={styles.undoBtn} onClick={() => handleAction(ad.id, ad.status === 'approved' ? 'rejected' : 'approved')}>
                          {ad.status === 'approved' ? 'Revoke approval' : 'Approve instead'}
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

