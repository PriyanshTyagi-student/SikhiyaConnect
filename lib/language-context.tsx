'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import translations from './translations.json';

type Language = 'en' | 'hi' | 'pa' | 'bn' | 'gu' | 'mr' | 'ta' | 'te' | 'kn' | 'ml' | 'ur' | 'es' | 'fr';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>('en');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Get saved language from localStorage or use browser language
    const saved = localStorage.getItem('language') as Language | null;
    if (saved && ['en', 'hi', 'pa', 'bn', 'gu', 'mr', 'ta', 'te', 'kn', 'ml', 'ur', 'es', 'fr'].includes(saved)) {
      setLanguageState(saved);
    } else {
      // Try to detect browser language
      const browserLang = navigator.language.split('-')[0];
      if (['hi', 'pa', 'bn', 'gu', 'mr', 'ta', 'te', 'kn', 'ml', 'ur', 'es', 'fr'].includes(browserLang)) {
        setLanguageState(browserLang as Language);
      }
    }
    setMounted(true);
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('language', lang);
  };

  const t = (key: string): string => {
    const keys = key.split('.');
    let value: any = translations[language as keyof typeof translations];
    
    for (const k of keys) {
      value = value?.[k];
    }
    
    return value || key;
  };

  // Always provide context, but use default 'en' until mounted
  const contextValue: LanguageContextType = {
    language: mounted ? language : 'en',
    setLanguage,
    t
  };

  return (
    <LanguageContext.Provider value={contextValue}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return context;
}
