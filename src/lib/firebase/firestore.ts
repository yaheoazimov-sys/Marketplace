// Direct Firestore operations — no Admin SDK needed
import {
  collection, doc, getDocs, getDoc, addDoc, updateDoc, deleteDoc,
  query, where, orderBy, runTransaction,
  QueryConstraint, DocumentData
} from 'firebase/firestore';
import { db } from './client';

// ── Products ──────────────────────────────────────────────
export async function getProducts(filters?: { categoryId?: string; sellerId?: string; status?: string }) {
  const constraints: QueryConstraint[] = [];
  if (filters?.categoryId) constraints.push(where('categoryId', '==', filters.categoryId));
  if (filters?.sellerId) constraints.push(where('sellerId', '==', filters.sellerId));
  if (filters?.status) constraints.push(where('status', '==', filters.status));
  const q = query(collection(db, 'products'), ...constraints);
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

export async function getProduct(id: string): Promise<any | null> {
  const snap = await getDoc(doc(db, 'products', id));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() };
}

export async function createProduct(data: DocumentData) {
  const ref = await addDoc(collection(db, 'products'), {
    ...data,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    rating: 0,
    reviewCount: 0,
  });
  await updateDoc(ref, { id: ref.id });
  return ref.id;
}

export async function updateProduct(id: string, data: Partial<DocumentData>) {
  await updateDoc(doc(db, 'products', id), { ...data, updatedAt: new Date().toISOString() });
}

export async function deleteProduct(id: string) {
  await deleteDoc(doc(db, 'products', id));
}

// ── Orders ────────────────────────────────────────────────
export async function getOrders(uid: string, role: string) {
  let q;
  if (role === 'client') {
    q = query(collection(db, 'orders'), where('clientId', '==', uid), orderBy('createdAt', 'desc'));
  } else if (role === 'seller') {
    q = query(collection(db, 'orders'), where('sellerIds', 'array-contains', uid), orderBy('createdAt', 'desc'));
  } else {
    q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
  }
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

export async function getOrder(id: string): Promise<any | null> {
  const snap = await getDoc(doc(db, 'orders', id));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() };
}

// Creates order AND decrements stock atomically via transaction
export async function placeOrder(data: {
  clientId: string;
  items: Array<{ id: string; title: string; price: number; quantity: number; image?: string; sellerId: string }>;
  shippingAddress: string;
  paymentMethod: string;
  totalAmount: number;
}) {
  return runTransaction(db, async (tx) => {
    // 1. Read all products and verify stock
    const refs = data.items.map(i => doc(db, 'products', i.id));
    const snaps = await Promise.all(refs.map(r => tx.get(r)));

    for (let i = 0; i < data.items.length; i++) {
      const snap = snaps[i];
      if (!snap.exists()) throw new Error(`Product "${data.items[i].title}" not found`);
      const p = snap.data();
      if ((p.stock ?? 0) < data.items[i].quantity) {
        throw new Error(`"${data.items[i].title}" — only ${p.stock} left in stock`);
      }
    }

    // 2. Decrement stock
    for (let i = 0; i < data.items.length; i++) {
      const p = snaps[i].data()!;
      tx.update(refs[i], { stock: p.stock - data.items[i].quantity, updatedAt: new Date().toISOString() });
    }

    // 3. Create order
    const sellerIds = [...new Set(data.items.map(i => i.sellerId))];
    const now = new Date().toISOString();
    const orderRef = doc(collection(db, 'orders'));
    tx.set(orderRef, {
      id: orderRef.id,
      clientId: data.clientId,
      sellerIds,
      items: data.items,
      shippingAddress: data.shippingAddress,
      paymentMethod: data.paymentMethod,
      totalAmount: data.totalAmount,
      status: 'confirmed',
      timeline: [
        { status: 'pending',   timestamp: now, note: 'Order placed' },
        { status: 'confirmed', timestamp: now, note: 'Payment confirmed' },
      ],
      createdAt: now,
      updatedAt: now,
    });

    return orderRef.id;
  });
}

export async function createOrder(data: DocumentData) {
  const ref = await addDoc(collection(db, 'orders'), {
    ...data,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });
  await updateDoc(ref, { id: ref.id });
  return ref.id;
}

