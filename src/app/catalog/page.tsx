'use client';

import React, { useEffect, useState, useMemo, useCallback, useRef, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { getProducts } from '@/lib/firebase/firestore';
import { useCart } from '@/contexts/CartContext';
import Navbar from '@/components/Navbar';
import AiSupport from '@/components/AiSupport';
import styles from './catalog.module.css';

const CATS = [
  { id: 'all', label: 'All', icon: '✨' },
  { id: 'clothing', label: 'Clothing', icon: '👔' },
  { id: 'fashion', label: 'Accessories', icon: '👜' },
  { id: 'electronics', label: 'Electronics', icon: '💻' },
  { id: 'cars', label: 'Cars & Auto', icon: '🚗' },
  { id: 'sports', label: 'Sports', icon: '⚽' },
  { id: 'home', label: 'Home', icon: '🏠' },
  { id: 'food', label: 'Food', icon: '🍔' },
  { id: 'handmade', label: 'Handmade', icon: '🛍️' },
];

const SORTS = [
  { value: 'featured', label: 'Featured' },
  { value: 'newest', label: 'Newest' },
  { value: 'price_asc', label: 'Price: Low → High' },
  { value: 'price_desc', label: 'Price: High → Low' },
  { value: 'rating', label: 'Top Rated' },
  { value: 'popular', label: 'Most Reviewed' },
];

const PER_PAGE = 24;

function Stars({ rating }: { rating: number }) {
  return <span>{[1,2,3,4,5].map(i => <span key={i} style={{ color: rating >= i ? '#f59e0b' : '#ddd', fontSize: '0.8rem' }}>★</span>)}</span>;
}

export default function CatalogPage() {
  return <Suspense><CatalogContent /></Suspense>;
}

function CatalogContent() {
  const sp = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const { addItem } = useCart();

  const [all, setAll] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [addedId, setAddedId] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [localSearch, setLocalSearch] = useState(sp.get('q') || '');
  const debounce = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const q = sp.get('q') || '';
  const cat = sp.get('cat') || 'all';
  const sort = sp.get('sort') || 'featured';
  const minP = Number(sp.get('minP') || 0);
  const maxP = Number(sp.get('maxP') || 0);
  const minR = Number(sp.get('minR') || 0);
  const inStock = sp.get('stock') === '1';
  const onSale = sp.get('sale') === '1';
  const brand = sp.get('brand') || '';
  const page = Number(sp.get('page') || 1);

  const push = useCallback((updates: Record<string, string>) => {
    const p = new URLSearchParams(sp.toString());
    Object.entries(updates).forEach(([k, v]) => {
      if (!v || v === '0' || v === 'all' || v === 'featured') p.delete(k);
      else p.set(k, v);
    });
    p.delete('page');
    router.push(`${pathname}?${p.toString()}`, { scroll: false });
  }, [sp, router, pathname]);

  const clearAll = () => { router.push(pathname, { scroll: false }); setLocalSearch(''); };

  useEffect(() => {
    getProducts({ status: 'active' }).then(setAll).finally(() => setLoading(false));
  }, []);

  // Sync local search with URL
  useEffect(() => { setLocalSearch(q); }, [q]);

  const brands = useMemo(() => {
    const base = cat === 'all' ? all : all.filter(p => p.categoryId === cat);
    return [...new Set(base.map(p => p.brand).filter(Boolean))].sort() as string[];
  }, [all, cat]);

  const filtered = useMemo(() => {
    let list = [...all];
    if (cat !== 'all') list = list.filter(p => p.categoryId === cat);
    if (q) {
      const lq = q.toLowerCase();
      list = list.filter(p =>
        p.title?.toLowerCase().includes(lq) ||
        p.brand?.toLowerCase().includes(lq) ||
        p.description?.toLowerCase().includes(lq) ||
        p.tags?.some((t: string) => t.toLowerCase().includes(lq))
      );
    }
    if (brand) list = list.filter(p => p.brand === brand);
    if (minP > 0) list = list.filter(p => p.price >= minP);
    if (maxP > 0) list = list.filter(p => p.price <= maxP);
    if (minR > 0) list = list.filter(p => (p.rating || 0) >= minR);
    if (inStock) list = list.filter(p => p.stock > 0);
    if (onSale) list = list.filter(p => p.comparePrice > p.price);
    switch (sort) {
      case 'price_asc': list.sort((a, b) => a.price - b.price); break;
      case 'price_desc': list.sort((a, b) => b.price - a.price); break;
      case 'rating': list.sort((a, b) => (b.rating || 0) - (a.rating || 0)); break;
      case 'popular': list.sort((a, b) => (b.reviewCount || 0) - (a.reviewCount || 0)); break;
      case 'newest': list.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()); break;
    }
    return list;
  }, [all, cat, q, brand, minP, maxP, minR, inStock, onSale, sort]);

  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const activeCount = [cat !== 'all', q, brand, minP > 0, maxP > 0, minR > 0, inStock, onSale].filter(Boolean).length;

  const handleSearch = (v: string) => {
    setLocalSearch(v);
    clearTimeout(debounce.current);
    debounce.current = setTimeout(() => push({ q: v }), 350);
  };

  const handleAdd = (e: React.MouseEvent, p: any) => {
    e.preventDefault();
    addItem({ id: p.id, title: p.title, price: p.price, quantity: 1, image: p.images?.[0], sellerId: p.sellerId });
    setAddedId(p.id);
    setTimeout(() => setAddedId(null), 1500);
  };

  return (
    <div className={styles.page}>
      <Navbar />
      <div className={styles.wrap}>

        {/* ── Top bar ── */}
        <div className={styles.topBar}>
          <div className={styles.topLeft}>
            <h1 className={styles.pageTitle}>
              {cat === 'all' ? 'All Products' : CATS.find(c => c.id === cat)?.label}
            </h1>
            <span className={styles.count}>{loading ? '…' : `${filtered.length} items`}</span>
          </div>
          <div className={styles.topRight}>
            <div className={styles.searchBox}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#aaa" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
              <input
                className={styles.searchInput}
                value={localSearch}
                onChange={e => handleSearch(e.target.value)}
                placeholder="Search products, brands..."
              />
              {localSearch && (
                <button className={styles.clearSearch} onClick={() => { push({ q: '' }); setLocalSearch(''); }}>✕</button>
              )}
            </div>
            <select className={styles.sortSel} value={sort} onChange={e => push({ sort: e.target.value })}>
              {SORTS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
            <button className={styles.filterBtn} onClick={() => setSidebarOpen(o => !o)}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="4" y1="6" x2="20" y2="6"/><line x1="8" y1="12" x2="16" y2="12"/><line x1="11" y1="18" x2="13" y2="18"/></svg>
              Filters {activeCount > 0 && <span className={styles.badge}>{activeCount}</span>}
            </button>
          </div>
        </div>

        {/* ── Active chips ── */}
        {activeCount > 0 && (
          <div className={styles.chips}>
            {q && <span className={styles.chip}>"{q}" <button onClick={() => { push({ q: '' }); setLocalSearch(''); }}>✕</button></span>}
            {cat !== 'all' && <span className={styles.chip}>{CATS.find(c => c.id === cat)?.label} <button onClick={() => push({ cat: 'all' })}>✕</button></span>}
            {brand && <span className={styles.chip}>{brand} <button onClick={() => push({ brand: '' })}>✕</button></span>}
            {minP > 0 && <span className={styles.chip}>From ${minP} <button onClick={() => push({ minP: '0' })}>✕</button></span>}
            {maxP > 0 && <span className={styles.chip}>To ${maxP} <button onClick={() => push({ maxP: '0' })}>✕</button></span>}
            {minR > 0 && <span className={styles.chip}>{minR}★+ <button onClick={() => push({ minR: '0' })}>✕</button></span>}
            {inStock && <span className={styles.chip}>In Stock <button onClick={() => push({ stock: '' })}>✕</button></span>}
            {onSale && <span className={styles.chip}>On Sale <button onClick={() => push({ sale: '' })}>✕</button></span>}
            <button className={styles.clearAll} onClick={clearAll}>Clear all</button>
          </div>
        )}

        <div className={styles.body}>
          {/* ── Sidebar ── */}
          {sidebarOpen && <div className={styles.overlay} onClick={() => setSidebarOpen(false)} />}
          <aside className={`${styles.sidebar} ${sidebarOpen ? styles.sidebarOpen : ''}`}>
            <div className={styles.sidebarHead}>
              <span className={styles.sidebarTitle}>Filters</span>
              {activeCount > 0 && <button className={styles.clearAllSm} onClick={clearAll}>Clear all</button>}
              <button className={styles.closeBtn} onClick={() => setSidebarOpen(false)}>✕</button>
            </div>

            {/* Category */}
            <div className={styles.group}>
              <p className={styles.groupLabel}>Category</p>
              {CATS.map(c => (
                <label key={c.id} className={`${styles.opt} ${cat === c.id ? styles.optActive : ''}`}>
                  <input type="radio" name="cat" checked={cat === c.id} onChange={() => push({ cat: c.id })} />
                  <span className={styles.optIcon}>{c.icon}</span>
                  <span className={styles.optText}>{c.label}</span>
                  <span className={styles.optCount}>{c.id === 'all' ? all.length : all.filter(p => p.categoryId === c.id).length}</span>
                </label>
              ))}
            </div>

            {/* Price */}
            <div className={styles.group}>
              <p className={styles.groupLabel}>Price</p>
              <div className={styles.priceRow}>
                <div className={styles.priceField}>
                  <span>$</span>
                  <input type="number" min="0" placeholder="Min" defaultValue={minP || ''} key={`min-${minP}`}
                    onChange={e => { clearTimeout(debounce.current); debounce.current = setTimeout(() => push({ minP: e.target.value }), 600); }} />
                </div>
                <span>—</span>
                <div className={styles.priceField}>
                  <span>$</span>
                  <input type="number" min="0" placeholder="Max" defaultValue={maxP || ''} key={`max-${maxP}`}
                    onChange={e => { clearTimeout(debounce.current); debounce.current = setTimeout(() => push({ maxP: e.target.value }), 600); }} />
                </div>
              </div>
              <div className={styles.pricePresets}>
                {[['< $50','0','50'],['$50–$150','50','150'],['$150–$500','150','500'],['> $500','500','0']].map(([l,mn,mx]) => (
                  <button key={l} className={`${styles.preset} ${minP===Number(mn)&&maxP===Number(mx)?styles.presetActive:''}`}
                    onClick={() => push({ minP: mn, maxP: mx })}>{l}</button>
                ))}
              </div>
            </div>

            {/* Rating */}
            <div className={styles.group}>
              <p className={styles.groupLabel}>Rating</p>
              {[4,3,2,1].map(r => (
                <label key={r} className={`${styles.opt} ${minR === r ? styles.optActive : ''}`}>
                  <input type="radio" name="rating" checked={minR === r} onChange={() => push({ minR: minR === r ? '0' : String(r) })} />
                  <Stars rating={r} />
                  <span className={styles.optText}>& up</span>
                  <span className={styles.optCount}>{all.filter(p => (p.rating||0) >= r).length}</span>
                </label>
              ))}
            </div>

            {/* Brand */}
            {brands.length > 0 && (
              <div className={styles.group}>
                <p className={styles.groupLabel}>Brand</p>
                <div className={styles.brandScroll}>
                  {brands.map(b => (
                    <label key={b} className={`${styles.opt} ${brand === b ? styles.optActive : ''}`}>
                      <input type="checkbox" checked={brand === b} onChange={() => push({ brand: brand === b ? '' : b })} />
                      <span className={styles.optText}>{b}</span>
                      <span className={styles.optCount}>{all.filter(p => p.brand === b).length}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Availability */}
            <div className={styles.group}>
              <p className={styles.groupLabel}>Availability</p>
              <label className={`${styles.opt} ${inStock ? styles.optActive : ''}`}>
                <input type="checkbox" checked={inStock} onChange={() => push({ stock: inStock ? '' : '1' })} />
                <span className={styles.optText}>In Stock only</span>
                <span className={styles.optCount}>{all.filter(p => p.stock > 0).length}</span>
              </label>
              <label className={`${styles.opt} ${onSale ? styles.optActive : ''}`}>
                <input type="checkbox" checked={onSale} onChange={() => push({ sale: onSale ? '' : '1' })} />
                <span className={styles.optText}>On Sale</span>
                <span className={styles.optCount}>{all.filter(p => p.comparePrice > p.price).length}</span>
              </label>
            </div>
          </aside>

          {/* ── Products grid ── */}
          <main className={styles.main}>
            {loading ? (
              <div className={styles.grid}>
                {Array(12).fill(null).map((_, i) => <div key={i} className={styles.skeleton} />)}
              </div>
            ) : paginated.length === 0 ? (
              <div className={styles.empty}>
                <span>🔍</span>
                <p>No products found</p>
                <button className={styles.clearAllBtn} onClick={clearAll}>Clear filters</button>
              </div>
            ) : (
              <>
                <div className={styles.grid}>
                  {paginated.map(p => (
                    <Link href={`/products/${p.id}`} key={p.id} className={styles.card}>
                      <div className={styles.cardImg}>
                        <img src={p.images?.[0]} alt={p.title} loading="lazy" />
                        {p.stock === 0 && <div className={styles.oos}>Out of stock</div>}
                        {p.comparePrice > p.price && <div className={styles.saleBadge}>SALE</div>}
                        <div className={styles.cardHover}>
                          <button
                            className={`${styles.addBtn} ${addedId === p.id ? styles.addBtnDone : ''}`}
                            onClick={e => handleAdd(e, p)}
                            disabled={p.stock === 0}
                          >
                            {addedId === p.id ? '✓ Added' : '+ Add to Cart'}
                          </button>
                        </div>
                      </div>
                      <div className={styles.cardBody}>
                        {p.brand && <p className={styles.cardBrand}>{p.brand}</p>}
                        <p className={styles.cardTitle}>{p.title}</p>
                        {p.rating > 0 && (
                          <div className={styles.cardRating}>
                            <Stars rating={Math.round(p.rating)} />
                            <span className={styles.ratingNum}>{p.rating.toFixed(1)}</span>
                            <span className={styles.ratingCount}>({p.reviewCount || 0})</span>
                          </div>
                        )}
                        <div className={styles.cardPrices}>
                          <span className={styles.price}>${Number(p.price).toFixed(2)}</span>
                          {p.comparePrice > p.price && <span className={styles.comparePrice}>${Number(p.comparePrice).toFixed(2)}</span>}
                        </div>
                        {p.stock > 0 && p.stock <= 5 && <p className={styles.lowStock}>Only {p.stock} left!</p>}
                      </div>
                    </Link>
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className={styles.pagination}>
                    <button className={styles.pageBtn} disabled={page <= 1} onClick={() => push({ page: String(page - 1) })}>← Prev</button>
                    <div className={styles.pageNums}>
                      {Array.from({ length: totalPages }, (_, i) => i + 1)
                        .filter(n => n === 1 || n === totalPages || Math.abs(n - page) <= 2)
                        .reduce<(number | '...')[]>((acc, n, i, arr) => {
                          if (i > 0 && n - (arr[i-1] as number) > 1) acc.push('...');
                          acc.push(n);
                          return acc;
                        }, [])
                        .map((n, i) => n === '...'
                          ? <span key={`e${i}`} className={styles.ellipsis}>…</span>
                          : <button key={n} className={`${styles.pageNum} ${page === n ? styles.pageNumActive : ''}`} onClick={() => push({ page: String(n) })}>{n}</button>
                        )}
                    </div>
                    <button className={styles.pageBtn} disabled={page >= totalPages} onClick={() => push({ page: String(page + 1) })}>Next →</button>
                  </div>
                )}
              </>
            )}
          </main>
        </div>
      </div>
      <AiSupport />
    </div>
  );
}
