'use client';

import React, { useState } from 'react';
import { collection, addDoc, doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/client';
import { useAuth } from '@/contexts/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import Navbar from '@/components/Navbar';
import ImageUrlPicker from '@/components/ImageUrlPicker';
import Link from 'next/link';
import styles from './add.module.css';

const CATS = [
  'electronics','clothing','fashion','food','handmade','home','sports','cars'
];

export default function AdminAddProduct() {
  return <ProtectedRoute allowedRoles={['admin','seller']}><Form /></ProtectedRoute>;
}

function Form() {
  const { user } = useAuth();
  const [images, setImages] = useState<string[]>([]);
  const [title, setTitle] = useState('');
  const [brand, setBrand] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('electronics');
  const [price, setPrice] = useState('');
  const [comparePrice, setComparePrice] = useState('');
  const [stock, setStock] = useState('');
  const [sku, setSku] = useState('');
  const [tags, setTags] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState<string[]>([]);
  const [error, setError] = useState('');

  const reset = () => {
    setImages([]); setTitle(''); setBrand(''); setDescription('');
    setPrice(''); setComparePrice(''); setStock(''); setSku(''); setTags('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (!title || !price || !stock) { setError('Title, price and stock are required'); return; }
    setSaving(true); setError('');
    try {
      const ref = await addDoc(collection(db, 'products'), {
        title, brand, description, categoryId,
        price: Number(price),
        comparePrice: Number(comparePrice) || 0,
        stock: Number(stock),
        sku, images,
        tags: tags.split(',').map(t => t.trim()).filter(Boolean),
        sellerId: user.uid,
        status: 'active',
        rating: 0, reviewCount: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      await updateDoc(doc(db, 'products', ref.id), { id: ref.id });
      setSaved(prev => [title, ...prev]);
      reset();
    } catch (err: any) { setError(err.message); }
    finally { setSaving(false); }
  };

  return (
    <>
      <Navbar />
      <div className={styles.page}>
        <div className={styles.container}>
          <div className={styles.header}>
            <div>
              <h1 className={styles.title}>Add Product</h1>
              <p className={styles.sub}>Add products directly to Firestore</p>
            </div>
            <Link href="/" className={styles.viewBtn}>View Store →</Link>
          </div>

          {saved.length > 0 && (
            <div className={styles.savedList}>
              <p className={styles.savedTitle}>✓ Added {saved.length} product{saved.length > 1 ? 's' : ''}:</p>
              {saved.map((t, i) => <span key={i} className={styles.savedItem}>{t}</span>)}
            </div>
          )}

          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.card}>
              <h2 className={styles.cardTitle}>Photos</h2>
              <ImageUrlPicker images={images} onChange={setImages} max={5} />
            </div>

            <div className={styles.card}>
              <h2 className={styles.cardTitle}>Basic Info</h2>
              <div className={styles.row2}>
                <div className={styles.field}>
                  <label>Title *</label>
                  <input required value={title} onChange={e => setTitle(e.target.value)} placeholder="Product name" />
                </div>
                <div className={styles.field}>
                  <label>Brand</label>
                  <input value={brand} onChange={e => setBrand(e.target.value)} placeholder="BOSS, Apple, Nike..." />
                </div>
              </div>
              <div className={styles.row2}>
                <div className={styles.field}>
                  <label>Category *</label>
                  <select value={categoryId} onChange={e => setCategoryId(e.target.value)}>
                    {CATS.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className={styles.field}>
                  <label>SKU</label>
                  <input value={sku} onChange={e => setSku(e.target.value)} placeholder="PROD-001" />
                </div>
              </div>
              <div className={styles.field}>
                <label>Description</label>
                <textarea rows={3} value={description} onChange={e => setDescription(e.target.value)} placeholder="Product description..." />
              </div>
              <div className={styles.field}>
                <label>Tags (comma-separated)</label>
                <input value={tags} onChange={e => setTags(e.target.value)} placeholder="electronics, laptop, gaming" />
              </div>
            </div>

            <div className={styles.card}>
              <h2 className={styles.cardTitle}>Price & Stock</h2>
              <div className={styles.row3}>
                <div className={styles.field}>
                  <label>Price ($) *</label>
                  <input required type="number" min="0" step="0.01" value={price} onChange={e => setPrice(e.target.value)} placeholder="0.00" />
                </div>
                <div className={styles.field}>
                  <label>Old Price ($)</label>
                  <input type="number" min="0" step="0.01" value={comparePrice} onChange={e => setComparePrice(e.target.value)} placeholder="0.00" />
                </div>
                <div className={styles.field}>
                  <label>Stock *</label>
                  <input required type="number" min="0" value={stock} onChange={e => setStock(e.target.value)} placeholder="0" />
                </div>
              </div>
            </div>

            {error && <div className={styles.error}>{error}</div>}

            <div className={styles.actions}>
              <button type="button" className={styles.resetBtn} onClick={reset}>Reset</button>
              <button type="submit" className={styles.submitBtn} disabled={saving}>
                {saving ? 'Saving...' : '+ Add Product'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
