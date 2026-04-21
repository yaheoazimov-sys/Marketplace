'use client';

import React, { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { getProducts, deleteProduct, updateProduct } from '@/lib/firebase/firestore';
import styles from '../seller.page.module.css';
import tStyles from '../orders/orders.module.css';
import pStyles from './products.module.css';

export default function SellerProducts() {
  const { user } = useAuth();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterCat, setFilterCat] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  const fetchProducts = async () => {
    if (!user) return;
    setLoading(true);
    getProducts({ sellerId: user.uid }).then(setProducts).finally(() => setLoading(false));
  };

  useEffect(() => { fetchProducts(); }, [user]);

  const filtered = useMemo(() => {
    let list = [...products];
    if (search) list = list.filter(p => p.title?.toLowerCase().includes(search.toLowerCase()) || p.brand?.toLowerCase().includes(search.toLowerCase()));
    if (filterCat !== 'all') list = list.filter(p => p.categoryId === filterCat);
    if (filterStatus !== 'all') list = list.filter(p => p.status === filterStatus);
    return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [products, search, filterCat, filterStatus]);

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this product?')) return;
    await deleteProduct(id);
    setProducts(prev => prev.filter(p => p.id !== id));
  };

  const toggleStatus = async (p: any) => {
    const newStatus = p.status === 'active' ? 'inactive' : 'active';
    await updateProduct(p.id, { status: newStatus });
    setProducts(prev => prev.map(x => x.id === p.id ? { ...x, status: newStatus } : x));
  };

  const cats = [...new Set(products.map(p => p.categoryId).filter(Boolean))];

  return (
    <div>
      <div className={styles.welcome}>
        <div>
          <h1 className={styles.title}>Products</h1>
          <p className={styles.subtitle}>{products.length} products · {products.filter(p=>p.status==='active').length} active</p>
        </div>
        <Link href="/seller/products/new" className={styles.addBtn}>+ Add Product</Link>
      </div>

      <div className={tStyles.toolbar}>
        <div className={tStyles.searchWrap}>
          <span>🔍</span>
          <input className={tStyles.searchInput} placeholder="Search by title or brand..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select className={tStyles.select} value={filterCat} onChange={e => setFilterCat(e.target.value)}>
          <option value="all">All Categories</option>
          {cats.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <select className={tStyles.select} value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="pending">Pending</option>
        </select>
      </div>

      {loading ? (
        <div className={tStyles.card}><div className={tStyles.loading}>Loading products...</div></div>
      ) : filtered.length === 0 ? (
        <div className={tStyles.card}>
          <div className={tStyles.empty}>
            {products.length === 0 ? (
              <div className={pStyles.emptyState}>
                <span>📦</span>
                <p>No products yet</p>
                <Link href="/seller/products/new" className={pStyles.emptyBtn}>Add your first product</Link>
              </div>
            ) : 'No products match your filters.'}
          </div>
        </div>
      ) : (
        <div className={pStyles.grid}>
          {filtered.map(p => (
            <div key={p.id} className={pStyles.card}>
              <div className={pStyles.img}>
                {p.images?.[0] ? <img src={p.images[0]} alt={p.title} /> : <span className={pStyles.noImg}>📷</span>}
                <span className={pStyles.statusDot} style={{ background: p.status === 'active' ? '#22c55e' : p.status === 'pending' ? '#f59e0b' : '#9ca3af' }} />
              </div>
              <div className={pStyles.info}>
                {p.brand && <p className={pStyles.brand}>{p.brand}</p>}
                <p className={pStyles.name}>{p.title}</p>
                <p className={pStyles.cat}>{p.categoryId}</p>
                <div className={pStyles.meta}>
                  {p.colors?.slice(0,4).map((c: string) => (
                    <span key={c} className={pStyles.colorDot} style={{ background: c==='White'?'#f0f0f0':c==='Beige'?'#f5f0e8':c.toLowerCase() }} title={c} />
                  ))}
                  {p.sizes?.length > 0 && <span className={pStyles.sizeCount}>{p.sizes.length} sizes</span>}
                </div>
                <div className={pStyles.footer}>
                  <span className={pStyles.price}>${Number(p.price).toFixed(2)}</span>
                  <span className={pStyles.stock} style={{ color: p.stock === 0 ? '#ef4444' : p.stock <= 5 ? '#f59e0b' : '#888' }}>
                    {p.stock === 0 ? 'Out of stock' : `${p.stock} in stock`}
                  </span>
                </div>
              </div>
              <div className={pStyles.actions}>
                <Link href={`/seller/products/${p.id}/edit`} className={pStyles.btnEdit}>Edit</Link>
                <button className={pStyles.btnToggle} onClick={() => toggleStatus(p)}>
                  {p.status === 'active' ? 'Deactivate' : 'Activate'}
                </button>
                <button className={pStyles.btnDelete} onClick={() => handleDelete(p.id)}>🗑️</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

