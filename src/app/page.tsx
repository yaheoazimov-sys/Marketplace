'use client';

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { useCart } from '@/contexts/CartContext';
import { getProducts } from '@/lib/firebase/firestore';
import Navbar from '@/components/Navbar';
import AiSupport from '@/components/AiSupport';
import styles from './home.module.css';

const CATS = [
  { id: 'all', label: 'All Categories', icon: '🏪' },
  { id: 'electronics', label: 'Electronics', icon: '💻' },
  { id: 'clothing', label: 'Clothing', icon: '👔' },
  { id: 'fashion', label: 'Accessories', icon: '👜' },
  { id: 'cars', label: 'Cars & Auto', icon: '🚗' },
  { id: 'sports', label: 'Sports', icon: '⚽' },
  { id: 'home', label: 'Home & Garden', icon: '🏠' },
  { id: 'food', label: 'Food & Drinks', icon: '🍔' },
  { id: 'handmade', label: 'Handmade', icon: '🛍️' },
];

const SORTS = [
  { value: 'featured', label: 'Best Match' },
  { value: 'newest', label: 'Newest' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'rating', label: 'Top Rated' },
  { value: 'popular', label: 'Most Sold' },
];

function StarRating({ rating }: { rating: number }) {
  return (
    <div className={styles.stars}>
      {[1,2,3,4,5].map(i => (
        <span key={i} className={i <= Math.round(rating) ? styles.starFilled : styles.starEmpty}>★</span>
      ))}
      <span className={styles.ratingVal}>{rating?.toFixed(1)}</span>
    </div>
  );
}

