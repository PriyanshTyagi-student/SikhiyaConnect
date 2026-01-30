'use client';

import type { Language } from './language-context';

const SUPPORTED_LANGS: Language[] = [
  'en', 'hi', 'pa', 'bn', 'gu', 'mr', 'ta', 'te', 'kn', 'ml', 'ur', 'es', 'fr',
];

export function getSupportedLanguages(): Language[] {
  return SUPPORTED_LANGS;
}

export async function isNativePlatform(): Promise<boolean> {
  const { Capacitor } = await import('@capacitor/core');
  return Capacitor.isNativePlatform();
}

function mapLanguageToMLKit(lang: Language) {
  // ML Kit Language enum uses ISO codes matching our Language strings
  return lang;
}

export async function downloadModels(languages: Language[]) {
  const [{ Translation }] = await Promise.all([
    import('@capacitor-mlkit/translation'),
  ]);

  for (const lang of languages) {
    if (lang === 'en') continue; // English model not needed as target
    try {
      await Translation.downloadModel({ language: mapLanguageToMLKit(lang) as any });
    } catch {
      // Ignore download errors; translation will retry on demand
    }
  }
}

export async function translateText(text: string, targetLanguage: Language): Promise<string> {
  if (!text || targetLanguage === 'en') return text;

  const [{ Translation }] = await Promise.all([
    import('@capacitor-mlkit/translation'),
  ]);

  const { text: translated } = await Translation.translate({
    text,
    sourceLanguage: mapLanguageToMLKit('en') as any,
    targetLanguage: mapLanguageToMLKit(targetLanguage) as any,
  });

  return translated || text;
}
