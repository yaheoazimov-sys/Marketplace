'use client';

import React, { useEffect, useState } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useAuth } from '@/contexts/AuthContext';
import Navbar from '@/components/Navbar';
import styles from './seller.module.css';

const CATEGORIES = ['electronics','clothing','fashion','food','handmade','home','sports','cars'];

interface Product { id: string; title: string; price: number; stock: number; status: string; categoryId: string; description: string; images: string[]; }
interface Order { id: string; createdAt: string; status: string; totalAmount: number; items: any[]; }

const emptyForm = { title: '', description: '', price: '', stock: '', categoryId: 'clothing', images: '' };

export default function SellerDashboard() {
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [tab, setTab] = useState<'products'|'orders'>('products');
  const [showForm, setShowForm] = useState(false);
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const getToken = async () => (await user?.getIdToken()) ?? '';

  const fetchProducts = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/products?sellerId=${user.uid}`, { headers: { Authorization: `Bearer ${await getToken()}` } });
      const d = await res.json();
      setProducts(d.products || []);
    } catch { setProducts([]); } finally { setLoading(false); }
  };

  const fetchOrders = async () => {
    if (!user) return;
    try {
      const res = await fetch('/api/orders', { headers: { Authorization: `Bearer ${await getToken()}` } });
      const d = await res.json();
      setOrders(d.orders || []);
    } catch { setOrders([]); }
  };

  useEffect(() => { if (user) { fetchProducts(); fetchOrders(); } }, [user]);

  const openCreate = () => { setEditProduct(null); setForm(emptyForm); setError(''); setShowForm(true); };
  const openEdit = (p: Product) => {
    setEditProduct(p);
    setForm({ title: p.title, description: p.description, price: String(p.price), stock: String(p.stock), categoryId: p.categoryId, images: p.images?.join(', ') || '' });
    setError(''); setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true); setError('');
    try {
      const body = { title: form.title, description: form.description, price: Number(form.price), stock: Number(form.stock), categoryId: form.categoryId, images: form.images.split(',').map(s => s.trim()).filter(Boolean) };
      const url = editProduct ? `/api/products/${editProduct.id}` : '/api/products';
      const method = editProduct ? 'PUT' : 'POST';
      const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${await getToken()}` }, body: JSON.stringify(body) });
      if (!res.ok) { const d = await res.json(); throw new Error(d.error); }
      setShowForm(false); fetchProducts();
    } catch (err: any) { setError(err.message); } finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this product?')) return;
    try {
      await fetch(`/api/products/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${await getToken()}` } });
      fetchProducts();
    } catch {}
  };

  const statusColor = (s: string) => s === 'active' ? '#22c55e' : s === 'pending' ? '#f59e0b' : '#ef4444';

  return (
    <ProtectedRoute allowedRoles={['seller', 'admin']}>
      <Navbar />
      <div className={styles.page}>
        <div className={styles.header}>
          <h1 className={styles.title}>Seller Portal</h1>
          <div className={styles.tabs}>
            <button className={`${styles.tab} ${tab === 'products' ? styles.tabActive : ''}`} onClick={() => setTab('products')}>📦 Products</button>
            <button className={`${styles.tab} ${tab === 'orders' ? styles.tabActive : ''}`} onClick={() => setTab('orders')}>🧾 Orders</button>
          </div>
        </div>

        {/* ── Products Tab ── */}
        {tab === 'products' && (
          <div className={styles.section}>
            <div className={styles.sectionHeader}>
              <h2>My Products <span className={styles.badge}>{products.length}</span></h2>
              <button className={styles.btnPrimary} onClick={openCreate}>+ Add Product</button>
            </div>
            {loading ? <p className={styles.muted}>Loading...</p> : products.length === 0 ? (
              <div className={styles.empty}><p>No products yet.</p><button className={styles.btnPrimary} onClick={openCreate}>Add your first product</button></div>
            ) : (
              <div className={styles.tableWrap}>
                <table className={styles.table}>
                  <thead><tr><th>Product</th><th>Category</th><th>Price</th><th>Stock</th><th>Status</th><th>Actions</th></tr></thead>
                  <tbody>
                    {products.map(p => (
                      <tr key={p.id}>
                        <td><div className={styles.productCell}>{p.images?.[0] && <img src={p.images[0]} alt="" className={styles.thumb} />}<span>{p.title}</span></div></td>
                        <td><span className={styles.catTag}>{p.categoryId}</span></td>
                        <td className={styles.price}>${Number(p.price).toFixed(2)}</td>
                        <td style={{ color: p.stock === 0 ? '#ef4444' : 'inherit' }}>{p.stock}</td>
                        <td><span className={styles.statusBadge} style={{ background: statusColor(p.status) + '20', color: statusColor(p.status) }}>{p.status}</span></td>
                        <td className={styles.actions}>
                          <button className={styles.btnEdit} onClick={() => openEdit(p)}>Edit</button>
                          <button className={styles.btnDelete} onClick={() => handleDelete(p.id)}>Delete</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
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
                        <td><span className={styles.statusBadge} style={{ background: o.status === 'paid' ? '#22c55e20' : '#f59e0b20', color: o.status === 'paid' ? '#22c55e' : '#f59e0b' }}>{o.status}</span></td>
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
                <h2>{editProduct ? 'Edit Product' : 'Add New Product'}</h2>
                <button className={styles.closeBtn} onClick={() => setShowForm(false)}>✕</button>
              </div>
              {error && <div className={styles.errorMsg}>{error}</div>}
              <form onSubmit={handleSubmit} className={styles.form}>
                <div className={styles.formRow}>
                  <div className={styles.field}>
                    <label>Title *</label>
                    <input required value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="Product name" />
                  </div>
                  <div className={styles.field}>
                    <label>Category *</label>
                    <select value={form.categoryId} onChange={e => setForm(f => ({ ...f, categoryId: e.target.value }))}>
                      {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                </div>
                <div className={styles.field}>
                  <label>Description</label>
                  <textarea rows={3} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Product description..." />
                </div>
                <div className={styles.formRow}>
                  <div className={styles.field}>
                    <label>Price ($) *</label>
                    <input required type="number" min="0" step="0.01" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} placeholder="0.00" />
                  </div>
                  <div className={styles.field}>
                    <label>Stock *</label>
                    <input required type="number" min="0" value={form.stock} onChange={e => setForm(f => ({ ...f, stock: e.target.value }))} placeholder="0" />
                  </div>
                </div>
                <div className={styles.field}>
                  <label>Image URLs (comma-separated)</label>
                  <input value={form.images} onChange={e => setForm(f => ({ ...f, images: e.target.value }))} placeholder="https://example.com/image.jpg, ..." />
                </div>
                <div className={styles.formActions}>
                  <button type="button" className={styles.btnSecondary} onClick={() => setShowForm(false)}>Cancel</button>
                  <button type="submit" className={styles.btnPrimary} disabled={saving}>{saving ? 'Saving...' : editProduct ? 'Save Changes' : 'Create Product'}</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
