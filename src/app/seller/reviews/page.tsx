'use client';

import React, { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { getSellerReviews, replyToReview } from '@/lib/firebase/firestore';
import styles from './reviews.module.css';

function Stars({ rating }: { rating: number }) {
  return (
    <span className={styles.stars}>
      {[1,2,3,4,5].map(i => (
        <span key={i} style={{ color: rating >= i ? '#f59e0b' : '#ddd' }}>★</span>
      ))}
    </span>
  );
}

export default function SellerReviewsPage() {
  const { user } = useAuth();
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterRating, setFilterRating] = useState('all');
  const [replyingId, setReplyingId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!user) return;
    getSellerReviews(user.uid).then(setReviews).finally(() => setLoading(false));
  }, [user]);

  const filtered = useMemo(() => {
    let list = [...reviews];
    if (search) list = list.filter(r => r.text?.toLowerCase().includes(search.toLowerCase()) || r.userName?.toLowerCase().includes(search.toLowerCase()) || r.productId?.toLowerCase().includes(search.toLowerCase()));
    if (filterRating !== 'all') list = list.filter(r => r.rating === Number(filterRating));
    return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [reviews, search, filterRating]);

  const avgRating = reviews.length ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length) : 0;
  const dist = [5,4,3,2,1].map(n => ({ n, count: reviews.filter(r => r.rating === n).length }));

  const handleReply = async (reviewId: string) => {
    if (!replyText.trim()) return;
    setSubmitting(true);
    try {
      await replyToReview(reviewId, replyText.trim());
      setReviews(prev => prev.map(r => r.id === reviewId ? { ...r, sellerReply: replyText.trim(), sellerReplyAt: new Date().toISOString() } : r));
      setReplyingId(null);
      setReplyText('');
    } finally { setSubmitting(false); }
  };

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Reviews</h1>
          <p className={styles.subtitle}>{reviews.length} total reviews</p>
        </div>
      </div>

      {/* Stats */}
      {reviews.length > 0 && (
        <div className={styles.statsCard}>
          <div className={styles.statsLeft}>
            <span className={styles.avgNum}>{avgRating.toFixed(1)}</span>
            <Stars rating={Math.round(avgRating)} />
            <span className={styles.avgSub}>{reviews.length} reviews</span>
          </div>
          <div className={styles.statsBars}>
            {dist.map(({ n, count }) => (
              <div key={n} className={styles.bar}>
                <span className={styles.barLabel}>{n}★</span>
                <div className={styles.barTrack}>
                  <div className={styles.barFill} style={{ width: reviews.length ? `${(count / reviews.length) * 100}%` : '0%' }} />
                </div>
                <span className={styles.barCount}>{count}</span>
              </div>
            ))}
          </div>
          <div className={styles.statsRight}>
            <div className={styles.statItem}><span className={styles.statVal}>{reviews.filter(r => !r.sellerReply).length}</span><span className={styles.statLabel}>Awaiting reply</span></div>
            <div className={styles.statItem}><span className={styles.statVal}>{reviews.filter(r => r.rating >= 4).length}</span><span className={styles.statLabel}>Positive (4-5★)</span></div>
            <div className={styles.statItem}><span className={styles.statVal}>{reviews.filter(r => r.rating <= 2).length}</span><span className={styles.statLabel}>Negative (1-2★)</span></div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className={styles.toolbar}>
        <div className={styles.searchWrap}>
          <span>🔍</span>
          <input className={styles.searchInput} placeholder="Search reviews..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select className={styles.select} value={filterRating} onChange={e => setFilterRating(e.target.value)}>
          <option value="all">All Ratings</option>
          {[5,4,3,2,1].map(n => <option key={n} value={n}>{n} Stars</option>)}
        </select>
      </div>

      {/* Reviews */}
      {loading ? (
        <div className={styles.loading}>Loading reviews...</div>
      ) : filtered.length === 0 ? (
        <div className={styles.empty}>
          <span>💬</span>
          <p>{reviews.length === 0 ? 'No reviews yet.' : 'No reviews match your filters.'}</p>
        </div>
      ) : (
        <div className={styles.list}>
          {filtered.map(r => (
            <div key={r.id} className={styles.card}>
              <div className={styles.cardTop}>
                <div className={styles.reviewer}>
                  <div className={styles.avatar}>{r.userName?.[0]?.toUpperCase() || '?'}</div>
                  <div>
                    <p className={styles.reviewerName}>{r.userName}</p>
                    <p className={styles.reviewDate}>{new Date(r.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</p>
                  </div>
                </div>
                <div className={styles.cardRight}>
                  <Stars rating={r.rating} />
                  <Link href={`/products/${r.productId}`} className={styles.productLink} target="_blank">
                    View Product →
                  </Link>
                </div>
              </div>

              <p className={styles.reviewText}>{r.text}</p>

              {/* Seller reply */}
              {r.sellerReply ? (
                <div className={styles.reply}>
                  <p className={styles.replyLabel}>Your response · {r.sellerReplyAt ? new Date(r.sellerReplyAt).toLocaleDateString() : ''}</p>
                  <p className={styles.replyText}>{r.sellerReply}</p>
                  <button className={styles.editReplyBtn} onClick={() => { setReplyingId(r.id); setReplyText(r.sellerReply); }}>Edit reply</button>
                </div>
              ) : (
                <button className={styles.replyBtn} onClick={() => { setReplyingId(r.id); setReplyText(''); }}>
                  💬 Reply to review
                </button>
              )}

              {/* Reply form */}
              {replyingId === r.id && (
                <div className={styles.replyForm}>
                  <textarea
                    className={styles.replyInput}
                    rows={3}
                    value={replyText}
                    onChange={e => setReplyText(e.target.value)}
                    placeholder="Write your response to this review..."
                    autoFocus
                  />
                  <div className={styles.replyActions}>
                    <button className={styles.cancelBtn} onClick={() => setReplyingId(null)}>Cancel</button>
                    <button className={styles.submitBtn} onClick={() => handleReply(r.id)} disabled={submitting || !replyText.trim()}>
                      {submitting ? 'Sending...' : 'Send Reply'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

