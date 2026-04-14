'use client';

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import Link from 'next/link';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useAuth } from '@/contexts/AuthContext';
import Navbar from '@/components/Navbar';
import styles from './seller.module.css';

const CATEGORIES = ['electronics','clothing','fashion','food','handmade','home','sports','cars'];
const SIZES = ['XS','S','M','L','XL','XXL','XXXL','28','30','32','34','36','38','40','42','One Size'];
const COLORS = ['Black','White','Navy','Grey','Beige','Brown','Red','Blue','Green','Yellow','Pink','Purple','Orange','Khaki','Camel'];
const STATUS_OPTIONS = ['active','pending','inactive'];

interface Product {
  id: string; title: string; description: string; brand: string;
  price: number; comparePrice: number; stock: number; sku: string;
  categoryId: string; status: string;
  images: string[]; sizes: string[]; colors: string[];
  attributes: Record<string, string>;
  rating: number; reviewCount: number; createdAt: string;
}

interface Order { id: string; createdAt: string; status: string; totalAmount: number; items: any[]; }

const emptyForm = (): Partial<Product> => ({
  title: '', description: '', brand: '', price: 0, comparePrice: 0,
  stock: 0, sku: '', categoryId: 'clothing', status: 'active',
  images: [], sizes: [], colors: [], attributes: {},
});

export default function SellerDashboard() {
  return (
    <ProtectedRoute allowedRoles={['seller', 'admin']}>
      <DashboardContent />
    </ProtectedRoute>
  );
}

