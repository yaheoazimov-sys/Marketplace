'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/client';
import { useAuth } from '@/contexts/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import Navbar from '@/components/Navbar';
import styles from './new.module.css';

const CATS = ['electronics','clothing','fashion','food','handmade','home','sports','cars'];
const SIZES = ['XS','S','M','L','XL','XXL','XXXL','28','30','32','34','36','38','40','42','One Size'];
const COLORS = ['Black','White','Navy','Grey','Beige','Brown','Red','Blue','Green','Yellow','Pink','Purple','Orange','Khaki','Camel'];

export default function NewProductPage() {
  return <ProtectedRoute allowedRoles={['seller','admin']}><Form /></ProtectedRoute>;
}

function Form() {
  const { user } = useAuth();
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [brand, setBrand] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('clothing');
  const [status, setStatus] = useState('active');
  const [sku, setSku] = useState('');
  const [price, setPrice] = useState('');
  const [comparePrice, setComparePrice] = useState('');
  const [stock, setStock] = useState('');
  const [imgInput, setImgInput] = useState('');
  const [sizes, setSizes] = useState<string[]>([]);
  const [colors, setColors] = useState<string[]>([]);
  const [attrKey, setAttrKey] = useState('');
  const [attrVal, setAttrVal] = useState('');
  const [attributes, setAttributes] = useState<Record<string,string>>({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const toggleSize = (s: string) => setSizes(p => p.includes(s) ? p.filter(x=>x!==s) : [...p,s]);
  const toggleColor = (c: string) => setColors(p => p.includes(c) ? p.filter(x=>x!==c) : [...p,c]);
  const addAttr = () => { if (!attrKey.trim()) return; setAttributes(a=>({...a,[attrKey.trim()]:attrVal.trim()})); setAttrKey(''); setAttrVal(''); };
  const removeAttr = (k: string) => setAttributes(a=>{const n={...a};delete n[k];return n;});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSaving(true); setError('');
    try {
      const images = imgInput.split(',').map(s=>s.trim()).filter(Boolean);
      const ref = await addDoc(collection(db, 'products'), {
        title, brand, description, categoryId, status, sku,
        price: Number(price),
        comparePrice: Number(comparePrice) || 0,
        stock: Number(stock),
        images, sizes, colors, attributes,
        sellerId: user.uid,
        rating: 0, reviewCount: 0,
        createdAt: new Date().toISOString(),
      });
      // patch id field
      const { doc, updateDoc } = await import('firebase/firestore');
      await updateDoc(doc(db, 'products', ref.id), { id: ref.id });
      router.push('/seller/dashboard');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const imgUrls = imgInput.split(',').map(s=>s.trim()).filter(Boolean);

  return (
    <>
      <Navbar />
      <div className={styles.page}>
        <div className={styles.container}>
          <div className={styles.breadcrumb}>
            <Link href="/seller/dashboard">← Dashboard</Link>
          </div>
          <h1 className={styles.title}>Add New Product</h1>

          {error && <div className={styles.error}>{error}</div>}

          <form onSubmit={handleSubmit} className={styles.grid}>
            <div className={styles.left}>

              <div className={styles.card}>
                <h2 className={styles.cardTitle}>Basic Info</h2>
                <div className={styles.field}>
                  <label>Title *</label>
                  <input required value={title} onChange={e=>setTitle(e.target.value)} placeholder="Product name" />
                </div>
                <div className={styles.row2}>
                  <div className={styles.field}>
                    <label>Brand</label>
                    <input value={brand} onChange={e=>setBrand(e.target.value)} placeholder="BOSS, Nike..." />
                  </div>
                  <div className={styles.field}>
                    <label>SKU</label>
                    <input value={sku} onChange={e=>setSku(e.target.value)} placeholder="SKU-001" />
                  </div>
                </div>
                <div className={styles.field}>
                  <label>Description</label>
                  <textarea rows={4} value={description} onChange={e=>setDescription(e.target.value)} placeholder="Product description..." />
                </div>
                <div className={styles.row2}>
                  <div className={styles.field}>
                    <label>Category *</label>
                    <select value={categoryId} onChange={e=>setCategoryId(e.target.value)}>
                      {CATS.map(c=><option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div className={styles.field}>
                    <label>Status</label>
                    <select value={status} onChange={e=>setStatus(e.target.value)}>
                      <option value="active">Active</option>
                      <option value="pending">Pending</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className={styles.card}>
                <h2 className={styles.cardTitle}>Pricing & Stock</h2>
                <div className={styles.row3}>
                  <div className={styles.field}>
                    <label>Price ($) *</label>
                    <input required type="number" min="0" step="0.01" value={price} onChange={e=>setPrice(e.target.value)} placeholder="0.00" />
                  </div>
                  <div className={styles.field}>
                    <label>Compare Price ($)</label>
                    <input type="number" min="0" step="0.01" value={comparePrice} onChange={e=>setComparePrice(e.target.value)} placeholder="Original" />
                  </div>
                  <div className={styles.field}>
                    <label>Stock *</label>
                    <input required type="number" min="0" value={stock} onChange={e=>setStock(e.target.value)} placeholder="0" />
                  </div>
                </div>
              </div>

              <div className={styles.card}>
                <h2 className={styles.cardTitle}>Images</h2>
                <div className={styles.field}>
                  <label>Image URLs (comma-separated)</label>
                  <textarea rows={2} value={imgInput} onChange={e=>setImgInput(e.target.value)} placeholder="https://example.com/img1.jpg, ..." />
                </div>
                {imgUrls.length > 0 && (
                  <div className={styles.imgPreview}>
                    {imgUrls.map((url,i)=>(
                      <img key={i} src={url} alt="" className={styles.imgThumb} onError={e=>(e.currentTarget.style.display='none')} />
                    ))}
                  </div>
                )}
              </div>

              <div className={styles.card}>
                <h2 className={styles.cardTitle}>Sizes</h2>
                <div className={styles.tagGrid}>
                  {SIZES.map(s=>(
                    <button key={s} type="button" className={`${styles.tag} ${sizes.includes(s)?styles.tagActive:''}`} onClick={()=>toggleSize(s)}>{s}</button>
                  ))}
                </div>
              </div>

              <div className={styles.card}>
                <h2 className={styles.cardTitle}>Colors</h2>
                <div className={styles.colorGrid}>
                  {COLORS.map(c=>(
                    <button key={c} type="button" className={`${styles.colorBtn} ${colors.includes(c)?styles.colorBtnActive:''}`} onClick={()=>toggleColor(c)}>
                      <span className={styles.swatch} style={{background: c==='White'?'#f0f0f0':c==='Beige'?'#f5f0e8':c==='Camel'?'#c19a6b':c==='Khaki'?'#8b8b6b':c.toLowerCase()}} />
                      {c}
                    </button>
                  ))}
                </div>
              </div>

              <div className={styles.card}>
                <h2 className={styles.cardTitle}>Custom Attributes</h2>
                <div className={styles.attrRow}>
                  <input className={styles.attrInput} value={attrKey} onChange={e=>setAttrKey(e.target.value)} placeholder="Key (Material)" onKeyDown={e=>e.key==='Enter'&&(e.preventDefault(),addAttr())} />
                  <input className={styles.attrInput} value={attrVal} onChange={e=>setAttrVal(e.target.value)} placeholder="Value (100% Cotton)" onKeyDown={e=>e.key==='Enter'&&(e.preventDefault(),addAttr())} />
                  <button type="button" className={styles.btnSecondary} onClick={addAttr}>Add</button>
                </div>
                {Object.keys(attributes).length > 0 && (
                  <div className={styles.attrList}>
                    {Object.entries(attributes).map(([k,v])=>(
                      <div key={k} className={styles.attrChip}>
                        <span><b>{k}:</b> {v}</span>
                        <button type="button" onClick={()=>removeAttr(k)}>✕</button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className={styles.right}>
              <div className={styles.card}>
                <h2 className={styles.cardTitle}>Preview</h2>
                {imgUrls[0] && <img src={imgUrls[0]} alt="" className={styles.previewImg} onError={e=>(e.currentTarget.style.display='none')} />}
                <p className={styles.previewTitle}>{title || 'Product name'}</p>
                {brand && <p className={styles.previewBrand}>{brand}</p>}
                <p className={styles.previewPrice}>{price ? `$${price}` : '$0.00'}</p>
                {comparePrice && Number(comparePrice) > Number(price) && (
                  <p className={styles.previewCompare}>${comparePrice}</p>
                )}
                <div className={styles.previewMeta}>
                  <span>{categoryId}</span>
                  <span className={`${styles.previewStatus} ${status==='active'?styles.statusActive:styles.statusPending}`}>{status}</span>
                </div>
                {sizes.length > 0 && <p className={styles.previewSizes}>{sizes.join(' · ')}</p>}
                {colors.length > 0 && (
                  <div className={styles.previewColors}>
                    {colors.map(c=>(
                      <span key={c} className={styles.colorDot} title={c} style={{background:c==='White'?'#f0f0f0':c==='Beige'?'#f5f0e8':c==='Camel'?'#c19a6b':c==='Khaki'?'#8b8b6b':c.toLowerCase()}} />
                    ))}
                  </div>
                )}
              </div>

              <div className={styles.actions}>
                <button type="submit" className={styles.btnPrimary} disabled={saving}>
                  {saving ? 'Creating...' : 'Create Product'}
                </button>
                <Link href="/seller/dashboard" className={styles.btnOutline}>Cancel</Link>
              </div>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
