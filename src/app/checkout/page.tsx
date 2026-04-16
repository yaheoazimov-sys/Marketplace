'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { placeOrder, getAddresses, saveAddress } from '@/lib/firebase/firestore';
import ProtectedRoute from '@/components/ProtectedRoute';
import Navbar from '@/components/Navbar';
import styles from './checkout.module.css';

type Step = 'address' | 'payment' | 'confirm';

interface Address {
  id?: string;
  firstName: string; lastName: string;
  phone: string; street: string;
  city: string; zip: string; country: string;
}

const EMPTY_ADDR: Address = { firstName: '', lastName: '', phone: '', street: '', city: '', zip: '', country: '' };

const FAKE_CARDS = [
  { number: '4242 4242 4242 4242', brand: 'Visa', expiry: '12/28', cvv: '123' },
  { number: '5555 5555 5555 4444', brand: 'Mastercard', expiry: '11/27', cvv: '456' },
];

export default function CheckoutPage() {
  return <ProtectedRoute allowedRoles={['client', 'admin', 'seller']}><CheckoutFlow /></ProtectedRoute>;
}

function CheckoutFlow() {
  const { items, total, clearCart } = useCart();
  const { user } = useAuth();
  const router = useRouter();

  const [step, setStep] = useState<Step>('address');
  const [savedAddresses, setSavedAddresses] = useState<Address[]>([]);
  const [selectedAddr, setSelectedAddr] = useState<Address | null>(null);
  const [newAddr, setNewAddr] = useState<Address>(EMPTY_ADDR);
  const [saveAddr, setSaveAddr] = useState(true);
  const [showNewForm, setShowNewForm] = useState(false);
  const [selectedCard, setSelectedCard] = useState(0);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');
  const [orderId, setOrderId] = useState('');

  const subtotal = total;
  const shipping = 0;
  const tax = +(subtotal * 0.08).toFixed(2);
  const grandTotal = subtotal + shipping + tax;

  useEffect(() => {
    if (!user) return;
    getAddresses(user.uid).then(addrs => {
      setSavedAddresses(addrs as Address[]);
      if (addrs.length > 0) setSelectedAddr(addrs[0] as Address);
      else setShowNewForm(true);
    });
  }, [user]);

  const handleSaveNewAddr = async () => {
    if (!newAddr.firstName || !newAddr.street || !newAddr.city || !newAddr.country) {
      setError('Please fill all required address fields'); return;
    }
    setError('');
    if (saveAddr && user) {
      const id = await saveAddress(user.uid, newAddr);
      const saved = { ...newAddr, id };
      setSavedAddresses(prev => [...prev, saved]);
      setSelectedAddr(saved);
    } else {
      setSelectedAddr(newAddr);
    }
    setShowNewForm(false);
    setStep('payment');
  };

  const handlePlaceOrder = async () => {
    if (!user || !selectedAddr) return;
    setProcessing(true); setError('');
    try {
      const addr = selectedAddr;
      const shippingAddress = `${addr.firstName} ${addr.lastName}\n${addr.street}\n${addr.city}, ${addr.zip}\n${addr.country}\n${addr.phone}`;
      const card = FAKE_CARDS[selectedCard];

      const id = await placeOrder({
        clientId: user.uid,
        items: items.map(i => ({ id: i.id, title: i.title, price: i.price, quantity: i.quantity, image: i.image || '', sellerId: i.sellerId })),
        shippingAddress,
        paymentMethod: `${card.brand} ****${card.number.slice(-4)}`,
        totalAmount: grandTotal,
      });

      clearCart();
      setOrderId(id);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setProcessing(false);
    }
  };

  // ── Success ──
  if (orderId) {
    return (
      <>
        <Navbar />
        <div className={styles.successPage}>
          <div className={styles.successCard}>
            <div className={styles.successCheck}>✓</div>
            <h1 className={styles.successTitle}>Order Confirmed!</h1>
            <p className={styles.successSub}>Your order has been placed and the seller has been notified.</p>
            <div className={styles.successOrderId}>
              Order <strong>#{orderId.slice(0, 8).toUpperCase()}</strong>
            </div>
            <div className={styles.successActions}>
              <Link href={`/orders/${orderId}`} className={styles.btnPrimary}>Track Order</Link>
              <Link href="/" className={styles.btnOutline}>Continue Shopping</Link>
            </div>
          </div>
        </div>
      </>
    );
  }

  // ── Empty cart ──
  if (items.length === 0) {
    return (
      <>
        <Navbar />
        <div className={styles.emptyPage}>
          <span>🛒</span>
          <p>Your cart is empty</p>
          <Link href="/" className={styles.btnPrimary}>Browse Products</Link>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className={styles.page}>
        <div className={styles.container}>

          {/* Steps indicator */}
          <div className={styles.steps}>
            {(['address', 'payment', 'confirm'] as Step[]).map((s, i) => (
              <React.Fragment key={s}>
                <div className={`${styles.stepItem} ${step === s ? styles.stepActive : ''} ${['payment','confirm'].includes(step) && s === 'address' ? styles.stepDone : ''} ${step === 'confirm' && s === 'payment' ? styles.stepDone : ''}`}>
                  <div className={styles.stepNum}>{['payment','confirm'].includes(step) && s === 'address' ? '✓' : step === 'confirm' && s === 'payment' ? '✓' : i + 1}</div>
                  <span className={styles.stepLabel}>{s === 'address' ? 'Address' : s === 'payment' ? 'Payment' : 'Confirm'}</span>
                </div>
                {i < 2 && <div className={`${styles.stepLine} ${(step === 'payment' && i === 0) || step === 'confirm' ? styles.stepLineDone : ''}`} />}
              </React.Fragment>
            ))}
          </div>

          <div className={styles.grid}>
            <div className={styles.formCol}>

              {/* ── STEP 1: Address ── */}
              {step === 'address' && (
                <div className={styles.card}>
                  <h2 className={styles.cardTitle}>Delivery Address</h2>

                  {savedAddresses.length > 0 && !showNewForm && (
                    <div className={styles.addrList}>
                      {savedAddresses.map((addr, i) => (
                        <label key={addr.id || i} className={`${styles.addrOption} ${selectedAddr === addr ? styles.addrOptionSelected : ''}`}>
                          <input type="radio" name="addr" checked={selectedAddr === addr} onChange={() => setSelectedAddr(addr)} />
                          <div className={styles.addrInfo}>
                            <p className={styles.addrName}>{addr.firstName} {addr.lastName}</p>
                            <p className={styles.addrText}>{addr.street}, {addr.city}, {addr.zip}, {addr.country}</p>
                            {addr.phone && <p className={styles.addrText}>{addr.phone}</p>}
                          </div>
                        </label>
                      ))}
                      <button type="button" className={styles.addAddrBtn} onClick={() => { setNewAddr(EMPTY_ADDR); setShowNewForm(true); }}>
                        + Add new address
                      </button>
                    </div>
                  )}

                  {showNewForm && (
                    <div className={styles.addrForm}>
                      <div className={styles.row2}>
                        <div className={styles.field}><label>First Name *</label><input value={newAddr.firstName} onChange={e => setNewAddr(a => ({ ...a, firstName: e.target.value }))} placeholder="John" /></div>
                        <div className={styles.field}><label>Last Name *</label><input value={newAddr.lastName} onChange={e => setNewAddr(a => ({ ...a, lastName: e.target.value }))} placeholder="Doe" /></div>
                      </div>
                      <div className={styles.field}><label>Phone</label><input value={newAddr.phone} onChange={e => setNewAddr(a => ({ ...a, phone: e.target.value }))} placeholder="+1 234 567 8900" /></div>
                      <div className={styles.field}><label>Street Address *</label><input value={newAddr.street} onChange={e => setNewAddr(a => ({ ...a, street: e.target.value }))} placeholder="123 Main St, Apt 4B" /></div>
                      <div className={styles.row3}>
                        <div className={styles.field}><label>City *</label><input value={newAddr.city} onChange={e => setNewAddr(a => ({ ...a, city: e.target.value }))} placeholder="New York" /></div>
                        <div className={styles.field}><label>ZIP</label><input value={newAddr.zip} onChange={e => setNewAddr(a => ({ ...a, zip: e.target.value }))} placeholder="10001" /></div>
                        <div className={styles.field}><label>Country *</label><input value={newAddr.country} onChange={e => setNewAddr(a => ({ ...a, country: e.target.value }))} placeholder="United States" /></div>
                      </div>
                      <label className={styles.saveCheck}>
                        <input type="checkbox" checked={saveAddr} onChange={e => setSaveAddr(e.target.checked)} />
                        Save this address for future orders
                      </label>
                      {savedAddresses.length > 0 && (
                        <button type="button" className={styles.cancelAddrBtn} onClick={() => setShowNewForm(false)}>Cancel</button>
                      )}
                    </div>
                  )}

                  {error && <p className={styles.error}>{error}</p>}

                  <button
                    className={styles.nextBtn}
                    onClick={showNewForm ? handleSaveNewAddr : () => { if (selectedAddr) setStep('payment'); }}
                    disabled={!showNewForm && !selectedAddr}
                  >
                    Continue to Payment →
                  </button>
                </div>
              )}

              {/* ── STEP 2: Payment ── */}
              {step === 'payment' && (
                <div className={styles.card}>
                  <h2 className={styles.cardTitle}>Payment Method</h2>
                  <p className={styles.testModeBanner}>🧪 Test Mode — use the cards below</p>

                  <div className={styles.cardList}>
                    {FAKE_CARDS.map((card, i) => (
                      <label key={i} className={`${styles.cardOption} ${selectedCard === i ? styles.cardOptionSelected : ''}`}>
                        <input type="radio" name="card" checked={selectedCard === i} onChange={() => setSelectedCard(i)} />
                        <div className={styles.cardVisual}>
                          <div className={styles.cardBrand}>{card.brand}</div>
                          <div className={styles.cardNumber}>{card.number}</div>
                          <div className={styles.cardMeta}>
                            <span>Expires {card.expiry}</span>
                            <span>CVV {card.cvv}</span>
                          </div>
                        </div>
                      </label>
                    ))}
                  </div>

                  <div className={styles.btnRow}>
                    <button className={styles.backBtn} onClick={() => setStep('address')}>← Back</button>
                    <button className={styles.nextBtn} onClick={() => setStep('confirm')}>Review Order →</button>
                  </div>
                </div>
              )}

              {/* ── STEP 3: Confirm ── */}
              {step === 'confirm' && (
                <div className={styles.card}>
                  <h2 className={styles.cardTitle}>Review & Confirm</h2>

                  <div className={styles.reviewSection}>
                    <div className={styles.reviewHeader}>
                      <span className={styles.reviewLabel}>Delivery to</span>
                      <button className={styles.editBtn} onClick={() => setStep('address')}>Edit</button>
                    </div>
                    {selectedAddr && (
                      <p className={styles.reviewValue}>
                        {selectedAddr.firstName} {selectedAddr.lastName} · {selectedAddr.street}, {selectedAddr.city}, {selectedAddr.country}
                      </p>
                    )}
                  </div>

                  <div className={styles.reviewSection}>
                    <div className={styles.reviewHeader}>
                      <span className={styles.reviewLabel}>Payment</span>
                      <button className={styles.editBtn} onClick={() => setStep('payment')}>Edit</button>
                    </div>
                    <p className={styles.reviewValue}>{FAKE_CARDS[selectedCard].brand} **** {FAKE_CARDS[selectedCard].number.slice(-4)}</p>
                  </div>

                  {error && <p className={styles.error}>{error}</p>}

                  <div className={styles.btnRow}>
                    <button className={styles.backBtn} onClick={() => setStep('payment')}>← Back</button>
                    <button className={styles.placeBtn} onClick={handlePlaceOrder} disabled={processing}>
                      {processing ? (
                        <span className={styles.spinner}>Processing...</span>
                      ) : (
                        `Place Order · $${grandTotal.toFixed(2)}`
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Order Summary */}
            <div className={styles.summaryCol}>
              <div className={styles.summaryCard}>
                <h2 className={styles.summaryTitle}>Order Summary</h2>
                <div className={styles.summaryItems}>
                  {items.map(item => (
                    <div key={item.id} className={styles.summaryItem}>
                      <div className={styles.summaryImgWrap}>
                        {item.image ? <img src={item.image} alt={item.title} /> : <span>📦</span>}
                        <span className={styles.summaryQty}>{item.quantity}</span>
                      </div>
                      <div className={styles.summaryInfo}>
                        <p className={styles.summaryName}>{item.title}</p>
                        <p className={styles.summaryUnit}>${item.price.toFixed(2)} each</p>
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
          </div>
        </div>
      </div>
    </>
  );
}
