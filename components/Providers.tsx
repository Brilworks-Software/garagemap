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
      // Don't redirect if we're already on auth pages
      const isAuthPage = pathname?.startsWith('/auth');
      const isUserPage = pathname?.startsWith('/user');
      
      if (user) {
        // Check if email is verified
        if (!user.emailVerified) {
          // Email not verified - redirect to login page
          if (!isAuthPage) {
            router.push('/auth/login');
          }
        } else {
          // Email verified - allow access to user pages
          if (!isUserPage && !isAuthPage) {
            router.push('/user');
          }
        }
      } else {
        // User is signed out - redirect to login if not already on auth pages
        if (!isAuthPage && pathname !== '/') {
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