'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useCart } from '@/contexts/CartContext';
import Navbar from '@/components/Navbar';
import styles from './home.module.css';

const CATEGORIES = [
  { id: 'all', label: 'All Products' },
  { id: 'clothing', label: 'Clothing' },
  { id: 'fashion', label: 'Accessories' },
  { id: 'electronics', label: 'Electronics' },
  { id: 'cars', label: 'Cars & Auto' },
  { id: 'sports', label: 'Sports' },
  { id: 'home', label: 'Home' },
  { id: 'food', label: 'Food' },
  { id: 'handmade', label: 'Handmade' },
];

const HERO_SLIDES = [
  {
    title: "Men's Jacket",
    brand: 'NEW COLLECTION',
    price: '$89.95',
    cta: 'SHOP NOW',
    image: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=600&q=80',
    bg: 'linear-gradient(135deg, #2a2a2a 0%, #1a1a1a 100%)',
  },
  {
    title: "Premium Sneakers",
    brand: 'TRENDING NOW',
    price: '$129.99',
    cta: 'SHOP NOW',
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&q=80',
    bg: 'linear-gradient(135deg, #1e2a3a 0%, #0f1a2a 100%)',
  },
  {
    title: "Leather Bag",
    brand: 'BEST SELLER',
    price: '$189.00',
    cta: 'SHOP NOW',
    image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&q=80',
    bg: 'linear-gradient(135deg, #2a1a0a 0%, #1a0f00 100%)',
  },
];

const BRANDS = ['H&M', 'D&G', 'DKNY', 'TOPMAN', 'ZARA', 'MARKS&S'];

