'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { getActiveAds } from '@/lib/firebase/firestore';
import styles from './AdBanner.module.css';

export default function AdBanner() {
  const [ads, setAds] = useState<any[]>([]);
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    getActiveAds().then(setAds);
  }, []);

  useEffect(() => {
    if (ads.length <= 1) return;
    const t = setInterval(() => setCurrent(c => (c + 1) % ads.length), 5000);
    return () => clearInterval(t);
  }, [ads.length]);

  if (ads.length === 0) return null;

  const ad = ads[current];

  return (
    <div className={styles.wrap}>
      <div className={styles.label}>SPONSORED</div>
      <Link href={ad.link || `/products/${ad.productId}`} className={styles.banner}>
        {ad.productImage && <img src={ad.productImage} alt={ad.title} className={styles.img} />}
        <div className={styles.content}>
          <p className={styles.title}>{ad.title || ad.productTitle}</p>
          {ad.description && <p className={styles.desc}>{ad.description}</p>}
        </div>
        <span className={styles.cta}>Shop Now →</span>
      </Link>
      {ads.length > 1 && (
        <div className={styles.dots}>
          {ads.map((_, i) => (
            <button key={i} className={`${styles.dot} ${i === current ? styles.dotActive : ''}`} onClick={() => setCurrent(i)} />
          ))}
        </div>
      )}
    </div>
  );
}