// ── Addresses ─────────────────────────────────────────────
export async function getAddresses(uid: string) {
  const snap = await getDocs(collection(db, 'users', uid, 'addresses'));
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

export async function saveAddress(uid: string, address: DocumentData) {
  const ref = await addDoc(collection(db, 'users', uid, 'addresses'), {
    ...address,
    createdAt: new Date().toISOString(),
  });
  await updateDoc(ref, { id: ref.id });
  return ref.id;
}

export async function deleteAddress(uid: string, addressId: string) {
  await deleteDoc(doc(db, 'users', uid, 'addresses', addressId));
}

export async function updateOrderStatus(id: string, status: string, note = '') {
  const orderRef = doc(db, 'orders', id);
  const snap = await getDoc(orderRef);
  if (!snap.exists()) throw new Error('Order not found');
  const order = snap.data();
  const timeline = order.timeline || [];
  timeline.push({ status, note, timestamp: new Date().toISOString() });
  await updateDoc(orderRef, { status, timeline, updatedAt: new Date().toISOString() });
}

// ── Reviews ───────────────────────────────────────────────
export async function getReviews(productId: string) {
  const q = query(collection(db, 'reviews'), where('productId', '==', productId), orderBy('createdAt', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

export async function getSellerReviews(sellerId: string) {
  const q = query(collection(db, 'reviews'), where('sellerId', '==', sellerId), orderBy('createdAt', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

// Check if user has purchased this product
export async function hasPurchased(userId: string, productId: string): Promise<boolean> {
  const q = query(collection(db, 'orders'), where('clientId', '==', userId));
  const snap = await getDocs(q);
  return snap.docs.some(d => {
    const order = d.data();
    return ['confirmed','processing','shipped','delivered','paid'].includes(order.status) &&
      order.items?.some((i: any) => i.id === productId);
  });
}

// Check if user already reviewed this product
export async function getUserReview(userId: string, productId: string): Promise<any | null> {
  const q = query(collection(db, 'reviews'), where('userId', '==', userId), where('productId', '==', productId));
  const snap = await getDocs(q);
  if (snap.empty) return null;
  return { id: snap.docs[0].id, ...snap.docs[0].data() };
}

export async function createReview(data: {
  productId: string; sellerId: string; userId: string;
  userName: string; rating: number; text: string;
}) {
  const ref = await addDoc(collection(db, 'reviews'), {
    ...data,
    createdAt: new Date().toISOString(),
    sellerReply: null,
  });
  await updateDoc(ref, { id: ref.id });

  // Update product rating
  const reviews = await getReviews(data.productId);
  const avg = reviews.reduce((s, r: any) => s + r.rating, 0) / reviews.length;
  await updateDoc(doc(db, 'products', data.productId), {
    rating: +avg.toFixed(1),
    reviewCount: reviews.length,
  });

  return ref.id;
}

export async function replyToReview(reviewId: string, reply: string) {
  await updateDoc(doc(db, 'reviews', reviewId), {
    sellerReply: reply,
    sellerReplyAt: new Date().toISOString(),
  });
}

export async function deleteReview(reviewId: string, productId: string) {
  await deleteDoc(doc(db, 'reviews', reviewId));
  const reviews = await getReviews(productId);
  const avg = reviews.length ? reviews.reduce((s, r: any) => s + r.rating, 0) / reviews.length : 0;
  await updateDoc(doc(db, 'products', productId), { rating: +avg.toFixed(1), reviewCount: reviews.length });
}
// ── Ads ───────────────────────────────────────────────────
export async function createAd(data: {
  sellerId: string; sellerName: string;
  productId: string; productTitle: string; productImage: string;
  title: string; description: string; link: string;
  startDate: string; endDate: string; days: number; totalCost: number;
}) {
  const ref = await addDoc(collection(db, 'ads'), {
    ...data, status: 'pending',
    createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), adminNote: '',
  });
  await updateDoc(ref, { id: ref.id });
  return ref.id;
}

export async function getAds(filters?: { sellerId?: string; status?: string }) {
  const constraints: QueryConstraint[] = [];
  if (filters?.sellerId) constraints.push(where('sellerId', '==', filters.sellerId));
  if (filters?.status) constraints.push(where('status', '==', filters.status));
  const q = query(collection(db, 'ads'), ...constraints, orderBy('createdAt', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

export async function getActiveAds() {
  const now = new Date().toISOString().split('T')[0];
  const snap = await getDocs(query(collection(db, 'ads'), where('status', '==', 'approved')));
  return snap.docs.map(d => ({ id: d.id, ...d.data() })).filter((ad: any) => ad.startDate <= now && ad.endDate >= now);
}

export async function updateAdStatus(id: string, status: 'approved' | 'rejected', adminNote = '') {
  await updateDoc(doc(db, 'ads', id), { status, adminNote, updatedAt: new Date().toISOString() });
}

export async function deleteAd(id: string) { await deleteDoc(doc(db, 'ads', id)); }

// ── Categories ────────────────────────────────────────────
export async function getCategories() {  const snap = await getDocs(collection(db, 'categories'));
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

// ── Users ─────────────────────────────────────────────────
export async function getUser(uid: string): Promise<any | null> {
  const snap = await getDoc(doc(db, 'users', uid));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() };
}

export async function updateUser(uid: string, data: Partial<DocumentData>) {
  await updateDoc(doc(db, 'users', uid), data);
}
