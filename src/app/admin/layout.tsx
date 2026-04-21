'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase/client';
import { useAuth } from '@/contexts/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import styles from './admin.layout.module.css';

const NAV = [
  { section: 'Overview' },
  { href: '/admin', label: 'Dashboard', icon: '📊', exact: true },
  { section: 'Users' },
  { href: '/admin/users', label: 'All Users', icon: '👥' },
  { href: '/admin/users/sellers', label: 'Sellers', icon: '🏪' },
  { href: '/admin/users/buyers', label: 'Buyers', icon: '🛒' },
  { section: 'Catalog' },
  { href: '/admin/products', label: 'Products', icon: '📦' },
  { href: '/admin/categories', label: 'Categories', icon: '🗂️' },
  { href: '/admin/ads', label: 'Advertising', icon: '📢' },
  { section: 'Finance' },
  { href: '/admin/orders', label: 'All Orders', icon: '🧾' },
  { href: '/admin/finance', label: 'Finance', icon: '💰' },
  { href: '/admin/disputes', label: 'Disputes', icon: '⚖️' },
  { section: 'Support' },
  { href: '/admin/reviews', label: 'Reviews', icon: '⭐' },
  { section: 'Settings' },
  { href: '/admin/settings', label: 'Platform Settings', icon: '⚙️' },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute allowedRoles={['admin']}>
      <Shell>{children}</Shell>
    </ProtectedRoute>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { profile } = useAuth();

  const isActive = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname.startsWith(href) && href !== '/admin';

  const handleSignOut = async () => { await signOut(auth); router.push('/'); };

  return (
    <div className={styles.shell}>
      <aside className={styles.sidebar}>
        <div className={styles.sidebarTop}>
          <Link href="/" className={styles.logo}>BigBoss</Link>
          <span className={styles.adminBadge}>Admin</span>
        </div>

        <nav className={styles.nav}>
          {NAV.map((item, i) => {
            if ('section' in item) return <p key={i} className={styles.section}>{item.section}</p>;
            return (
              <Link key={item.href} href={item.href!}
                className={`${styles.navItem} ${isActive(item.href!, item.exact) ? styles.navItemActive : ''}`}>
                <span className={styles.navIcon}>{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className={styles.sidebarBottom}>
          <Link href="/" className={styles.navItem}>
            <span className={styles.navIcon}>🌐</span><span>View Store</span>
          </Link>
          <button className={`${styles.navItem} ${styles.signOut}`} onClick={handleSignOut}>
            <span className={styles.navIcon}>🚪</span><span>Sign Out</span>
          </button>
        </div>
      </aside>

      <div className={styles.main}>
        <header className={styles.topbar}>
          <div className={styles.topbarLeft}>
            <span className={styles.breadcrumb}>{pathname.split('/').filter(Boolean).join(' / ')}</span>
          </div>
          <div className={styles.topbarRight}>
            <span className={styles.adminName}>{profile?.displayName || 'Admin'}</span>
            <div className={styles.adminAvatar}>{(profile?.displayName?.[0] || 'A').toUpperCase()}</div>
          </div>
        </header>
        <div className={styles.content}>{children}</div>
      </div>
    </div>
  );
}

