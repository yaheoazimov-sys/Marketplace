// Sets a user to admin role by email
// Run: node scripts/set-admin.mjs

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, query, where, getDocs, updateDoc } from 'firebase/firestore';

const app = initializeApp({
  apiKey: "AIzaSyAVtOFYZ_0r2pzJI1vvpped1wwCQtjOwiY",
  authDomain: "yahyoshopai.firebaseapp.com",
  projectId: "yahyoshopai",
  storageBucket: "yahyoshopai.firebasestorage.app",
  messagingSenderId: "1054569171754",
  appId: "1:1054569171754:web:c534e4584fb2d5ba7a6c53",
});
const db = getFirestore(app);

// Change this to your email
const TARGET_EMAIL = 'azimovjohn11@gmail.com';

async function run() {
  console.log(`Setting ${TARGET_EMAIL} to admin...\n`);
  const q = query(collection(db, 'users'), where('email', '==', TARGET_EMAIL));
  const snap = await getDocs(q);

  if (snap.empty) {
    console.log('User not found. Make sure you are logged in to the site first.');
    process.exit(1);
  }

  for (const d of snap.docs) {
    await updateDoc(d.ref, { role: 'admin' });
    console.log(`✓ Updated user ${d.id} → role: admin`);
  }

  console.log('\nDone! Sign out and sign back in to see the changes.');
  process.exit(0);
}

run().catch(e => { console.error(e.message); process.exit(1); });