function DashboardContent() {
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [tab, setTab] = useState<'products' | 'orders'>('products');
  const [showForm, setShowForm] = useState(false);
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [form, setForm] = useState<Partial<Product>>(emptyForm());
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Filters
  const [search, setSearch] = useState('');
  const [filterCat, setFilterCat] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortBy, setSortBy] = useState('newest');

  // Image input helper
  const [imgInput, setImgInput] = useState('');
  // Attribute helper
  const [attrKey, setAttrKey] = useState('');
  const [attrVal, setAttrVal] = useState('');

  const getToken = async () => (await user?.getIdToken()) ?? '';

  const fetchProducts = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/products?sellerId=${user.uid}`, {
        headers: { Authorization: `Bearer ${await getToken()}` },
      });
      const d = await res.json();
      setProducts(d.products || []);
    } catch { setProducts([]); }
    finally { setLoading(false); }
  }, [user]);

  const fetchOrders = useCallback(async () => {
    if (!user) return;
    try {
      const res = await fetch('/api/orders', { headers: { Authorization: `Bearer ${await getToken()}` } });
      const d = await res.json();
      setOrders(d.orders || []);
    } catch { setOrders([]); }
  }, [user]);

  useEffect(() => { fetchProducts(); fetchOrders(); }, [fetchProducts, fetchOrders]);

  // Filtered + sorted products
  const filtered = useMemo(() => {
    let list = [...products];
    if (search) list = list.filter(p => p.title.toLowerCase().includes(search.toLowerCase()) || p.brand?.toLowerCase().includes(search.toLowerCase()));
    if (filterCat !== 'all') list = list.filter(p => p.categoryId === filterCat);
    if (filterStatus !== 'all') list = list.filter(p => p.status === filterStatus);
    if (sortBy === 'newest') list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    else if (sortBy === 'price_asc') list.sort((a, b) => a.price - b.price);
    else if (sortBy === 'price_desc') list.sort((a, b) => b.price - a.price);
    else if (sortBy === 'stock') list.sort((a, b) => a.stock - b.stock);
    return list;
  }, [products, search, filterCat, filterStatus, sortBy]);

  const openCreate = () => {
    setEditProduct(null);
    setForm(emptyForm());
    setImgInput('');
    setAttrKey(''); setAttrVal('');
    setError(''); setShowForm(true);
  };

  const openEdit = (p: Product) => {
    setEditProduct(p);
    setForm({ ...p });
    setImgInput(p.images?.join(', ') || '');
    setAttrKey(''); setAttrVal('');
    setError(''); setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true); setError('');
    try {
      const body = {
        ...form,
        price: Number(form.price),
        comparePrice: Number(form.comparePrice) || 0,
        stock: Number(form.stock),
        images: imgInput.split(',').map(s => s.trim()).filter(Boolean),
      };
      const url = editProduct ? `/api/products/${editProduct.id}` : '/api/products';
      const method = editProduct ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${await getToken()}` },
        body: JSON.stringify(body),
      });
      if (!res.ok) { const d = await res.json(); throw new Error(d.error); }
      setShowForm(false);
      setSuccess(editProduct ? 'Product updated!' : 'Product created!');
      setTimeout(() => setSuccess(''), 3000);
      fetchProducts();
    } catch (err: any) { setError(err.message); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this product? This cannot be undone.')) return;
    try {
      await fetch(`/api/products/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${await getToken()}` } });
      setProducts(prev => prev.filter(p => p.id !== id));
    } catch {}
  };

  const toggleSize = (s: string) => setForm(f => ({ ...f, sizes: f.sizes?.includes(s) ? f.sizes.filter(x => x !== s) : [...(f.sizes || []), s] }));
  const toggleColor = (c: string) => setForm(f => ({ ...f, colors: f.colors?.includes(c) ? f.colors.filter(x => x !== c) : [...(f.colors || []), c] }));
  const addAttr = () => { if (!attrKey.trim()) return; setForm(f => ({ ...f, attributes: { ...(f.attributes || {}), [attrKey.trim()]: attrVal.trim() } })); setAttrKey(''); setAttrVal(''); };
  const removeAttr = (k: string) => setForm(f => { const a = { ...(f.attributes || {}) }; delete a[k]; return { ...f, attributes: a }; });

  const sc = (s: string) => s === 'active' ? '#22c55e' : s === 'pending' ? '#f59e0b' : '#ef4444';

  // Stats
  const totalRevenue = products.reduce((s, p) => s + p.price * (p.reviewCount || 0), 0);
  const lowStock = products.filter(p => p.stock <= 5).length;

  return (
    <>
      <Navbar />
      <div className={styles.page}>

        {/* Header */}
        <div className={styles.header}>
          <div>
            <h1 className={styles.title}>Seller Dashboard</h1>
            <p className={styles.subtitle}>Manage your products and orders</p>
          </div>
          <div className={styles.tabs}>
            <button className={`${styles.tab} ${tab === 'products' ? styles.tabActive : ''}`} onClick={() => setTab('products')}>📦 Products</button>
            <button className={`${styles.tab} ${tab === 'orders' ? styles.tabActive : ''}`} onClick={() => setTab('orders')}>🧾 Orders</button>
          </div>
        </div>

        {/* Stats */}
        <div className={styles.stats}>
          <div className={styles.stat}><span className={styles.statVal}>{products.length}</span><span className={styles.statLabel}>Total Products</span></div>
          <div className={styles.stat}><span className={styles.statVal}>{products.filter(p => p.status === 'active').length}</span><span className={styles.statLabel}>Active</span></div>
          <div className={styles.stat}><span className={styles.statVal} style={{ color: lowStock > 0 ? '#ef4444' : 'inherit' }}>{lowStock}</span><span className={styles.statLabel}>Low Stock (≤5)</span></div>
          <div className={styles.stat}><span className={styles.statVal}>{orders.length}</span><span className={styles.statLabel}>Orders</span></div>
        </div>

        {success && <div className={styles.successBanner}>✓ {success}</div>}

        {/* ── Products Tab ── */}
        {tab === 'products' && (
          <div className={styles.section}>
            {/* Toolbar */}
            <div className={styles.toolbar}>
              <div className={styles.searchWrap}>
                <span>🔍</span>
                <input className={styles.searchInput} placeholder="Search by title or brand..." value={search} onChange={e => setSearch(e.target.value)} />
              </div>
              <select className={styles.filterSelect} value={filterCat} onChange={e => setFilterCat(e.target.value)}>
                <option value="all">All Categories</option>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              <select className={styles.filterSelect} value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
                <option value="all">All Status</option>
                {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
              <select className={styles.filterSelect} value={sortBy} onChange={e => setSortBy(e.target.value)}>
                <option value="newest">Newest</option>
                <option value="price_asc">Price ↑</option>
                <option value="price_desc">Price ↓</option>
                <option value="stock">Low Stock</option>
              </select>
              <Link href="/seller/products/new" className={styles.btnPrimary}>+ Add Product</Link>
            </div>

            <p className={styles.resultCount}>{filtered.length} of {products.length} products</p>

            {loading ? (
              <div className={styles.skeletonGrid}>{Array(6).fill(null).map((_, i) => <div key={i} className={styles.skeleton} />)}</div>
            ) : filtered.length === 0 ? (
              <div className={styles.empty}>
                <span>📦</span>
                <p>{products.length === 0 ? 'No products yet.' : 'No products match your filters.'}</p>
                {products.length === 0 && <button className={styles.btnPrimary} onClick={openCreate}>Add your first product</button>}
              </div>
            ) : (
              <div className={styles.productGrid}>
                {filtered.map(p => (
                  <div key={p.id} className={styles.productCard}>
                    <div className={styles.productImg}>
                      {p.images?.[0] ? <img src={p.images[0]} alt={p.title} /> : <span className={styles.noImg}>📷</span>}
                      <span className={styles.productStatus} style={{ background: sc(p.status) + '22', color: sc(p.status) }}>{p.status}</span>
                    </div>
                    <div className={styles.productInfo}>
                      {p.brand && <p className={styles.productBrand}>{p.brand}</p>}
                      <p className={styles.productTitle}>{p.title}</p>
                      <p className={styles.productCat}>{p.categoryId}</p>
                      <div className={styles.productMeta}>
                        {p.colors?.slice(0, 4).map(c => <span key={c} className={styles.colorDot} title={c} style={{ background: c.toLowerCase() === 'white' ? '#f0f0f0' : c.toLowerCase() }} />)}
                        {p.sizes?.length > 0 && <span className={styles.sizeCount}>{p.sizes.length} sizes</span>}
                      </div>
                      <div className={styles.productFooter}>
                        <div>
                          <span className={styles.productPrice}>${Number(p.price).toFixed(2)}</span>
                          {p.comparePrice > p.price && <span className={styles.comparePrice}>${Number(p.comparePrice).toFixed(2)}</span>}
                        </div>
                        <span className={styles.stockBadge} style={{ color: p.stock <= 5 ? '#ef4444' : '#22c55e' }}>Stock: {p.stock}</span>
                      </div>
                    </div>
                    <div className={styles.productActions}>
                      <button className={styles.btnEdit} onClick={() => openEdit(p)}>✏️ Edit</button>
                      <button className={styles.btnDelete} onClick={() => handleDelete(p.id)}>🗑️</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── Orders Tab ── */}
        {tab === 'orders' && (
          <div className={styles.section}>
            <div className={styles.sectionHeader}><h2>Orders <span className={styles.badge}>{orders.length}</span></h2></div>
            {orders.length === 0 ? <p className={styles.muted}>No orders yet.</p> : (
              <div className={styles.tableWrap}>
                <table className={styles.table}>
                  <thead><tr><th>Order ID</th><th>Date</th><th>Items</th><th>Total</th><th>Status</th></tr></thead>
                  <tbody>
                    {orders.map(o => (
                      <tr key={o.id}>
                        <td className={styles.orderId}>{o.id.slice(0, 8)}…</td>
                        <td>{new Date(o.createdAt).toLocaleDateString()}</td>
                        <td>{o.items?.length ?? 0} items</td>
                        <td className={styles.price}>${Number(o.totalAmount).toFixed(2)}</td>
                        <td><span className={styles.statusBadge} style={{ background: sc(o.status) + '20', color: sc(o.status) }}>{o.status}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ── Product Form Modal ── */}
        {showForm && (
          <div className={styles.overlay} onClick={e => e.target === e.currentTarget && setShowForm(false)}>
            <div className={styles.modal}>
              <div className={styles.modalHeader}>
                <h2>{editProduct ? '✏️ Edit Product' : '+ New Product'}</h2>
                <button className={styles.closeBtn} onClick={() => setShowForm(false)}>✕</button>
              </div>

              {error && <div className={styles.errorMsg}>✕ {error}</div>}

              <form onSubmit={handleSubmit} className={styles.form}>

                {/* Basic Info */}
                <div className={styles.formSection}>
                  <h3 className={styles.formSectionTitle}>Basic Information</h3>
                  <div className={styles.formRow}>
                    <div className={styles.field}>
                      <label>Title *</label>
                      <input required value={form.title || ''} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="Product name" />
                    </div>
                    <div className={styles.field}>
                      <label>Brand</label>
                      <input value={form.brand || ''} onChange={e => setForm(f => ({ ...f, brand: e.target.value }))} placeholder="e.g. BOSS, Nike..." />
                    </div>
                  </div>
                  <div className={styles.field}>
                    <label>Description</label>
                    <textarea rows={4} value={form.description || ''} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Detailed product description..." />
                  </div>
                  <div className={styles.formRow}>
                    <div className={styles.field}>
                      <label>Category *</label>
                      <select value={form.categoryId || 'clothing'} onChange={e => setForm(f => ({ ...f, categoryId: e.target.value }))}>
                        {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                    <div className={styles.field}>
                      <label>Status</label>
                      <select value={form.status || 'active'} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}>
                        {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                    <div className={styles.field}>
                      <label>SKU</label>
                      <input value={form.sku || ''} onChange={e => setForm(f => ({ ...f, sku: e.target.value }))} placeholder="BOSS-001" />
                    </div>
                  </div>
                </div>

                {/* Pricing & Stock */}
                <div className={styles.formSection}>
                  <h3 className={styles.formSectionTitle}>Pricing & Stock</h3>
                  <div className={styles.formRow}>
                    <div className={styles.field}>
                      <label>Price ($) *</label>
                      <input required type="number" min="0" step="0.01" value={form.price || ''} onChange={e => setForm(f => ({ ...f, price: Number(e.target.value) }))} placeholder="0.00" />
                    </div>
                    <div className={styles.field}>
                      <label>Compare Price ($)</label>
                      <input type="number" min="0" step="0.01" value={form.comparePrice || ''} onChange={e => setForm(f => ({ ...f, comparePrice: Number(e.target.value) }))} placeholder="Original price" />
                    </div>
                    <div className={styles.field}>
                      <label>Stock *</label>
                      <input required type="number" min="0" value={form.stock || ''} onChange={e => setForm(f => ({ ...f, stock: Number(e.target.value) }))} placeholder="0" />
                    </div>
                  </div>
                </div>

                {/* Images */}
                <div className={styles.formSection}>
                  <h3 className={styles.formSectionTitle}>Images</h3>
                  <div className={styles.field}>
                    <label>Image URLs (comma-separated)</label>
                    <textarea rows={2} value={imgInput} onChange={e => setImgInput(e.target.value)} placeholder="https://example.com/img1.jpg, https://example.com/img2.jpg" />
                  </div>
                  {imgInput && (
                    <div className={styles.imgPreview}>
                      {imgInput.split(',').map(s => s.trim()).filter(Boolean).map((url, i) => (
                        <img key={i} src={url} alt="" className={styles.imgThumb} onError={e => (e.currentTarget.style.display = 'none')} />
                      ))}
                    </div>
                  )}
                </div>

                {/* Sizes */}
                <div className={styles.formSection}>
                  <h3 className={styles.formSectionTitle}>Sizes</h3>
                  <div className={styles.tagGrid}>
                    {SIZES.map(s => (
                      <button key={s} type="button" className={`${styles.tag} ${form.sizes?.includes(s) ? styles.tagActive : ''}`} onClick={() => toggleSize(s)}>{s}</button>
                    ))}
                  </div>
                </div>

                {/* Colors */}
                <div className={styles.formSection}>
                  <h3 className={styles.formSectionTitle}>Colors</h3>
                  <div className={styles.colorGrid}>
                    {COLORS.map(c => (
                      <button key={c} type="button" className={`${styles.colorBtn} ${form.colors?.includes(c) ? styles.colorBtnActive : ''}`} onClick={() => toggleColor(c)} title={c}>
                        <span className={styles.colorSwatch} style={{ background: c.toLowerCase() === 'white' ? '#f0f0f0' : c.toLowerCase() === 'beige' ? '#f5f0e8' : c.toLowerCase() === 'camel' ? '#c19a6b' : c.toLowerCase() === 'khaki' ? '#8b8b6b' : c.toLowerCase() }} />
                        <span>{c}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Custom Attributes */}
                <div className={styles.formSection}>
                  <h3 className={styles.formSectionTitle}>Custom Attributes</h3>
                  <div className={styles.attrRow}>
                    <input className={styles.attrInput} value={attrKey} onChange={e => setAttrKey(e.target.value)} placeholder="Key (e.g. Material)" />
                    <input className={styles.attrInput} value={attrVal} onChange={e => setAttrVal(e.target.value)} placeholder="Value (e.g. 100% Cotton)" />
                    <button type="button" className={styles.btnSecondary} onClick={addAttr}>Add</button>
                  </div>
                  {Object.entries(form.attributes || {}).length > 0 && (
                    <div className={styles.attrList}>
                      {Object.entries(form.attributes || {}).map(([k, v]) => (
                        <div key={k} className={styles.attrChip}>
                          <span><strong>{k}:</strong> {v}</span>
                          <button type="button" onClick={() => removeAttr(k)}>✕</button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className={styles.formActions}>
                  <button type="button" className={styles.btnSecondary} onClick={() => setShowForm(false)}>Cancel</button>
                  <button type="submit" className={styles.btnPrimary} disabled={saving}>
                    {saving ? 'Saving...' : editProduct ? 'Save Changes' : 'Create Product'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
