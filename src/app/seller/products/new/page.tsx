'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { collection, addDoc, doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/client';
import { useAuth } from '@/contexts/AuthContext';
import ImageUrlPicker from '@/components/ImageUrlPicker';
import styles from './new.module.css';

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

export default function NewProductPage() {
  const { user } = useAuth();
  const router = useRouter();

  const [images, setImages] = useState<string[]>([]);
  const [title, setTitle] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [comparePrice, setComparePrice] = useState('');
  const [stock, setStock] = useState('1');
  const [sku, setSku] = useState('');
  const [tags, setTags] = useState('');
  const [brand, setBrand] = useState('');
  const [sizes, setSizes] = useState<string[]>([]);
  const [colors, setColors] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const toggleSize = (s: string) => setSizes(p => p.includes(s) ? p.filter(x => x !== s) : [...p, s]);
  const toggleColor = (c: string) => setColors(p => p.includes(c) ? p.filter(x => x !== c) : [...p, c]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) { setError('You must be logged in'); return; }
    if (images.length === 0) { setError('Add at least one photo'); return; }
    if (!categoryId) { setError('Select a category'); return; }
    setSaving(true); setError('');
    try {
      const ref = await addDoc(collection(db, 'products'), {
        title, brand, description, categoryId,
        price: Number(price),
        comparePrice: Number(comparePrice) || 0,
        stock: Number(stock),
        sku,
        tags: tags.split(',').map(t => t.trim()).filter(Boolean),
        images, sizes, colors,
        sellerId: user.uid,
        status: 'active',
        rating: 0, reviewCount: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      await updateDoc(doc(db, 'products', ref.id), { id: ref.id });
      router.push('/seller/products');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <Link href="/seller/products" className={styles.back}>← Back</Link>
        <h1 className={styles.title}>Add Product</h1>
      </div>

      <form onSubmit={handleSubmit} className={styles.form}>

        {/* Photos */}
        <div className={styles.card}>
          <h2 className={styles.cardTitle}>Photos</h2>
          <p className={styles.cardSub}>Up to 5 photos. First photo is the main one. Drag to reorder.</p>
          <ImageUrlPicker images={images} onChange={setImages} max={5} />
        </div>

        {/* Basic Info */}
        <div className={styles.card}>
          <h2 className={styles.cardTitle}>Basic Information</h2>
          <div className={styles.field}>
            <label>Title *</label>
            <input required value={title} onChange={e => setTitle(e.target.value)} placeholder="Product name" />
          </div>
          <div className={styles.field}>
            <label>Brand</label>
            <input value={brand} onChange={e => setBrand(e.target.value)} placeholder="BOSS, Nike, Adidas..." />
          </div>
          <div className={styles.field}>
            <label>Category *</label>
            <select value={categoryId} onChange={e => setCategoryId(e.target.value)}>
              <option value="">Select category</option>
              {CATS.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
            </select>
          </div>
          <div className={styles.field}>
            <label>Description *</label>
            <textarea required rows={5} value={description} onChange={e => setDescription(e.target.value)} placeholder="Detailed product description" />
          </div>
        </div>

        {/* Sizes */}
        <div className={styles.card}>
          <h2 className={styles.cardTitle}>Sizes</h2>
          <div className={styles.tagGrid}>
            {SIZES.map(s => (
              <button key={s} type="button" className={`${styles.tag} ${sizes.includes(s) ? styles.tagActive : ''}`} onClick={() => toggleSize(s)}>{s}</button>
            ))}
          </div>
        </div>

        {/* Colors */}
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

        {/* Price & Stock */}
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
              <input required type="number" min="0" value={stock} onChange={e => setStock(e.target.value)} placeholder="1" />
            </div>
            <div className={styles.field}>
              <label>SKU</label>
              <input value={sku} onChange={e => setSku(e.target.value)} placeholder="PROD-001" />
            </div>
          </div>
          <div className={styles.field}>
            <label>Tags (comma-separated)</label>
            <input value={tags} onChange={e => setTags(e.target.value)} placeholder="clothing, gucci, luxury" />
          </div>
        </div>

        {error && <div className={styles.error}>{error}</div>}

        <button type="submit" className={styles.submitBtn} disabled={saving}>
          {saving ? 'Publishing...' : 'Publish Product'}
        </button>
      </form>
    </div>
  );
}

