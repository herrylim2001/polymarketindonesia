'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { AdminSkeleton } from './Skeleton';

interface AdminGuardProps {
  children: React.ReactNode;
}

export default function AdminGuard({ children }: AdminGuardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isChecking, setIsChecking] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Skip check for login page
    if (pathname === '/admin/login') {
      setIsChecking(false);
      setIsAuthenticated(true);
      return;
    }

    // Check admin authentication
    const adminAuth = sessionStorage.getItem('adminAuth');

    if (adminAuth === 'true') {
      setIsAuthenticated(true);
    } else {
      router.push('/admin/login');
    }

    setIsChecking(false);
  }, [pathname, router]);

  if (isChecking) {
    return <AdminSkeleton />;
  }

  if (!isAuthenticated && pathname !== '/admin/login') {
    return <AdminSkeleton />;
  }

  return <>{children}</>;
}
