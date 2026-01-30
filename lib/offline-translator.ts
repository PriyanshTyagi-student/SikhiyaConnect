'use client';

import type { Language } from './language-context';

// Minimal offline dictionary for common UI words/phrases.
// This is intentionally small and can be extended later.
const DICTIONARY: Record<Language, Record<string, string>> = {
  en: {},
  hi: {
    "welcome": "स्वागत",
    "back": "वापसी",
    "sign": "साइन",
    "in": "इन",
    "up": "अप",
    "email": "ईमेल",
    "password": "पासवर्ड",
    "dashboard": "डैशबोर्ड",
    "courses": "पाठ्यक्रम",
    "profile": "प्रोफ़ाइल",
    "submit": "सबमिट",
    "continue": "जारी रखें",
    "next": "अगला",
  },
  pa: {
    "welcome": "ਸੁਆਗਤ",
    "back": "ਵਾਪਸੀ",
    "sign": "ਸਾਈਨ",
    "in": "ਇਨ",
    "up": "ਅਪ",
    "email": "ਈਮੇਲ",
    "password": "ਪਾਸਵਰਡ",
    "dashboard": "ਡੈਸ਼ਬੋਰਡ",
    "courses": "ਕੋਰਸ",
    "profile": "ਪ੍ਰੋਫਾਈਲ",
    "submit": "ਜਮ੍ਹਾਂ",
    "continue": "ਜਾਰੀ ਰੱਖੋ",
    "next": "ਅਗਲਾ",
  },
  bn: {},
  gu: {},
  mr: {},
  ta: {},
  te: {},
  kn: {},
  ml: {},
  ur: {},
  es: {},
  fr: {},
};

const TOKEN_RE = /([A-Za-z]+|[^A-Za-z]+)/g;

export function autoTranslate(text: string, language: Language): string {
  if (language === 'en') return text;
  const dict = DICTIONARY[language] || {};

  return (text.match(TOKEN_RE) || [text])
    .map((token) => {
      if (!/^[A-Za-z]+$/.test(token)) return token;
      const lower = token.toLowerCase();
      const translated = dict[lower];
      if (!translated) return token;

      // Preserve capitalization (first letter)
      if (token[0] === token[0].toUpperCase()) {
        return translated.charAt(0).toUpperCase() + translated.slice(1);
      }
      return translated;
    })
    .join('');
}
