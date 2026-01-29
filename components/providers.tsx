'use client';

import React from 'react';
import { AuthProvider } from '@/lib/auth-context';
import { LanguageProvider } from '@/lib/language-context';
import { Toaster } from '@/components/ui/toaster';
import { RootLayoutClient } from '@/components/root-layout-client';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <LanguageProvider>
        <RootLayoutClient>
          {children}
        </RootLayoutClient>
        <Toaster />
      </LanguageProvider>
    </AuthProvider>
  );
}
