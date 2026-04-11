'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import styles from './home.module.css';

const CATEGORIES = [
  { id: 'all', label: 'All', emoji: '✨' },
  { id: 'electronics', label: 'Electronics', emoji: '💻' },
  { id: 'fashion', label: 'Fashion', emoji: '👕' },
  { id: 'food', label: 'Food & Drinks', emoji: '🍔' },
  { id: 'handmade', label: 'Handmade', emoji: '🛍️' },
  { id: 'home', label: 'Home', emoji: '🏠' },
  { id: 'sports', label: 'Sports', emoji: '⚽' },
];

const SORT_OPTIONS = [
  { value: 'default', label: 'Featured' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'rating', label: 'Top Rated' },
];

export default function Home() {
  const { user, profile } = useAuth();
  const { items, addItem } = useCart();
  const [products, setProducts] = useState<any[]>([]);
  const [filtered, setFiltered] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('all');
  const [sort, setSort] = useState('default');
  const [search, setSearch] = useState('');
  const [addedId, setAddedId] = useState<string | null>(null);

  const cartCount = items.reduce((s, i) => s + i.quantity, 0);

  useEffect(() => {
    fetch('/api/products')
      .then(r => r.json())
      .then(d => {
        const list = d.products || FALLBACK;
        setProducts(list);
        setFiltered(list);
      })
      .catch(() => {
        setProducts(FALLBACK);
        setFiltered(FALLBACK);
      })
      .finally(() => setLoading(false));
  }, []);

  const applyFilters = useCallback(() => {
    let list = [...products];
    if (activeCategory !== 'all') list = list.filter(p => p.categoryId === activeCategory);
    if (search.trim()) list = list.filter(p => p.title.toLowerCase().includes(search.toLowerCase()));
    if (sort === 'price_asc') list.sort((a, b) => a.price - b.price);
    else if (sort === 'price_desc') list.sort((a, b) => b.price - a.price);
    else if (sort === 'rating') list.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    setFiltered(list);
  }, [products, activeCategory, search, sort]);

  useEffect(() => { applyFilters(); }, [applyFilters]);

  const handleAddToCart = (e: React.MouseEvent, p: any) => {
    e.preventDefault();
    addItem({ id: p.id, title: p.title, price: p.price, quantity: 1, image: p.images?.[0], sellerId: p.sellerId });
    setAddedId(p.id);
    setTimeout(() => setAddedId(null), 1500);
  };

  return (
    <div className={styles.page}>
      {/* Navbar */}
      <header className={styles.navbar}>
        <div className={styles.navInner}>
          <Link href="/" className={styles.logo}>
            Shop<span>AI</span>
          </Link>

          <div className={styles.searchWrap}>
            <span className={styles.searchIcon}>🔍</span>
            <input
              className={styles.searchInput}
              type="text"
              placeholder="Search products..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>

          <nav className={styles.navActions}>
            {user ? (
              <>
                <span className={styles.greeting}>Hi, {profile?.displayName?.split(' ')[0] || 'there'}</span>
                {profile?.role === 'seller' && <Link href="/seller/dashboard" className={styles.navLink}>Dashboard</Link>}
                {profile?.role === 'admin' && <Link href="/admin/dashboard" className={styles.navLink}>Admin</Link>}
              </>
            ) : (
              <>
                <Link href="/auth/login" className={styles.navLink}>Sign In</Link>
                <Link href="/auth/signup" className={styles.navBtnPrimary}>Get Started</Link>
              </>
            )}
            <Link href="/checkout" className={styles.cartBtn}>
              🛒
              {cartCount > 0 && <span className={styles.cartBadge}>{cartCount}</span>}
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <div className={styles.heroBadge}>✨ New arrivals every week</div>
          <h1 className={styles.heroTitle}>
            Discover Products<br />You'll <span>Love</span>
          </h1>
          <p className={styles.heroSub}>
            Handpicked items from top sellers — fashion, tech, food, and handmade crafts.
          </p>
          <div className={styles.heroActions}>
            <Link href="/auth/signup" className={styles.heroCta}>Start Shopping</Link>
            <Link href="#catalog" className={styles.heroSecondary}>Browse Catalog ↓</Link>
          </div>
        </div>
        <div className={styles.heroStats}>
          <div className={styles.stat}><strong>22+</strong><span>Products</span></div>
          <div className={styles.statDivider} />
          <div className={styles.stat}><strong>7</strong><span>Categories</span></div>
          <div className={styles.statDivider} />
          <div className={styles.stat}><strong>4.8★</strong><span>Avg Rating</span></div>
        </div>
      </section>

      {/* Catalog */}
      <main className={styles.catalog} id="catalog">
        {/* Category Pills */}
        <div className={styles.categoryRow}>
          {CATEGORIES.map(c => (
            <button
              key={c.id}
              className={`${styles.categoryPill} ${activeCategory === c.id ? styles.categoryPillActive : ''}`}
              onClick={() => setActiveCategory(c.id)}
            >
              {c.emoji} {c.label}
            </button>
          ))}
        </div>

        {/* Toolbar */}
        <div className={styles.toolbar}>
          <p className={styles.resultCount}>
            {loading ? 'Loading...' : `${filtered.length} products`}
          </p>
          <select
            className={styles.sortSelect}
            value={sort}
            onChange={e => setSort(e.target.value)}
          >
            {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>

        {/* Grid */}
        {loading ? (
          <div className={styles.skeletonGrid}>
            {Array.from({ length: 8 }).map((_, i) => <div key={i} className={styles.skeleton} />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className={styles.empty}>
            <span>😕</span>
            <p>No products found</p>
          </div>
        ) : (
          <div className={styles.grid}>
            {filtered.map(p => (
              <Link href={`/products/${p.id}`} key={p.id} className={styles.card}>
                <div className={styles.cardImg}>
                  <img src={p.images?.[0] || p.image} alt={p.title} loading="lazy" />
                  {p.stock === 0 && <div className={styles.outOfStock}>Out of stock</div>}
                </div>
                <div className={styles.cardBody}>
                  <p className={styles.cardCategory}>{CATEGORIES.find(c => c.id === p.categoryId)?.emoji} {p.categoryId}</p>
                  <h3 className={styles.cardTitle}>{p.title}</h3>
                  {p.rating && (
                    <div className={styles.cardRating}>
                      <span className={styles.stars}>{'★'.repeat(Math.round(p.rating))}{'☆'.repeat(5 - Math.round(p.rating))}</span>
                      <span className={styles.ratingNum}>{p.rating} ({p.reviewCount})</span>
                    </div>
                  )}
                  <div className={styles.cardFooter}>
                    <span className={styles.price}>${Number(p.price).toFixed(2)}</span>
                    <button
                      className={`${styles.addBtn} ${addedId === p.id ? styles.addBtnDone : ''}`}
                      onClick={e => handleAddToCart(e, p)}
                      disabled={p.stock === 0}
                    >
                      {addedId === p.id ? '✓' : '+'}
                    </button>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className={styles.footer}>
        <p>© 2026 ShopAI · Built with Next.js & Firebase</p>
      </footer>
    </div>
  );
}

const FALLBACK = [
  { id: '1', title: 'Premium Wireless Headphones', price: 299.99, categoryId: 'electronics', rating: 4.8, reviewCount: 124, stock: 15, images: ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80'], sellerId: 'seed' },
  { id: '2', title: 'Ergonomic Office Chair', price: 399.00, categoryId: 'home', rating: 4.9, reviewCount: 43, stock: 10, images: ['https://images.unsplash.com/photo-1592078615290-033ee584e267?w=800&q=80'], sellerId: 'seed' },
  { id: '3', title: 'Artisan Coffee Beans 1kg', price: 24.99, categoryId: 'food', rating: 4.9, reviewCount: 512, stock: 80, images: ['https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=800&q=80'], sellerId: 'seed' },
  { id: '4', title: 'Hand-Poured Soy Candle', price: 19.99, categoryId: 'handmade', rating: 4.9, reviewCount: 607, stock: 65, images: ['https://images.unsplash.com/photo-1602607144535-11be3fe59c5e?w=800&q=80'], sellerId: 'seed' },
  { id: '5', title: 'Gold Layered Necklace Set', price: 28.00, categoryId: 'fashion', rating: 4.7, reviewCount: 389, stock: 75, images: ['https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=800&q=80'], sellerId: 'seed' },
  { id: '6', title: 'Running Shoes Air Max', price: 129.99, categoryId: 'sports', rating: 4.7, reviewCount: 302, stock: 35, images: ['https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80'], sellerId: 'seed' },
];
