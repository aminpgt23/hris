import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import translations from './translations';

const LanguageContext = createContext(null);

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState(() => localStorage.getItem('hris_lang') || 'id');

  const t = useCallback(
    (key) => {
      const dict = translations[lang] || translations.id;
      return dict[key] || translations.id[key] || key;
    },
    [lang]
  );

  const toggleLang = useCallback(() => {
    setLang(prev => (prev === 'id' ? 'en' : 'id'));
  }, []);

  useEffect(() => {
    localStorage.setItem('hris_lang', lang);
    document.documentElement.lang = lang === 'id' ? 'id' : 'en';
  }, [lang]);

  return (
    <LanguageContext.Provider value={{ lang, t, toggleLang, setLang }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used within LanguageProvider');
  return ctx;
}

export default LanguageContext;
