'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import styles from './Navbar.module.css';

interface NavbarProps {
  search?: string;
  onSearch?: (v: string) => void;
  dark?: boolean;
}

export default function Navbar({ search = '', onSearch, dark = false }: NavbarProps) {
  const { user, profile } = useAuth();
  const { items } = useCart();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const cartCount = items.reduce((s, i) => s + i.quantity, 0);

  const handleSignOut = async () => {
    await signOut(auth);
    setMenuOpen(false);
    router.push('/');
  };

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const initials = profile?.displayName
    ? profile.displayName.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
    : user?.email?.[0].toUpperCase() ?? '?';

  const roleLabel: Record<string, string> = {
    admin: '🛡️ Admin',
    seller: '🏪 Seller',
    client: '🛒 Buyer',
  };

  return (
    <header className={`${styles.navbar} ${dark ? styles.navbarDark : ''}`}>
      <div className={styles.inner}>
        {/* Logo */}
        <Link href="/" className={styles.logo}>
          Big<span>Boss</span>
        </Link>

        {/* Search */}
        {onSearch !== undefined && (
          <div className={styles.searchWrap}>
            <span className={styles.searchIcon}>🔍</span>
            <input
              className={styles.searchInput}
              type="text"
              placeholder="Search products..."
              value={search}
              onChange={e => onSearch(e.target.value)}
            />
          </div>
        )}

        {/* Actions */}
        <nav className={styles.actions}>
          {/* Cart */}
          <Link href="/checkout" className={styles.cartBtn}>
            🛒
            {cartCount > 0 && <span className={styles.cartBadge}>{cartCount}</span>}
          </Link>

          {user ? (
            /* ── Authenticated ── */
            <div className={styles.userMenu} ref={menuRef}>
              <button
                className={styles.avatarBtn}
                onClick={() => setMenuOpen(o => !o)}
                aria-label="User menu"
              >
                {profile?.photoURL ? (
                  <img src={profile.photoURL} alt="avatar" className={styles.avatarImg} />
                ) : (
                  <span className={styles.avatarInitials}>{initials}</span>
                )}
                <span className={styles.avatarName}>
                  {profile?.displayName?.split(' ')[0] ?? 'Account'}
                </span>
                <span className={styles.chevron}>{menuOpen ? '▲' : '▼'}</span>
              </button>

              {menuOpen && (
                <div className={styles.dropdown}>
                  <div className={styles.dropdownHeader}>
                    <p className={styles.dropdownName}>{profile?.displayName ?? user.email}</p>
                    <p className={styles.dropdownEmail}>{user.email}</p>
                    {profile?.role && (
                      <span className={styles.roleBadge}>
                        {roleLabel[profile.role] ?? profile.role}
                      </span>
                    )}
                  </div>

                  <div className={styles.dropdownDivider} />

                  {profile?.role === 'seller' && (
                    <Link href="/seller/dashboard" className={styles.dropdownItem} onClick={() => setMenuOpen(false)}>
                      📦 My Products
                    </Link>
                  )}
                  {profile?.role === 'admin' && (
                    <Link href="/admin/dashboard" className={styles.dropdownItem} onClick={() => setMenuOpen(false)}>
                      🛡️ Admin Panel
                    </Link>
                  )}
                  <Link href="/checkout" className={styles.dropdownItem} onClick={() => setMenuOpen(false)}>
                    🛒 Cart ({cartCount})
                  </Link>

                  <div className={styles.dropdownDivider} />

                  <button className={styles.signOutBtn} onClick={handleSignOut}>
                    🚪 Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            /* ── Guest ── */
            <>
              <Link href="/auth/login" className={styles.navLink}>Sign In</Link>
              <Link href="/auth/signup" className={styles.navBtnPrimary}>Get Started</Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
