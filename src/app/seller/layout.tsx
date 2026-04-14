'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase/client';
import { useAuth } from '@/contexts/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import styles from './seller.layout.module.css';

const NAV = [
  { href: '/seller', label: 'Home', icon: '🏠', exact: true },
  { href: '/seller/orders', label: 'Orders', icon: '📋', badge: true },
  { href: '/seller/products', label: 'Products', icon: '📦' },
  { href: '/seller/analytics', label: 'Analytics', icon: '📊' },
  { href: '/seller/customers', label: 'Customers', icon: '👥' },
  { href: '/seller/messages', label: 'Messages', icon: '💬' },
];

const NAV2 = [
  { href: '/seller/channels', label: 'Sales Channels', icon: '🔗' },
  { href: '/seller/site', label: 'Site', icon: '🌐' },
];

const NAV3 = [
  { href: '/seller/help', label: 'Help', icon: '❓' },
  { href: '/seller/billing', label: 'Billing', icon: '💳' },
  { href: '/seller/settings', label: 'Settings', icon: '⚙️' },
];

export default function SellerLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute allowedRoles={['seller', 'admin']}>
      <Shell>{children}</Shell>
    </ProtectedRoute>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { profile } = useAuth();

  const active = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname.startsWith(href) && href !== '/seller';

  const handleSignOut = async () => {
    await signOut(auth);
    router.push('/');
  };

  return (
    <div className={styles.shell}>
      <aside className={styles.sidebar}>
        <div className={styles.sidebarTop}>
          <span className={styles.logo}>BigBoss</span>
          <button className={styles.backArrow} onClick={() => router.push('/')}>←</button>
        </div>

        <nav className={styles.nav}>
          {NAV.map(item => (
            <Link key={item.href} href={item.href}
              className={`${styles.navItem} ${active(item.href, item.exact) ? styles.navItemActive : ''}`}>
              <span className={styles.navIcon}>{item.icon}</span>
              <span className={styles.navLabel}>{item.label}</span>
            </Link>
          ))}

          <div className={styles.navSection}>Sales</div>
          {NAV2.map(item => (
            <Link key={item.href} href={item.href}
              className={`${styles.navItem} ${active(item.href) ? styles.navItemActive : ''}`}>
              <span className={styles.navIcon}>{item.icon}</span>
              <span className={styles.navLabel}>{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className={styles.sidebarBottom}>
          {NAV3.map(item => (
            <Link key={item.href} href={item.href}
              className={`${styles.navItem} ${active(item.href) ? styles.navItemActive : ''}`}>
              <span className={styles.navIcon}>{item.icon}</span>
              <span className={styles.navLabel}>{item.label}</span>
            </Link>
          ))}
          <button className={styles.navItem} onClick={handleSignOut}>
            <span className={styles.navIcon}>🚪</span>
            <span className={styles.navLabel}>Sign Out</span>
          </button>
        </div>
      </aside>

      <div className={styles.main}>
        <header className={styles.topbar}>
          <div className={styles.topbarLeft}>
            <span className={styles.storeName}>{profile?.displayName || 'My Store'}</span>
          </div>
          <div className={styles.topbarRight}>
            <Link href="/" className={styles.viewSiteBtn}>View Site</Link>
            <Link href="/seller/products/new" className={styles.publishBtn}>+ Add Product</Link>
          </div>
        </header>
        <div className={styles.content}>{children}</div>
      </div>
    </div>
  );
}
