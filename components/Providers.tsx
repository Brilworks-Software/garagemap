'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { AuthService } from '@/firebase/services/AuthService';

export default function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const unsubscribe = AuthService.onAuthStateChanged((user) => {
      // Define public routes that don't require authentication
      const publicRoutes = ['/', '/about', '/contact'];
      const isPublicRoute = pathname && publicRoutes.includes(pathname);
      const isAuthPage = pathname?.startsWith('/auth');
      const isUserPage = pathname?.startsWith('/user');
      
      if (user) {
        // Check if email is verified
        if (!user.emailVerified) {
          // Email not verified - redirect to login page (but allow public routes)
          if (!isAuthPage && !isPublicRoute) {
            router.push('/auth/login');
          }
        } else {
          // Email verified - allow access to user pages
          // Don't redirect if already on a public route or auth page
          if (!isUserPage && !isAuthPage && !isPublicRoute) {
            router.push('/user');
          }
        }
      } else {
        // User is signed out - only redirect to login if trying to access protected routes
        // Allow access to public routes, auth pages, and home page
        if (!isAuthPage && !isPublicRoute) {
          router.push('/auth/login');
        }
      }
    });

    return () => unsubscribe();
  }, [router, pathname]);

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}