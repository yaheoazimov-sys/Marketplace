'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
export default function SellerDashboardRedirect() {
  const router = useRouter();
  useEffect(() => { router.replace('/seller'); }, [router]);
  return null;
}

