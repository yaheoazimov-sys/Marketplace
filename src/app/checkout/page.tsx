'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import Navbar from '@/components/Navbar';
import styles from './checkout.module.css';

export default function CheckoutPage() {
  return <ProtectedRoute allowedRoles={['client', 'admin']}><CheckoutContent /></ProtectedRoute>;
}

function CheckoutContent() {
  const { items, total, clearCart } = useCart();
  const { user } = useAuth();
  const router = useRouter();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [zip, setZip] = useState('');
  const [country, setCountry] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [orderId, setOrderId] = useState('');

  const subtotal = total;
  const tax = +(subtotal * 0.08).toFixed(2);
  const grandTotal = subtotal + tax;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || items.length === 0) return;
    setLoading(true); setError('');
    try {
      const token = await user.getIdToken();
      const shippingAddress = `${firstName} ${lastName}\n${address}\n${city}, ${zip}\n${country}\n${phone}`;
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          items: items.map(i => ({ id: i.id, title: i.title, price: i.price, quantity: i.quantity, image: i.image, sellerId: i.sellerId })),
          shippingAddress,
          paymentMethod: 'card',
        }),
      });
      if (!res.ok) { const d = await res.json(); throw new Error(d.error); }
      const d = await res.json();
      clearCart();
      setOrderId(d.orderId);
    } catch (err: any) { setError(err.message || 'Checkout failed. Please try again.'); }
    finally { setLoading(false); }
  };

  if (orderId) {
    return (
      <>
        <Navbar />
        <div className={styles.successPage}>
          <div className={styles.successCard}>
            <div className={styles.successIcon}>✓</div>
            <h1 className={styles.successTitle}>Order Confirmed!</h1>
            <p className={styles.successSub}>Your order has been placed successfully.</p>
            <p className={styles.successId}>Order ID: <strong>#{orderId.slice(0, 8).toUpperCase()}</strong></p>
            <div className={styles.successActions}>
              <Link href={`/orders/${orderId}`} className={styles.btnPrimary}>View Order</Link>
              <Link href="/" className={styles.btnOutline}>Continue Shopping</Link>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className={styles.page}>
        <div className={styles.container}>
          <div className={styles.breadcrumb}>
            <Link href="/">Shop</Link><span>/</span>
            <Link href="/checkout">Checkout</Link>
          </div>
          <h1 className={styles.title}>Checkout</h1>

          {items.length === 0 ? (
            <div className={styles.emptyCart}>
              <p>Your cart is empty.</p>
              <Link href="/" className={styles.btnPrimary}>Browse Products</Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className={styles.grid}>
              {/* Left: Form */}
              <div className={styles.formCol}>

                <div className={styles.section}>
                  <h2 className={styles.sectionTitle}>Contact Information</h2>
                  <div className={styles.row2}>
                    <div className={styles.field}>
                      <label>First Name *</label>
                      <input required value={firstName} onChange={e => setFirstName(e.target.value)} placeholder="John" />
                    </div>
                    <div className={styles.field}>
                      <label>Last Name *</label>
                      <input required value={lastName} onChange={e => setLastName(e.target.value)} placeholder="Doe" />
                    </div>
                  </div>
                  <div className={styles.row2}>
                    <div className={styles.field}>
                      <label>Email *</label>
                      <input required type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" />
                    </div>
                    <div className={styles.field}>
                      <label>Phone</label>
                      <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="+1 234 567 8900" />
                    </div>
                  </div>
                </div>

                <div className={styles.section}>
                  <h2 className={styles.sectionTitle}>Shipping Address</h2>
                  <div className={styles.field}>
                    <label>Street Address *</label>
                    <input required value={address} onChange={e => setAddress(e.target.value)} placeholder="123 Main Street, Apt 4B" />
                  </div>
                  <div className={styles.row3}>
                    <div className={styles.field}>
                      <label>City *</label>
                      <input required value={city} onChange={e => setCity(e.target.value)} placeholder="New York" />
                    </div>
                    <div className={styles.field}>
                      <label>ZIP Code *</label>
                      <input required value={zip} onChange={e => setZip(e.target.value)} placeholder="10001" />
                    </div>
                    <div className={styles.field}>
                      <label>Country *</label>
                      <input required value={country} onChange={e => setCountry(e.target.value)} placeholder="United States" />
                    </div>
                  </div>
                </div>

                <div className={styles.section}>
                  <h2 className={styles.sectionTitle}>Payment</h2>
                  <div className={styles.paymentBox}>
                    <div className={styles.paymentRow}>
                      <input type="radio" id="card" name="payment" defaultChecked readOnly />
                      <label htmlFor="card">💳 Credit / Debit Card (Test Mode)</label>
                    </div>
                    <div className={styles.cardFields}>
                      <div className={styles.field}>
                        <label>Card Number</label>
                        <input placeholder="4242 4242 4242 4242" disabled defaultValue="4242 4242 4242 4242" />
                      </div>
                      <div className={styles.row2}>
                        <div className={styles.field}><label>Expiry</label><input placeholder="MM/YY" disabled defaultValue="12/28" /></div>
                        <div className={styles.field}><label>CVV</label><input placeholder="123" disabled defaultValue="123" /></div>
                      </div>
                    </div>
                  </div>
                </div>

                {error && <div className={styles.errorMsg}>{error}</div>}

                <button type="submit" className={styles.submitBtn} disabled={loading}>
                  {loading ? 'Processing...' : `Place Order · $${grandTotal.toFixed(2)}`}
                </button>
              </div>

              {/* Right: Summary */}
              <div className={styles.summaryCol}>
                <div className={styles.summaryCard}>
                  <h2 className={styles.sectionTitle}>Order Summary</h2>
                  <div className={styles.summaryItems}>
                    {items.map(item => (
                      <div key={item.id} className={styles.summaryItem}>
                        <div className={styles.summaryImg}>
                          {item.image ? <img src={item.image} alt={item.title} /> : <span>📦</span>}
                          <span className={styles.summaryQty}>{item.quantity}</span>
                        </div>
                        <div className={styles.summaryInfo}>
                          <p className={styles.summaryName}>{item.title}</p>
                        </div>
                        <p className={styles.summaryPrice}>${(item.price * item.quantity).toFixed(2)}</p>
                      </div>
                    ))}
                  </div>
                  <div className={styles.summaryTotals}>
                    <div className={styles.totalRow}><span>Subtotal</span><span>${subtotal.toFixed(2)}</span></div>
                    <div className={styles.totalRow}><span>Shipping</span><span className={styles.free}>Free</span></div>
                    <div className={styles.totalRow}><span>Tax (8%)</span><span>${tax.toFixed(2)}</span></div>
                    <div className={styles.totalRowBold}><span>Total</span><span>${grandTotal.toFixed(2)}</span></div>
                  </div>
                </div>
              </div>
            </form>
          )}
        </div>
      </div>
    </>
  );
}
