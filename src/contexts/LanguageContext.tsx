import React, {
  createContext,
  useState,
  useContext,
  useEffect,
  ReactNode,
  useCallback,
} from "react";
import { zh } from "../locales/zh";
import { zhHans } from "../locales/zhHans";
import { en } from "../locales/en";

export type Language = "zh" | "zhHans" | "en";

const translations: Record<Language, typeof zh> = {
  zh,
  zhHans,
  en,
};

interface LanguageContextType {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: keyof typeof zh, replacements?: { [key: string]: string | number }) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('en');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedLanguage = localStorage.getItem('language') as Language | null;
      if (storedLanguage && (["zh", "zhHans", "en"] as Language[]).includes(storedLanguage)) {
        setLanguage(storedLanguage);
        return;
      }

      // Basic browser-language hint for first-time visitors
      const navLang = window.navigator.language.toLowerCase();
      if (navLang.startsWith("zh")) {
        // Default Chinese users to Simplified first
        setLanguage("zhHans");
      }
    }
  }, []);

  const handleSetLanguage = useCallback((lang: Language) => {
    setLanguage(lang);
    if (typeof window !== 'undefined') {
      localStorage.setItem('language', lang);
    }
  }, []);
  
  const t = useCallback((key: keyof typeof zh, replacements?: { [key: string]: string | number }): string => {
    let translation = translations[language][key] || translations['zh'][key] || key;
    if (replacements) {
        Object.keys(replacements).forEach(rKey => {
            translation = translation.replace(`{${rKey}}`, String(replacements[rKey]));
        });
    }
    return translation;
  }, [language]);


  const value = { language, setLanguage: handleSetLanguage, t };

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
