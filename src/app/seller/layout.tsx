'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase/client';
import { useAuth } from '@/contexts/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import styles from './seller.layout.module.css';

const NAV = [
  { href: '/seller', label: 'Dashboard', icon: '🏠', exact: true },
  { href: '/seller/orders', label: 'Orders', icon: '📋' },
  { href: '/seller/products', label: 'Products', icon: '📦' },
  { href: '/seller/analytics', label: 'Analytics', icon: '📊' },
  { href: '/seller/customers', label: 'Customers', icon: '👥' },
  { href: '/seller/settings', label: 'Settings', icon: '⚙️' },
];

export default function SellerLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute allowedRoles={['seller', 'admin']}>
      <SellerShell>{children}</SellerShell>
    </ProtectedRoute>
  );
}

function SellerShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { profile } = useAuth();
  const [collapsed, setCollapsed] = useState(false);

  const isActive = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname.startsWith(href);

  const handleSignOut = async () => {
    await signOut(auth);
    router.push('/');
  };

  return (
    <div className={styles.shell}>
      {/* Sidebar */}
      <aside className={`${styles.sidebar} ${collapsed ? styles.sidebarCollapsed : ''}`}>
        <div className={styles.sidebarTop}>
          <Link href="/" className={styles.logo}>
            {collapsed ? 'BB' : 'BigBoss'}
          </Link>
          <button className={styles.collapseBtn} onClick={() => setCollapsed(c => !c)}>
            {collapsed ? '›' : '‹'}
          </button>
        </div>

        <nav className={styles.nav}>
          {NAV.map(item => (
            <Link
              key={item.href}
              href={item.href}
              className={`${styles.navItem} ${isActive(item.href, item.exact) ? styles.navItemActive : ''}`}
            >
              <span className={styles.navIcon}>{item.icon}</span>
              {!collapsed && <span className={styles.navLabel}>{item.label}</span>}
            </Link>
          ))}
        </nav>

        <div className={styles.sidebarBottom}>
          <Link href="/" className={`${styles.navItem} ${styles.navItemSm}`}>
            <span className={styles.navIcon}>🌐</span>
            {!collapsed && <span className={styles.navLabel}>View Store</span>}
          </Link>
          <button className={`${styles.navItem} ${styles.navItemSm} ${styles.signOutBtn}`} onClick={handleSignOut}>
            <span className={styles.navIcon}>🚪</span>
            {!collapsed && <span className={styles.navLabel}>Sign Out</span>}
          </button>
        </div>
      </aside>

      {/* Main */}
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
