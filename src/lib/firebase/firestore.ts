// Direct Firestore operations — no Admin SDK needed
import {
  collection, doc, getDocs, getDoc, addDoc, updateDoc, deleteDoc,
  query, where, orderBy, limit, Timestamp, serverTimestamp,
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

export async function getProduct(id: string) {
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

export async function getOrder(id: string) {
  const snap = await getDoc(doc(db, 'orders', id));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() };
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

export async function updateOrderStatus(id: string, status: string, note = '') {
  const orderRef = doc(db, 'orders', id);
  const snap = await getDoc(orderRef);
  if (!snap.exists()) throw new Error('Order not found');
  const order = snap.data();
  const timeline = order.timeline || [];
  timeline.push({ status, note, timestamp: new Date().toISOString() });
  await updateDoc(orderRef, { status, timeline, updatedAt: new Date().toISOString() });
}

// ── Categories ────────────────────────────────────────────
export async function getCategories() {
  const snap = await getDocs(collection(db, 'categories'));
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

// ── Users ─────────────────────────────────────────────────
export async function getUser(uid: string) {
  const snap = await getDoc(doc(db, 'users', uid));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() };
}

export async function updateUser(uid: string, data: Partial<DocumentData>) {
  await updateDoc(doc(db, 'users', uid), data);
}