export default function Home() {
  const { addItem } = useCart();
  const [products, setProducts] = useState<any[]>([]);
  const [featured, setFeatured] = useState<any[]>([]);
  const [filtered, setFiltered] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('all');
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('default');
  const [slide, setSlide] = useState(0);
  const [addedId, setAddedId] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/products')
      .then(r => r.json())
      .then(d => {
        const list: any[] = d.products || [];
        setProducts(list);
        setFeatured(list.slice(0, 5));
      })
      .catch(() => { setProducts([]); setFeatured([]); })
      .finally(() => setLoading(false));
  }, []);

  // Auto-advance hero
  useEffect(() => {
    const t = setInterval(() => setSlide(s => (s + 1) % HERO_SLIDES.length), 4000);
    return () => clearInterval(t);
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

  const handleAdd = (e: React.MouseEvent, p: any) => {
    e.preventDefault();
    addItem({ id: p.id, title: p.title, price: p.price, quantity: 1, image: p.images?.[0], sellerId: p.sellerId });
    setAddedId(p.id);
    setTimeout(() => setAddedId(null), 1500);
  };

  const cur = HERO_SLIDES[slide];

  return (
    <div className={styles.page}>
      <Navbar search={search} onSearch={setSearch} />

      {/* ── Hero Slider ── */}
      <section className={styles.hero} style={{ background: cur.bg }}>
        <div className={styles.heroInner}>
          <div className={styles.heroImg}>
            <img src={cur.image} alt={cur.title} />
          </div>
          <div className={styles.heroText}>
            <p className={styles.heroBrand}>{cur.brand}</p>
            <h1 className={styles.heroTitle}>{cur.title}</h1>
            <p className={styles.heroPrice}>{cur.price}</p>
            <p className={styles.heroDesc}>Premium quality, modern design. Limited stock available.</p>
            <Link href="#catalog" className={styles.heroCta}>{cur.cta}</Link>
          </div>
        </div>
        <button className={`${styles.slideBtn} ${styles.slidePrev}`} onClick={() => setSlide(s => (s - 1 + HERO_SLIDES.length) % HERO_SLIDES.length)}>‹</button>
        <button className={`${styles.slideBtn} ${styles.slideNext}`} onClick={() => setSlide(s => (s + 1) % HERO_SLIDES.length)}>›</button>
        <div className={styles.slideDots}>
          {HERO_SLIDES.map((_, i) => <button key={i} className={`${styles.dot} ${i === slide ? styles.dotActive : ''}`} onClick={() => setSlide(i)} />)}
        </div>
      </section>

      {/* ── Banners ── */}
      <section className={styles.banners}>
        <div className={styles.banner} style={{ background: 'linear-gradient(135deg, #1a1a1a, #333)' }}>
          <div>
            <span className={styles.bannerBrand}>SHOP</span>
            <h2 className={styles.bannerTitle}><span className={styles.bannerRed}>BIG</span> SALE</h2>
            <p className={styles.bannerSub}>UP TO 50% OFF</p>
          </div>
          <img src="https://images.unsplash.com/photo-1523205771623-e0faa4d2813d?w=300&q=80" alt="sale" className={styles.bannerImg} />
        </div>
        <div className={styles.banner} style={{ background: 'linear-gradient(135deg, #2a3a4a, #1a2a3a)' }}>
          <div>
            <p className={styles.bannerSub}>STAY UPDATED</p>
            <h2 className={styles.bannerTitle}>FASHION UPDATES<br /><span style={{ fontSize: '1rem', fontWeight: 400 }}>ANYWHERE</span></h2>
          </div>
          <img src="https://images.unsplash.com/photo-1483985988355-763728e1935b?w=300&q=80" alt="fashion" className={styles.bannerImg} />
        </div>
      </section>

      {/* ── Featured Products ── */}
      <section className={styles.featured}>
        <div className={styles.sectionHead}>
          <span className={styles.sectionTitle}>FEATURED PRODUCTS</span>
        </div>
        <div className={styles.featuredGrid}>
          {(loading ? Array(5).fill(null) : featured).map((p, i) =>
            p ? (
              <Link href={`/products/${p.id}`} key={p.id} className={styles.featCard}>
                <div className={styles.featImg}>
                  <img src={p.images?.[0] || p.image} alt={p.title} loading="lazy" />
                </div>
                <div className={styles.featBody}>
                  <p className={styles.featName}>{p.title}</p>
                  <div className={styles.featFooter}>
                    <span className={styles.featPrice}>${Number(p.price).toFixed(2)}</span>
                    <button className={`${styles.featAddBtn} ${addedId === p.id ? styles.featAdded : ''}`} onClick={e => handleAdd(e, p)}>
                      {addedId === p.id ? '✓' : '🛒'}
                    </button>
                  </div>
                </div>
              </Link>
            ) : <div key={i} className={styles.featSkeleton} />
          )}
        </div>
      </section>

      {/* ── Catalog ── */}
      <section className={styles.catalog} id="catalog">
        {/* Category nav */}
        <div className={styles.catNav}>
          {CATEGORIES.map(c => (
            <button key={c.id} className={`${styles.catBtn} ${activeCategory === c.id ? styles.catBtnActive : ''}`} onClick={() => setActiveCategory(c.id)}>
              {c.label}
            </button>
          ))}
          <select className={styles.sortSelect} value={sort} onChange={e => setSort(e.target.value)}>
            <option value="default">Sort: Featured</option>
            <option value="price_asc">Price ↑</option>
            <option value="price_desc">Price ↓</option>
            <option value="rating">Top Rated</option>
          </select>
        </div>

        {/* Grid */}
        {loading ? (
          <div className={styles.grid}>
            {Array(8).fill(null).map((_, i) => <div key={i} className={styles.skeleton} />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className={styles.empty}><span>😕</span><p>No products found</p></div>
        ) : (
          <div className={styles.grid}>
            {filtered.map(p => (
              <Link href={`/products/${p.id}`} key={p.id} className={styles.card}>
                <div className={styles.cardImg}>
                  <img src={p.images?.[0] || p.image} alt={p.title} loading="lazy" />
                  {p.stock === 0 && <div className={styles.outOfStock}>Out of stock</div>}
                  <div className={styles.cardOverlay}>
                    <button className={`${styles.overlayBtn} ${addedId === p.id ? styles.overlayBtnDone : ''}`} onClick={e => handleAdd(e, p)} disabled={p.stock === 0}>
                      {addedId === p.id ? '✓ Added' : '+ Add to Cart'}
                    </button>
                  </div>
                </div>
                <div className={styles.cardBody}>
                  <p className={styles.cardName}>{p.title}</p>
                  {p.rating && (
                    <div className={styles.cardRating}>
                      {'★'.repeat(Math.round(p.rating))}{'☆'.repeat(5 - Math.round(p.rating))}
                      <span> ({p.reviewCount})</span>
                    </div>
                  )}
                  <p className={styles.cardPrice}>${Number(p.price).toFixed(2)}</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* ── Brands ── */}
      <section className={styles.brands}>
        {BRANDS.map(b => <span key={b} className={styles.brand}>{b}</span>)}
      </section>

      {/* ── Footer ── */}
      <footer className={styles.footer}>
        <div className={styles.footerGrid}>
          <div>
            <h4>INFORMATION</h4>
            <a href="#">About Us</a><a href="#">Delivery</a><a href="#">Privacy Policy</a><a href="#">Terms & Conditions</a>
          </div>
          <div>
            <h4>CUSTOMER SERVICE</h4>
            <a href="#">Contact Us</a><a href="#">Returns</a><a href="#">Site Map</a>
          </div>
          <div>
            <h4>EXTRAS</h4>
            <a href="#">Brands</a><a href="#">Gift Vouchers</a><a href="#">Affiliates</a><a href="#">Specials</a>
          </div>
          <div>
            <h4>MY ACCOUNT</h4>
            <Link href="/auth/login">My Account</Link>
            <a href="#">Order History</a><a href="#">Wish List</a>
            <Link href="/auth/signup">Newsletter</Link>
          </div>
        </div>
        <div className={styles.footerBottom}>
          <p>© 2026 BigBoss · Premium E-Commerce</p>
        </div>
      </footer>
    </div>
  );
}
