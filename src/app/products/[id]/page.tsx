'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { getProduct, getReviews, hasPurchased, getUserReview, createReview } from '@/lib/firebase/firestore';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import Navbar from '@/components/Navbar';
import AiSupport from '@/components/AiSupport';
import styles from './product.module.css';

function Stars({ rating, size = 16, interactive = false, onChange }: { rating: number; size?: number; interactive?: boolean; onChange?: (r: number) => void }) {
  const [hover, setHover] = useState(0);
  return (
    <div className={styles.stars} style={{ fontSize: size }}>
      {[1,2,3,4,5].map(i => (
        <span
          key={i}
          className={`${styles.star} ${(interactive ? (hover || rating) : rating) >= i ? styles.starFilled : ''}`}
          onMouseEnter={() => interactive && setHover(i)}
          onMouseLeave={() => interactive && setHover(0)}
          onClick={() => interactive && onChange?.(i)}
          style={{ cursor: interactive ? 'pointer' : 'default' }}
        >★</span>
      ))}
    </div>
  );
}

export default function ProductPage() {
  const { id } = useParams<{ id: string }>();
  const { user, profile } = useAuth();
  const { addItem } = useCart();
  const router = useRouter();

  const [product, setProduct] = useState<any>(null);
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeImg, setActiveImg] = useState(0);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [qty, setQty] = useState(1);
  const [addedToCart, setAddedToCart] = useState(false);

  // Review state
  const [canReview, setCanReview] = useState(false);
  const [existingReview, setExistingReview] = useState<any>(null);  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewText, setReviewText] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewError, setReviewError] = useState('');
  const [replyOpen, setReplyOpen] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    Promise.all([
      getProduct(id),
      getReviews(id),
    ]).then(([p, r]) => {
      setProduct(p);
      setReviews(r);
    }).finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (!user || !id) return;
    Promise.all([
      hasPurchased(user.uid, id),
      getUserReview(user.uid, id),
    ]).then(([purchased, review]) => {
      setCanReview(purchased);
      setExistingReview(review);
      if (review) { setReviewRating(review.rating); setReviewText(review.text); }
    });
  }, [user, id]);

  const handleAddToCart = () => {
    if (!product) return;
    addItem({ id: product.id, title: product.title, price: product.price, quantity: qty, image: product.images?.[0], sellerId: product.sellerId });
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  };

  const handleBuyNow = () => {
    handleAddToCart();
    router.push('/checkout');
  };

  const handleSubmitReview = async () => {
    if (!user || !product) return;
    if (!reviewText.trim()) { setReviewError('Please write a review'); return; }
    setSubmittingReview(true); setReviewError('');
    try {
      await createReview({
        productId: id,
        sellerId: product.sellerId,
        userId: user.uid,
        userName: profile?.displayName || user.email || 'Anonymous',
        rating: reviewRating,
        text: reviewText.trim(),
      });
      const updated = await getReviews(id);
      setReviews(updated);
      const myReview = await getUserReview(user.uid, id);
      setExistingReview(myReview);
      setShowReviewForm(false);
    } catch (err: any) { setReviewError(err.message); }
    finally { setSubmittingReview(false); }
  };

  if (loading) return (
    <>
      <Navbar />
      <div className={styles.loadingPage}>
        <div className={styles.loadingSkeleton} />
      </div>
    </>
  );

  if (!product) return (
    <>
      <Navbar />
      <div className={styles.notFound}>
        <span>😕</span>
        <p>Product not found</p>
        <Link href="/" className={styles.backLink}>← Back to catalog</Link>
      </div>
    </>
  );

  const images = product.images?.length ? product.images : ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80'];
  const avgRating = reviews.length ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length) : product.rating || 0;
  const ratingDist = [5,4,3,2,1].map(n => ({ n, count: reviews.filter((r: any) => r.rating === n).length }));

  return (
    <>
      <Navbar />
      <div className={styles.page}>
        <div className={styles.container}>

          {/* Breadcrumb */}
          <div className={styles.breadcrumb}>
            <Link href="/">Home</Link>
            <span>/</span>
            <span>{product.categoryId}</span>
            <span>/</span>
            <span>{product.title}</span>
          </div>

          {/* Product section */}
          <div className={styles.productGrid}>

            {/* Images */}
            <div className={styles.gallery}>
              <div className={styles.mainImg}>
                <img src={images[activeImg]} alt={product.title} />
                {product.stock === 0 && <div className={styles.outOfStockOverlay}>Out of Stock</div>}
                {product.comparePrice > product.price && (
                  <div className={styles.saleBadge}>SALE</div>
                )}
              </div>
              {images.length > 1 && (
                <div className={styles.thumbs}>
                  {images.map((img: string, i: number) => (
                    <button key={i} className={`${styles.thumb} ${activeImg === i ? styles.thumbActive : ''}`} onClick={() => setActiveImg(i)}>
                      <img src={img} alt="" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Info */}
            <div className={styles.info}>
              {product.brand && <p className={styles.brand}>{product.brand}</p>}
              <h1 className={styles.title}>{product.title}</h1>

              {/* Rating summary */}
              <div className={styles.ratingRow}>
                <Stars rating={Math.round(avgRating)} />
                <span className={styles.ratingNum}>{avgRating.toFixed(1)}</span>
                <span className={styles.ratingCount}>({reviews.length} review{reviews.length !== 1 ? 's' : ''})</span>
              </div>

              {/* Price */}
              <div className={styles.priceRow}>
                <span className={styles.price}>${Number(product.price).toFixed(2)}</span>
                {product.comparePrice > product.price && (
                  <span className={styles.comparePrice}>${Number(product.comparePrice).toFixed(2)}</span>
                )}
              </div>

              {/* Stock */}
              <div className={styles.stockRow}>
                {product.stock > 0 ? (
                  <span className={styles.inStock}>✓ In Stock ({product.stock} available)</span>
                ) : (
                  <span className={styles.outOfStock}>✕ Out of Stock</span>
                )}
              </div>

              {/* Description */}
              <p className={styles.description}>{product.description}</p>

              {/* Colors */}
              {product.colors?.length > 0 && (
                <div className={styles.optionGroup}>
                  <p className={styles.optionLabel}>Color: <strong>{selectedColor || 'Select'}</strong></p>
                  <div className={styles.colorOptions}>
                    {product.colors.map((c: string) => (
                      <button
                        key={c}
                        className={`${styles.colorBtn} ${selectedColor === c ? styles.colorBtnActive : ''}`}
                        onClick={() => setSelectedColor(c)}
                        title={c}
                        style={{ background: c === 'White' ? '#f0f0f0' : c === 'Beige' ? '#f5f0e8' : c === 'Camel' ? '#c19a6b' : c === 'Khaki' ? '#8b8b6b' : c.toLowerCase() }}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Sizes */}
              {product.sizes?.length > 0 && (
                <div className={styles.optionGroup}>
                  <p className={styles.optionLabel}>Size: <strong>{selectedSize || 'Select'}</strong></p>
                  <div className={styles.sizeOptions}>
                    {product.sizes.map((s: string) => (
                      <button key={s} className={`${styles.sizeBtn} ${selectedSize === s ? styles.sizeBtnActive : ''}`} onClick={() => setSelectedSize(s)}>{s}</button>
                    ))}
                  </div>
                </div>
              )}

              {/* Quantity */}
              <div className={styles.optionGroup}>
                <p className={styles.optionLabel}>Quantity</p>
                <div className={styles.qtyRow}>
                  <button className={styles.qtyBtn} onClick={() => setQty(q => Math.max(1, q - 1))}>−</button>
                  <span className={styles.qtyVal}>{qty}</span>
                  <button className={styles.qtyBtn} onClick={() => setQty(q => Math.min(product.stock, q + 1))}>+</button>
                </div>
              </div>

              {/* Actions */}
              <div className={styles.actions}>
                <button
                  className={`${styles.addToCartBtn} ${addedToCart ? styles.addedBtn : ''}`}
                  onClick={handleAddToCart}
                  disabled={product.stock === 0}
                >
                  {addedToCart ? '✓ Added to Cart' : '🛒 Add to Cart'}
                </button>
                <button className={styles.buyNowBtn} onClick={handleBuyNow} disabled={product.stock === 0}>
                  Buy Now
                </button>
              </div>

              {/* Attributes */}
              {product.attributes && Object.keys(product.attributes).length > 0 && (
                <div className={styles.attributes}>
                  {Object.entries(product.attributes).map(([k, v]) => (
                    <div key={k} className={styles.attrRow}>
                      <span className={styles.attrKey}>{k}</span>
                      <span className={styles.attrVal}>{v as string}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Reviews section */}
          <div className={styles.reviewsSection}>
            <div className={styles.reviewsHeader}>
              <h2 className={styles.reviewsTitle}>Customer Reviews</h2>
              {canReview && !existingReview && (
                <button className={styles.writeReviewBtn} onClick={() => setShowReviewForm(s => !s)}>
                  {showReviewForm ? 'Cancel' : '+ Write a Review'}
                </button>
              )}
              {existingReview && (
                <button className={styles.writeReviewBtn} onClick={() => setShowReviewForm(s => !s)}>
                  {showReviewForm ? 'Cancel' : '✏️ Edit Your Review'}
                </button>
              )}
              {!user && <p className={styles.reviewHint}><Link href="/auth/login">Sign in</Link> to leave a review</p>}
              {user && !canReview && !existingReview && <p className={styles.reviewHint}>Purchase this product to leave a review</p>}
            </div>

            {/* Rating overview */}
            {reviews.length > 0 && (
              <div className={styles.ratingOverview}>
                <div className={styles.ratingBig}>
                  <span className={styles.ratingBigNum}>{avgRating.toFixed(1)}</span>
                  <Stars rating={Math.round(avgRating)} size={20} />
                  <span className={styles.ratingBigCount}>{reviews.length} reviews</span>
                </div>
                <div className={styles.ratingBars}>
                  {ratingDist.map(({ n, count }) => (
                    <div key={n} className={styles.ratingBar}>
                      <span className={styles.ratingBarLabel}>{n}★</span>
                      <div className={styles.ratingBarTrack}>
                        <div className={styles.ratingBarFill} style={{ width: reviews.length ? `${(count / reviews.length) * 100}%` : '0%' }} />
                      </div>
                      <span className={styles.ratingBarCount}>{count}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Review form */}
            {showReviewForm && (
              <div className={styles.reviewForm}>
                <h3 className={styles.reviewFormTitle}>{existingReview ? 'Edit Your Review' : 'Write a Review'}</h3>
                <div className={styles.reviewFormRating}>
                  <p className={styles.optionLabel}>Your Rating</p>
                  <Stars rating={reviewRating} size={28} interactive onChange={setReviewRating} />
                </div>
                <div className={styles.reviewFormField}>
                  <label>Your Review</label>
                  <textarea rows={4} value={reviewText} onChange={e => setReviewText(e.target.value)} placeholder="Share your experience with this product..." />
                </div>
                {reviewError && <p className={styles.reviewError}>{reviewError}</p>}
                <button className={styles.submitReviewBtn} onClick={handleSubmitReview} disabled={submittingReview}>
                  {submittingReview ? 'Submitting...' : existingReview ? 'Update Review' : 'Submit Review'}
                </button>
              </div>
            )}

            {/* Reviews list */}
            {reviews.length === 0 ? (
              <div className={styles.noReviews}>
                <span>💬</span>
                <p>No reviews yet. Be the first to review this product!</p>
              </div>
            ) : (
              <div className={styles.reviewsList}>
                {reviews.map((r: any) => (
                  <div key={r.id} className={styles.reviewCard}>
                    <div className={styles.reviewTop}>
                      <div className={styles.reviewerInfo}>
                        <div className={styles.reviewerAvatar}>{r.userName?.[0]?.toUpperCase() || '?'}</div>
                        <div>
                          <p className={styles.reviewerName}>{r.userName}</p>
                          <p className={styles.reviewDate}>{new Date(r.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                        </div>
                      </div>
                      <Stars rating={r.rating} size={14} />
                    </div>
                    <p className={styles.reviewText}>{r.text}</p>

                    {/* Seller reply */}
                    {r.sellerReply && (
                      <div className={styles.sellerReply}>
                        <p className={styles.sellerReplyLabel}>Seller's response:</p>
                        <p className={styles.sellerReplyText}>{r.sellerReply}</p>
                        <p className={styles.sellerReplyDate}>{r.sellerReplyAt ? new Date(r.sellerReplyAt).toLocaleDateString() : ''}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      <AiSupport />
    </>
  );
}
