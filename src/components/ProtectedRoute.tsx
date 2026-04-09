'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth, UserRole } from '@/contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
}

export default function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { user, profile, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        // Not logged in -> redirect to login
        router.push('/auth/login');
      } else if (profile && allowedRoles && !allowedRoles.includes(profile.role)) {
        // Logged in but missing correct role -> redirect to home
        router.push('/');
      }
    }
  }, [user, profile, loading, router, allowedRoles]);

  // Show a loading spinner or skeleton while checking auth
  if (loading) {
    return (
      <div style={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center' }}>
        <p>Loading...</p>
      </div>
    );
  }

  // Double check before rendering children
  if (!user || (profile && allowedRoles && !allowedRoles.includes(profile.role))) {
    return null;
  }

  return <>{children}</>;
}
