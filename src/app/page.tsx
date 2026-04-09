'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';

export default function Home() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch('/api/products');
        if (!res.ok) throw new Error('API failed');
        const data = await res.json();
        if (data.products && data.products.length > 0) {
          setProducts(data.products);
        } else {
          throw new Error('Empty');
        }
      } catch (err) {
        // Fallback Mock Data for UI presentation
        setProducts([
          { id: '1', title: 'Premium Wireless Headphones', price: 299.99, image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80' },
          { id: '2', title: 'Ergonomic Desk Chair', price: 199.50, image: 'https://images.unsplash.com/photo-1592078615290-033ee584e267?w=800&q=80' },
          { id: '3', title: 'Mechanical Keyboard Pro', price: 149.00, image: 'https://images.unsplash.com/photo-1595225476474-87563907a212?w=800&q=80' },
          { id: '4', title: 'Minimalist Wrist Watch', price: 120.00, image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80' },
          { id: '5', title: 'Smart Home Speaker', price: 89.99, image: 'https://images.unsplash.com/photo-1589003077984-894e133dabab?w=800&q=80' },
          { id: '6', title: '4K Ultra Monitor', price: 450.00, image: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=800&q=80' },
        ]);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  return (
    <main style={{ minHeight: '100vh', padding: '2rem', maxWidth: '1400px', margin: '0 auto' }}>
      
      {/* Header / Navbar Simulation */}
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem', paddingBottom: '1.5rem', borderBottom: '1px solid var(--border-color)' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: '800', letterSpacing: '-0.5px' }}>BigShop<span style={{ color: 'var(--accent-color)' }}>AI</span></h1>
        
        <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
          <input 
            type="text" 
            placeholder="Search products..." 
            style={{ 
              padding: '0.6rem 1rem', 
              borderRadius: '20px', 
              border: '1px solid var(--border-color)', 
              background: 'var(--bg-tertiary)',
              color: 'var(--text-primary)',
              outline: 'none',
              width: '250px'
            }} 
          />
          <Link href="/auth/login" style={{ fontWeight: '500' }}>Log In</Link>
          <Link href="/auth/signup" style={{ 
            padding: '0.6rem 1.2rem', 
            background: 'var(--text-primary)', 
            color: 'var(--bg-primary)', 
            borderRadius: '20px', 
            fontWeight: '600' 
          }}>Sign Up</Link>
        </div>
      </header>

      {/* Hero Section */}
      <section style={{ 
        padding: '4rem 2rem', 
        borderRadius: '24px', 
        background: 'linear-gradient(135deg, var(--accent-hover), var(--accent-color))',
        color: 'white',
        marginBottom: '3rem',
        textAlign: 'center',
        boxShadow: 'var(--shadow-lg)'
      }}>
        <h2 style={{ fontSize: '3rem', fontWeight: '800', marginBottom: '1rem' }}>Future of E-Commerce</h2>
        <p style={{ fontSize: '1.2rem', opacity: '0.9', maxWidth: '600px', margin: '0 auto' }}>
          Discover curated premium products from top sellers globally, integrated with AI recommendations and seamless checkout.
        </p>
      </section>

      {/* Catalog Grid */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h3 style={{ fontSize: '1.5rem', fontWeight: '700' }}>Trending Now</h3>
        <select style={{ 
          padding: '0.5rem', 
          borderRadius: '8px', 
          border: '1px solid var(--border-color)', 
          background: 'var(--bg-secondary)',
          color: 'var(--text-primary)'
        }}>
          <option>Sort by: Featured</option>
          <option>Price: Low to High</option>
          <option>Price: High to Low</option>
        </select>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem' }}>Loading catalog...</div>
      ) : (
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', 
          gap: '2rem' 
        }}>
          {products.map((p) => (
            <Link href={`/products/${p.id}`} key={p.id}>
              <div style={{ 
                background: 'var(--bg-secondary)', 
                borderRadius: '16px', 
                overflow: 'hidden',
                border: '1px solid var(--glass-border)',
                transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                height: '100%'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-5px)';
                e.currentTarget.style.boxShadow = 'var(--shadow-lg)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
              }}
              >
                <div style={{ height: '220px', overflow: 'hidden' }}>
                  <img src={p.image || p.images?.[0]} alt={p.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
                <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
                  <h4 style={{ fontWeight: '600', fontSize: '1.1rem', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>{p.title}</h4>
                  <p style={{ fontWeight: '700', color: 'var(--accent-color)', fontSize: '1.2rem', marginTop: 'auto' }}>${Number(p.price).toFixed(2)}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

    </main>
  );
}
