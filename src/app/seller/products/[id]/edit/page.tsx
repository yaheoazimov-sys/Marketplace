'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { getProduct, updateProduct } from '@/lib/firebase/firestore';
import { useAuth } from '@/contexts/AuthContext';
import ImageUrlPicker from '@/components/ImageUrlPicker';
import styles from '../../new/new.module.css';

const CATS = [
  { id: 'clothing', label: 'Clothing' },
  { id: 'electronics', label: 'Electronics' },
  { id: 'fashion', label: 'Fashion & Accessories' },
  { id: 'food', label: 'Food & Drinks' },
  { id: 'handmade', label: 'Handmade & Creative' },
  { id: 'home', label: 'Home & Garden' },
  { id: 'sports', label: 'Sports & Outdoors' },
  { id: 'cars', label: 'Cars & Auto' },
];

const SIZES = ['XS','S','M','L','XL','XXL','XXXL','28','30','32','34','36','38','40','42','One Size'];
const COLORS = ['Black','White','Navy','Grey','Beige','Brown','Red','Blue','Green','Yellow','Pink','Purple','Orange','Khaki','Camel'];

export default function EditProductPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [images, setImages] = useState<string[]>([]);
  const [title, setTitle] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [comparePrice, setComparePrice] = useState('');
  const [stock, setStock] = useState('');
  const [sku, setSku] = useState('');
  const [tags, setTags] = useState('');
  const [brand, setBrand] = useState('');
  const [sizes, setSizes] = useState<string[]>([]);
  const [colors, setColors] = useState<string[]>([]);
  const [status, setStatus] = useState('active');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) return;
    getProduct(id).then(p => {
      if (!p) { router.push('/seller/products'); return; }
      setImages(p.images || []);
      setTitle(p.title || '');
      setCategoryId(p.categoryId || '');
      setDescription(p.description || '');
      setPrice(String(p.price || ''));
      setComparePrice(String(p.comparePrice || ''));
      setStock(String(p.stock || ''));
      setSku(p.sku || '');
      setTags(p.tags?.join(', ') || '');
      setBrand(p.brand || '');
      setSizes(p.sizes || []);
      setColors(p.colors || []);
      setStatus(p.status || 'active');
    }).finally(() => setLoading(false));
  }, [id]);

  const toggleSize = (s: string) => setSizes(p => p.includes(s) ? p.filter(x => x !== s) : [...p, s]);
  const toggleColor = (c: string) => setColors(p => p.includes(c) ? p.filter(x => x !== c) : [...p, c]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (images.length === 0) { setError('Add at least one photo'); return; }
    setSaving(true); setError('');
    try {
      await updateProduct(id, {
        title, brand, description, categoryId, status,
        price: Number(price),
        comparePrice: Number(comparePrice) || 0,
        stock: Number(stock),
        sku,
        tags: tags.split(',').map(t => t.trim()).filter(Boolean),
        images, sizes, colors,
      });
      router.push('/seller/products');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div style={{ padding: '2rem', color: '#888' }}>Loading...</div>;

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <Link href="/seller/products" className={styles.back}>← Back</Link>
        <h1 className={styles.title}>Edit Product</h1>
      </div>

      <form onSubmit={handleSubmit} className={styles.form}>

        <div className={styles.card}>
          <h2 className={styles.cardTitle}>Photos</h2>
          <p className={styles.cardSub}>Up to 5 photos. First photo is the main one. Drag to reorder.</p>
          <ImageUrlPicker images={images} onChange={setImages} max={5} />
        </div>

        <div className={styles.card}>
          <h2 className={styles.cardTitle}>Basic Information</h2>
          <div className={styles.field}>
            <label>Title *</label>
            <input required value={title} onChange={e => setTitle(e.target.value)} placeholder="Product name" />
          </div>
          <div className={styles.field}>
            <label>Brand</label>
            <input value={brand} onChange={e => setBrand(e.target.value)} placeholder="BOSS, Nike..." />
          </div>
          <div className={styles.row2}>
            <div className={styles.field}>
              <label>Category *</label>
              <select value={categoryId} onChange={e => setCategoryId(e.target.value)}>
                <option value="">Select category</option>
                {CATS.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
              </select>
            </div>
            <div className={styles.field}>
              <label>Status</label>
              <select value={status} onChange={e => setStatus(e.target.value)}>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="pending">Pending</option>
              </select>
            </div>
          </div>
          <div className={styles.field}>
            <label>Description *</label>
            <textarea required rows={5} value={description} onChange={e => setDescription(e.target.value)} placeholder="Detailed product description" />
          </div>
        </div>

        <div className={styles.card}>
          <h2 className={styles.cardTitle}>Sizes</h2>
          <div className={styles.tagGrid}>
            {SIZES.map(s => (
              <button key={s} type="button" className={`${styles.tag} ${sizes.includes(s) ? styles.tagActive : ''}`} onClick={() => toggleSize(s)}>{s}</button>
            ))}
          </div>
        </div>

        <div className={styles.card}>
          <h2 className={styles.cardTitle}>Colors</h2>
          <div className={styles.colorGrid}>
            {COLORS.map(c => (
              <button key={c} type="button" className={`${styles.colorBtn} ${colors.includes(c) ? styles.colorBtnActive : ''}`} onClick={() => toggleColor(c)}>
                <span className={styles.swatch} style={{ background: c === 'White' ? '#f0f0f0' : c === 'Beige' ? '#f5f0e8' : c === 'Camel' ? '#c19a6b' : c === 'Khaki' ? '#8b8b6b' : c.toLowerCase() }} />
                {c}
              </button>
            ))}
          </div>
        </div>

        <div className={styles.card}>
          <h2 className={styles.cardTitle}>Price & Availability</h2>
          <div className={styles.row2}>
            <div className={styles.field}>
              <label>Price ($) *</label>
              <input required type="number" min="0" step="0.01" value={price} onChange={e => setPrice(e.target.value)} placeholder="0.00" />
            </div>
            <div className={styles.field}>
              <label>Old Price ($)</label>
              <input type="number" min="0" step="0.01" value={comparePrice} onChange={e => setComparePrice(e.target.value)} placeholder="0.00" />
            </div>
          </div>
          <div className={styles.row2}>
            <div className={styles.field}>
              <label>Quantity *</label>
              <input required type="number" min="0" value={stock} onChange={e => setStock(e.target.value)} placeholder="0" />
            </div>
            <div className={styles.field}>
              <label>SKU</label>
              <input value={sku} onChange={e => setSku(e.target.value)} placeholder="PROD-001" />
            </div>
          </div>
          <div className={styles.field}>
            <label>Tags (comma-separated)</label>
            <input value={tags} onChange={e => setTags(e.target.value)} placeholder="clothing, luxury" />
          </div>
        </div>

        {error && <div className={styles.error}>{error}</div>}

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <Link href="/seller/products" style={{ flex: 1, padding: '0.75rem', textAlign: 'center', border: '1px solid #ddd', borderRadius: '10px', color: '#555', fontSize: '0.9rem' }}>
            Cancel
          </Link>
          <button type="submit" className={styles.submitBtn} disabled={saving} style={{ flex: 2 }}>
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
}