export default function Home() {
  const { addItem } = useCart();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [addedId, setAddedId] = useState<string | null>(null);

  // Filters
  const [search, setSearch] = useState('');
  const [cat, setCat] = useState('all');
  const [sort, setSort] = useState('featured');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [inStock, setInStock] = useState(false);
  const [onSale, setOnSale] = useState(false);
  const [minRating, setMinRating] = useState(0);

  useEffect(() => {
    getProducts({ status: 'active' })
      .then(list => setProducts(list.filter((p: any) => p.status === 'active')))
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    let list = [...products];
    if (cat !== 'all') list = list.filter(p => p.categoryId === cat);
    if (search.trim()) {
      const lq = search.toLowerCase();
      list = list.filter(p =>
        p.title?.toLowerCase().includes(lq) ||
        p.brand?.toLowerCase().includes(lq) ||
        p.description?.toLowerCase().includes(lq)
      );
    }
    if (minPrice) list = list.filter(p => p.price >= Number(minPrice));
    if (maxPrice) list = list.filter(p => p.price <= Number(maxPrice));
    if (inStock) list = list.filter(p => p.stock > 0);
    if (onSale) list = list.filter(p => p.comparePrice > p.price);
    if (minRating > 0) list = list.filter(p => (p.rating || 0) >= minRating);
    switch (sort) {
      case 'price_asc': list.sort((a, b) => a.price - b.price); break;
      case 'price_desc': list.sort((a, b) => b.price - a.price); break;
      case 'rating': list.sort((a, b) => (b.rating || 0) - (a.rating || 0)); break;
      case 'popular': list.sort((a, b) => (b.reviewCount || 0) - (a.reviewCount || 0)); break;
      case 'newest': list.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()); break;
    }
    return list;
  }, [products, cat, search, minPrice, maxPrice, inStock, onSale, minRating, sort]);

  const handleAdd = (e: React.MouseEvent, p: any) => {
    e.preventDefault();
    addItem({ id: p.id, title: p.title, price: p.price, quantity: 1, image: p.images?.[0], sellerId: p.sellerId });
    setAddedId(p.id);
    setTimeout(() => setAddedId(null), 1500);
  };

  const clearFilters = () => {
    setCat('all'); setSearch(''); setMinPrice(''); setMaxPrice('');
    setInStock(false); setOnSale(false); setMinRating(0); setSort('featured');
  };

  const activeFilters = [cat !== 'all', search, minPrice, maxPrice, inStock, onSale, minRating > 0].filter(Boolean).length;

  return (
    <>
      <Navbar search={search} onSearch={setSearch} />
      <div className={styles.page}>

        {/* ── Top search bar ── */}
        <div className={styles.searchBar}>
          <div className={styles.searchBarInner}>
            <div className={styles.catDropdown}>
              <select value={cat} onChange={e => setCat(e.target.value)} className={styles.catSelect}>
                {CATS.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
              </select>
            </div>
            <input
              className={styles.searchBarInput}
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search products, brands, categories..."
              onKeyDown={e => e.key === 'Escape' && setSearch('')}
            />
            <button className={styles.searchBarBtn}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
              Search
            </button>
          </div>
        </div>

        {/* ── Category pills ── */}
        <div className={styles.catPills}>
          {CATS.map(c => (
            <button key={c.id} className={`${styles.catPill} ${cat === c.id ? styles.catPillActive : ''}`} onClick={() => setCat(c.id)}>
              <span>{c.icon}</span> {c.label}
            </button>
          ))}
        </div>

        <div className={styles.layout}>
          {/* ── Sidebar ── */}
          <aside className={styles.sidebar}>
            <div className={styles.sidebarHead}>
              <span className={styles.sidebarTitle}>Filter</span>
              {activeFilters > 0 && (
                <button className={styles.clearBtn} onClick={clearFilters}>Clear all ({activeFilters})</button>
              )}
            </div>

            {/* Category */}
            <div className={styles.filterGroup}>
              <p className={styles.filterGroupTitle}>Category</p>
              {CATS.map(c => (
                <label key={c.id} className={`${styles.filterOpt} ${cat === c.id ? styles.filterOptActive : ''}`}>
                  <input type="radio" name="cat" checked={cat === c.id} onChange={() => setCat(c.id)} />
                  <span>{c.icon} {c.label}</span>
                  <span className={styles.filterCount}>{c.id === 'all' ? products.length : products.filter(p => p.categoryId === c.id).length}</span>
                </label>
              ))}
            </div>

            {/* Price */}
            <div className={styles.filterGroup}>
              <p className={styles.filterGroupTitle}>Price</p>
              <div className={styles.priceInputs}>
                <input type="number" placeholder="Min" value={minPrice} onChange={e => setMinPrice(e.target.value)} className={styles.priceInput} />
                <span>—</span>
                <input type="number" placeholder="Max" value={maxPrice} onChange={e => setMaxPrice(e.target.value)} className={styles.priceInput} />
              </div>
              <div className={styles.pricePresets}>
                {[['< $50','','50'],['$50–200','50','200'],['$200–500','200','500'],['> $500','500','']].map(([l,mn,mx]) => (
                  <button key={l} className={`${styles.pricePreset} ${minPrice===mn&&maxPrice===mx?styles.pricePresetActive:''}`}
                    onClick={() => { setMinPrice(mn); setMaxPrice(mx); }}>{l}</button>
                ))}
              </div>
            </div>

            {/* Rating */}
            <div className={styles.filterGroup}>
              <p className={styles.filterGroupTitle}>Minimum Rating</p>
              {[4,3,2,1].map(r => (
                <label key={r} className={`${styles.filterOpt} ${minRating === r ? styles.filterOptActive : ''}`}>
                  <input type="radio" name="rating" checked={minRating === r} onChange={() => setMinRating(minRating === r ? 0 : r)} />
                  <span className={styles.ratingStars}>{'★'.repeat(r)}{'☆'.repeat(5-r)}</span>
                  <span className={styles.filterCount}>{products.filter(p => (p.rating||0) >= r).length}</span>
                </label>
              ))}
            </div>

            {/* Condition */}
            <div className={styles.filterGroup}>
              <p className={styles.filterGroupTitle}>Availability</p>
              <label className={`${styles.filterOpt} ${inStock ? styles.filterOptActive : ''}`}>
                <input type="checkbox" checked={inStock} onChange={e => setInStock(e.target.checked)} />
                <span>In Stock</span>
                <span className={styles.filterCount}>{products.filter(p => p.stock > 0).length}</span>
              </label>
              <label className={`${styles.filterOpt} ${onSale ? styles.filterOptActive : ''}`}>
                <input type="checkbox" checked={onSale} onChange={e => setOnSale(e.target.checked)} />
                <span>On Sale</span>
                <span className={styles.filterCount}>{products.filter(p => p.comparePrice > p.price).length}</span>
              </label>
            </div>
          </aside>

          {/* ── Main content ── */}
          <main className={styles.main}>
            {/* Results bar */}
            <div className={styles.resultsBar}>
              <p className={styles.resultsCount}>
                {loading ? 'Loading...' : (
                  <>
                    <strong>{filtered.length}</strong> products
                    {search && <> for <span className={styles.searchTerm}>"{search}"</span></>}
                  </>
                )}
              </p>
              <div className={styles.sortRow}>
                <span className={styles.sortLabel}>Sort by:</span>
                <div className={styles.sortBtns}>
                  {SORTS.map(s => (
                    <button key={s.value} className={`${styles.sortBtn} ${sort === s.value ? styles.sortBtnActive : ''}`} onClick={() => setSort(s.value)}>
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Grid */}
            {loading ? (
              <div className={styles.grid}>
                {Array(12).fill(null).map((_, i) => <div key={i} className={styles.skeleton} />)}
              </div>
            ) : filtered.length === 0 ? (
              <div className={styles.empty}>
                <span>🔍</span>
                <p>No products found</p>
                <button className={styles.clearAllBtn} onClick={clearFilters}>Clear filters</button>
              </div>
            ) : (
              <div className={styles.grid}>
                {filtered.map(p => (
                  <Link href={`/products/${p.id}`} key={p.id} className={styles.card}>
                    <div className={styles.cardImg}>
                      {p.images?.[0]
                        ? <img src={p.images[0]} alt={p.title} loading="lazy" />
                        : <div className={styles.noImg}>📦</div>
                      }
                      {p.stock === 0 && <div className={styles.oos}>Out of stock</div>}
                      {p.comparePrice > p.price && (
                        <div className={styles.saleBadge}>
                          -{Math.round((1 - p.price / p.comparePrice) * 100)}%
                        </div>
                      )}
                    </div>
                    <div className={styles.cardBody}>
                      {p.brand && <p className={styles.cardBrand}>{p.brand}</p>}
                      <p className={styles.cardTitle}>{p.title}</p>
                      <div className={styles.cardPrices}>
                        <span className={styles.cardPrice}>${Number(p.price).toFixed(2)}</span>
                        {p.comparePrice > p.price && (
                          <span className={styles.cardOldPrice}>${Number(p.comparePrice).toFixed(2)}</span>
                        )}
                      </div>
                      {p.rating > 0 && (
                        <div className={styles.cardMeta}>
                          <StarRating rating={p.rating} />
                          {p.reviewCount > 0 && <span className={styles.sold}>Sold {p.reviewCount}</span>}
                        </div>
                      )}
                      {p.stock > 0 && p.stock <= 10 && (
                        <p className={styles.lowStock}>Only {p.stock} left</p>
                      )}
                    </div>
                    <div className={styles.cardActions}>
                      <button
                        className={`${styles.addToCart} ${addedId === p.id ? styles.addedToCart : ''}`}
                        onClick={e => handleAdd(e, p)}
                        disabled={p.stock === 0}
                      >
                        {addedId === p.id ? '✓ Added' : 'Add to Cart'}
                      </button>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </main>
        </div>

        {/* Footer */}
        <footer className={styles.footer}>
          <div className={styles.footerInner}>
            <div>
              <p className={styles.footerLogo}>BigBoss</p>
              <p className={styles.footerDesc}>Premium marketplace for buyers and sellers worldwide.</p>
            </div>
            <div>
              <p className={styles.footerHead}>Shop</p>
              <Link href="/catalog">All Products</Link>
              <Link href="/catalog?sale=1">On Sale</Link>
              <Link href="/catalog?stock=1">In Stock</Link>
            </div>
            <div>
              <p className={styles.footerHead}>Account</p>
              <Link href="/auth/login">Sign In</Link>
              <Link href="/auth/signup">Register</Link>
              <Link href="/orders">My Orders</Link>
              <Link href="/settings">Settings</Link>
            </div>
            <div>
              <p className={styles.footerHead}>Sell</p>
              <Link href="/seller">Seller Dashboard</Link>
              <Link href="/seller/products/new">Add Product</Link>
              <Link href="/seller/ads">Advertise</Link>
            </div>
          </div>
          <div className={styles.footerBottom}>© 2026 BigBoss · All rights reserved</div>
        </footer>
      </div>
      <AiSupport />
    </>
  );
}
