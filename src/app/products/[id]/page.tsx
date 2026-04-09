'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';

export default function ProductDetail() {
  const { id } = useParams();
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // We would normally fetch from /api/products/[id]
    // But since we want to handle missing firebase keys gracefully, we mock it.
    const fetchProduct = async () => {
      try {
        const res = await fetch(`/api/products/${id}`);
        if (!res.ok) throw new Error('API failed (likely missing DB config)');
        const data = await res.json();
        setProduct(data.product);
      } catch (err) {
        console.warn(err);
        // Fallback Mock Data for UI demonstration
        setProduct({
          id,
          title: 'Premium Wireless Headphones',
          description: 'Experience pure sound with extreme clarity and deep bass in a sleek finish.',
          price: 299.99,
          stock: 10,
          images: ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80']
        });
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  if (loading) return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading product details...</div>;

  if (!product) return <div style={{ padding: '2rem' }}>Product not found.</div>;

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem' }}>
      <Link href="/" style={{ color: 'var(--accent-color)', marginBottom: '1rem', display: 'inline-block' }}>&larr; Back to Catalog</Link>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3rem', marginTop: '2rem' }}>
        <div style={{ 
          borderRadius: '24px', 
          overflow: 'hidden', 
          boxShadow: 'var(--shadow-lg)',
          backgroundColor: 'var(--bg-secondary)',
          aspectRatio: '1',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          {/* Fallback image if images[0] breaks */}
          <img 
            src={product.images && product.images[0] ? product.images[0] : 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80'} 
            alt={product.title} 
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <h1 style={{ fontSize: '2.5rem', fontWeight: '800', marginBottom: '1rem' }}>{product.title}</h1>
          <p style={{ fontSize: '1.5rem', color: 'var(--accent-color)', fontWeight: '600', marginBottom: '1.5rem' }}>
            ${Number(product.price).toFixed(2)}
          </p>
          <p style={{ color: 'var(--text-secondary)', lineHeight: '1.7', marginBottom: '2rem' }}>
            {product.description}
          </p>
          
          <div style={{ marginBottom: '2rem', color: product.stock > 0 ? 'inherit' : '#ef4444' }}>
            {product.stock > 0 ? `In Stock: ${product.stock} units` : 'Out of Stock'}
          </div>
          
          <button style={{
            padding: '1rem 2rem',
            backgroundColor: 'var(--accent-color)',
            color: 'white',
            border: 'none',
            borderRadius: '12px',
            fontSize: '1.1rem',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'transform 0.15s ease, background 0.15s ease'
          }}>
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
}
