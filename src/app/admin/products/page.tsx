'use client';

import React, { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { getDocs, collection, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/client';
import styles from '../admin.table.module.css';

export default function AdminProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [msg, setMsg] = useState('');

  useEffect(() => {
    getDocs(collection(db, 'products')).then(snap => {
      setProducts(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    }).finally(() => setLoading(false));
  }, []);

  const cats = useMemo(() => [...new Set(products.map(p => p.categoryId).filter(Boolean))].sort(), [products]);

  const filtered = useMemo(() => {
    let list = [...products];
    if (search) list = list.filter(p => p.title?.toLowerCase().includes(search.toLowerCase()) || p.brand?.toLowerCase().includes(search.toLowerCase()));
    if (catFilter !== 'all') list = list.filter(p => p.categoryId === catFilter);
    if (statusFilter !== 'all') list = list.filter(p => p.status === statusFilter);
    return list.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
  }, [products, search, catFilter, statusFilter]);

  const update = async (id: string, patch: any) => {
    await updateDoc(doc(db, 'products', id), patch);
    setProducts(prev => prev.map(p => p.id === id ? { ...p, ...patch } : p));
    setMsg('Updated'); setTimeout(() => setMsg(''), 2000);
  };

  const remove = async (id: string) => {
    if (!confirm('Delete this product?')) return;
    await deleteDoc(doc(db, 'products', id));
    setProducts(prev => prev.filter(p => p.id !== id));
  };

  const sc = (s: string) => s === 'active' ? '#15803d' : s === 'pending' ? '#92400e' : '#6b7280';

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div><h1 className={styles.title}>Products</h1><p className={styles.sub}>{products.length} total products</p></div>
        <Link href="/admin/add-product" className={styles.btnPrimary}>+ Add Product</Link>
      </div>

      <div className={styles.stats}>
        {[['All', products.length, 'all'], ['Active', products.filter(p=>p.status==='active').length, 'active'], ['Pending', products.filter(p=>p.status==='pending').length, 'pending'], ['Inactive', products.filter(p=>p.status==='inactive').length, 'inactive']].map(([l, v, f]) => (
          <button key={String(f)} className={`${styles.statCard} ${statusFilter === f ? styles.statCardActive : ''}`} onClick={() => setStatusFilter(String(f))}>
            <span className={styles.statVal}>{v}</span><span className={styles.statLabel}>{l}</span>
          </button>
        ))}
      </div>

      {msg && <div className={styles.successBanner}>✓ {msg}</div>}

      <div className={styles.toolbar}>
        <div className={styles.searchWrap}><span>🔍</span><input className={styles.searchInput} placeholder="Search products..." value={search} onChange={e => setSearch(e.target.value)} /></div>
        <select className={styles.select} value={catFilter} onChange={e => setCatFilter(e.target.value)}>
          <option value="all">All Categories</option>
          {cats.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      <div className={styles.tableCard}>
        {loading ? <div className={styles.loading}>Loading products...</div> : (
          <table className={styles.table}>
            <thead><tr><th>Product</th><th>Category</th><th>Price</th><th>Stock</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody>
              {filtered.length === 0 ? <tr><td colSpan={6} className={styles.empty}>No products found</td></tr> :
                filtered.map(p => (
                  <tr key={p.id}>
                    <td>
                      <div className={styles.productCell}>
                        {p.images?.[0] && <img src={p.images[0]} alt="" className={styles.thumb} />}
                        <div><p style={{ fontSize: '0.82rem', fontWeight: 600, color: '#111' }}>{p.title}</p>{p.brand && <p style={{ fontSize: '0.7rem', color: '#888' }}>{p.brand}</p>}</div>
                      </div>
                    </td>
                    <td><span className={styles.pill} style={{ color: '#555', background: '#f0f0f0' }}>{p.categoryId}</span></td>
                    <td className={styles.amount}>${Number(p.price).toFixed(2)}</td>
                    <td style={{ color: p.stock === 0 ? '#ef4444' : p.stock <= 5 ? '#f59e0b' : '#333' }}>{p.stock}</td>
                    <td>
                      <select className={styles.inlineSelect} value={p.status || 'active'} style={{ color: sc(p.status) }}
                        onChange={e => update(p.id, { status: e.target.value })}>
                        <option value="active">Active</option>
                        <option value="pending">Pending</option>
                        <option value="inactive">Inactive</option>
                      </select>
                    </td>
                    <td>
                      <div className={styles.actions}>
                        <Link href={`/products/${p.id}`} className={styles.btnBlue}>View</Link>
                        <button className={styles.btnRed} onClick={() => remove(p.id)}>Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

