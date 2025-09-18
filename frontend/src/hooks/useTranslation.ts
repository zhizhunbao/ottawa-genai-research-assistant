import { useCallback, useState } from 'react';
import { mockTranslations } from '../mock/data/translations';

type Language = 'en' | 'fr';

interface TranslationHook {
  t: (key: string, fallback?: string) => string;
  language: Language;
  setLanguage: (language: Language) => void;
  languages: Language[];
}

export const useTranslation = (): TranslationHook => {
  const [language, setLanguage] = useState<Language>('en');

  const t = useCallback((key: string, fallback?: string): string => {
    const keys = key.split('.');
    let translation: any = mockTranslations[language];
    
    for (const k of keys) {
      if (translation && typeof translation === 'object' && k in translation) {
        translation = translation[k];
      } else {
        return fallback || key;
      }
    }
    
    return typeof translation === 'string' ? translation : (fallback || key);
  }, [language]);

  return {
    t,
    language,
    setLanguage,
    languages: ['en', 'fr']
  };
}; 