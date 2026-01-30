'use client';

import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import translations from './translations.json';
import { autoTranslate } from './offline-translator';
import { downloadModels, getSupportedLanguages, isNativePlatform, translateText } from './native-translate';

export type Language = 'en' | 'hi' | 'pa' | 'bn' | 'gu' | 'mr' | 'ta' | 'te' | 'kn' | 'ml' | 'ur' | 'es' | 'fr';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>('en');
  const [mounted, setMounted] = useState(false);
  const [nativeReady, setNativeReady] = useState(false);
  const [cache, setCache] = useState<Record<string, string>>({});
  const pendingRef = useRef<Set<string>>(new Set());

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

  useEffect(() => {
    if (!mounted) return;
    let cancelled = false;

    const setupNative = async () => {
      const native = await isNativePlatform();
      if (cancelled) return;
      setNativeReady(native);

      if (native) {
        const key = 'mlkit_models_downloaded_v1';
        const already = localStorage.getItem(key) === '1';
        if (!already) {
          await downloadModels(getSupportedLanguages());
          localStorage.setItem(key, '1');
        }
      }
    };

    setupNative();
    return () => {
      cancelled = true;
    };
  }, [mounted]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('language', lang);
  };

  const translateWithCache = (text: string): string => {
    if (language === 'en') return text;
    const cacheKey = `${language}::${text}`;
    const cached = cache[cacheKey];
    if (cached) return cached;

    if (mounted && nativeReady && !pendingRef.current.has(cacheKey)) {
      pendingRef.current.add(cacheKey);
      translateText(text, language)
        .then((translated) => {
          setCache((prev) => ({ ...prev, [cacheKey]: translated }));
        })
        .finally(() => {
          pendingRef.current.delete(cacheKey);
        });
    }

    return autoTranslate(text, language);
  };

  const t = (key: string): string => {
    // If key looks like a translation path (contains '.'), resolve from translations.json
    if (key.includes('.')) {
      const keys = key.split('.');
      let value: any = translations[language as keyof typeof translations];
      let fallback: any = translations.en;

      for (const k of keys) {
        value = value?.[k];
        fallback = fallback?.[k];
      }

      if (value) return value;
      if (fallback) return translateWithCache(fallback);
      return key;
    }

    // Otherwise treat key as raw English text and auto-translate offline
    return translateWithCache(key);
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
