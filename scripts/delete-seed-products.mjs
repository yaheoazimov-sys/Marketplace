import { initializeApp } from 'firebase/app';
import { getFirestore, collection, query, where, getDocs, deleteDoc, doc } from 'firebase/firestore';

const app = initializeApp({
  apiKey: "AIzaSyAVtOFYZ_0r2pzJI1vvpped1wwCQtjOwiY",
  authDomain: "yahyoshopai.firebaseapp.com",
  projectId: "yahyoshopai",
  storageBucket: "yahyoshopai.firebasestorage.app",
  messagingSenderId: "1054569171754",
  appId: "1:1054569171754:web:c534e4584fb2d5ba7a6c53",
});
const db = getFirestore(app);

async function run() {
  console.log('Finding all seed products (sellerId = "seed")...\n');

  const q = query(collection(db, 'products'), where('sellerId', '==', 'seed'));
  const snap = await getDocs(q);

  if (snap.empty) {
    console.log('No seed products found.');
    process.exit(0);
  }

  console.log(`Found ${snap.docs.length} seed products. Deleting...\n`);

  let count = 0;
  for (const d of snap.docs) {
    const data = d.data();
    await deleteDoc(doc(db, 'products', d.id));
    console.log(`✕ Deleted: ${data.title}`);
    count++;
  }

  console.log(`\n✅ Done! Deleted ${count} seed products.`);
  console.log('Your manually added products are untouched.');
  process.exit(0);
}

run().catch(e => { console.error(e.message); process.exit(1); });
