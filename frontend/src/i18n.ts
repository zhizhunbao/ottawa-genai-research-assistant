/**
 * i18n Configuration
 *
 * Internationalization setup for English and French support using react-i18next.
 *
 * @template — Custom Implementation
 */

import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

// Import translation files
import enCommon from './locales/en/common.json'
import enHome from './locales/en/home.json'
import enAuth from './locales/en/auth.json'
import enChat from './locales/en/chat.json'

import frCommon from './locales/fr/common.json'
import frHome from './locales/fr/home.json'
import frAuth from './locales/fr/auth.json'
import frChat from './locales/fr/chat.json'

// Translation resources
const resources = {
  en: {
    common: enCommon,
    home: enHome,
    auth: enAuth,
    chat: enChat,
  },
  fr: {
    common: frCommon,
    home: frHome,
    auth: frAuth,
    chat: frChat,
  },
}

// Get saved language or default to English
const getSavedLanguage = (): string => {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('language')
    if (saved === 'en' || saved === 'fr') return saved
    return 'en'
  }
  return 'en'
}

// Initialize i18n
i18n.use(initReactI18next).init({
  resources,
  lng: getSavedLanguage(),
  fallbackLng: 'en',
  defaultNS: 'common',
  ns: ['common', 'home', 'auth', 'chat'],

  interpolation: {
    escapeValue: false, // React already escapes values
  },

  react: {
    useSuspense: true,
  },
})

// Function to change language and persist
export const changeLanguage = (lang: 'en' | 'fr') => {
  i18n.changeLanguage(lang)
  localStorage.setItem('language', lang)
}

export default i18n
