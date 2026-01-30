'use client';

import React, { useEffect } from "react"
import { usePathname, useRouter } from 'next/navigation';
import { initializeAPI } from "@/lib/api";
import { TeacherApprovalListener } from './teacher-approval-listener';

export function RootLayoutClient({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Initialize API connection on app load
    initializeAPI();
  }, []);

  useEffect(() => {
    let removeListener: (() => void) | null = null;

    const setupBackHandler = async () => {
      const [{ App }, { Capacitor }] = await Promise.all([
        import('@capacitor/app'),
        import('@capacitor/core'),
      ]);

      if (!Capacitor.isNativePlatform()) return;

      const handler = App.addListener('backButton', () => {
        const isAuth = pathname.startsWith('/auth');
        if (isAuth) {
          router.push('/');
          return;
        }

        if (pathname !== '/') {
          router.back();
          return;
        }

        App.exitApp();
      });

      removeListener = () => handler.remove();
    };

    setupBackHandler();

    return () => {
      if (removeListener) removeListener();
    };
  }, [pathname, router]);

  return (
    <>
      <TeacherApprovalListener />
      {children}
    </>
  );
}
