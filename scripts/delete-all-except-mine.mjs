import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, deleteDoc, doc } from 'firebase/firestore';

const app = initializeApp({
  apiKey: "AIzaSyAVtOFYZ_0r2pzJI1vvpped1wwCQtjOwiY",
  authDomain: "yahyoshopai.firebaseapp.com",
  projectId: "yahyoshopai",
  storageBucket: "yahyoshopai.firebasestorage.app",
  messagingSenderId: "1054569171754",
  appId: "1:1054569171754:web:c534e4584fb2d5ba7a6c53",
});
const db = getFirestore(app);

// Your UID — keep products added by you
const MY_UID = 'lH7vIfUBjQQM7hfuHWyj3dcyjF22';

async function run() {
  const snap = await getDocs(collection(db, 'products'));
  console.log(`Total products: ${snap.docs.length}\n`);

  let deleted = 0;
  let kept = 0;

  for (const d of snap.docs) {
    const data = d.data();
    if (data.sellerId !== MY_UID) {
      await deleteDoc(doc(db, 'products', d.id));
      console.log(`✕ Deleted: ${data.title} (seller: ${data.sellerId})`);
      deleted++;
    } else {
      console.log(`✓ Kept:    ${data.title} (yours)`);
      kept++;
    }
  }

  console.log(`\n✅ Done! Deleted ${deleted}, kept ${kept} (your products).`);
  process.exit(0);
}

run().catch(e => { console.error(e.message); process.exit(1); });
