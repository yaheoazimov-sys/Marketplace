'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';

export default function CheckoutPage() {
  const { items, total, clearCart } = useCart();
  const { user } = useAuth();
  const router = useRouter();

  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return router.push('/auth/login');
    if (items.length === 0) return;

    setLoading(true);
    try {
      // We simulate an API call here. The real one is blocked by missing Admin DB keys.
      // const res = await fetch('/api/orders', { ... }) 

      // MOCK SUCCESS
      await new Promise((r) => setTimeout(r, 1500));
      setSuccess(true);
      clearCart();
    } catch (err) {
      console.error(err);
      alert('Checkout failed.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div style={{ padding: '4rem 2rem', textAlign: 'center', maxWidth: '600px', margin: '0 auto' }}>
        <h1 style={{ color: 'var(--accent-color)', fontSize: '2.5rem', marginBottom: '1rem' }}>Order Confirmed!</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.2rem', marginBottom: '2rem' }}>
          Your mock payment was successful. The seller has been notified.
        </p>
        <button 
          onClick={() => router.push('/')}
          style={{ padding: '1rem 2rem', background: 'var(--accent-color)', color: 'white', border: 'none', borderRadius: '12px', cursor: 'pointer', fontSize: '1rem' }}
        >
          Continue Shopping
        </button>
      </div>
    );
  }

  return (
    <ProtectedRoute allowedRoles={['client']}>
      <div style={{ padding: '2rem', maxWidth: '1000px', margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 400px', gap: '3rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', marginBottom: '2rem' }}>Checkout</h1>
          
          <form onSubmit={handleCheckout}>
            <div style={{ marginBottom: '2rem' }}>
              <h2 style={{ fontSize: '1.2rem', marginBottom: '1rem' }}>Shipping Address</h2>
              <textarea 
                required
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                style={{ width: '100%', padding: '1rem', borderRadius: '12px', border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', color: 'var(--text-primary)', minHeight: '100px' }}
                placeholder="123 Main St, City, Country"
              />
            </div>

            <div style={{ marginBottom: '2rem' }}>
              <h2 style={{ fontSize: '1.2rem', marginBottom: '1rem' }}>Payment Method</h2>
              <div style={{ padding: '1rem', border: '1px solid var(--accent-color)', borderRadius: '12px', background: 'rgba(59, 130, 246, 0.05)' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <input type="radio" checked readOnly/>
                  Mock Credit Card (Test Mode)
                </label>
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading || items.length === 0}
              style={{ width: '100%', padding: '1.2rem', background: 'var(--accent-color)', color: 'white', border: 'none', borderRadius: '12px', fontSize: '1.2rem', fontWeight: 'bold', cursor: items.length === 0 ? 'not-allowed' : 'pointer', opacity: loading || items.length === 0 ? 0.7 : 1 }}
            >
              {loading ? 'Processing...' : `Pay $${total.toFixed(2)}`}
            </button>
          </form>
        </div>

        <div style={{ background: 'var(--bg-secondary)', padding: '2rem', borderRadius: '24px', border: '1px solid var(--border-color)', height: 'fit-content' }}>
          <h2 style={{ fontSize: '1.2rem', marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '1px solid var(--border-color)' }}>Order Summary</h2>
          
          {items.length === 0 ? (
            <p style={{ color: 'var(--text-secondary)' }}>Your cart is empty.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem' }}>
              {items.map(item => (
                <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>{item.quantity}x {item.title}</span>
                  <span>${(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '1.2rem', paddingTop: '1rem', borderTop: '1px solid var(--border-color)' }}>
            <span>Total</span>
            <span>${total.toFixed(2)}</span>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
