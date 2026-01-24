"use client";

import { useEffect, useState } from "react";
import {
  I18nProvider as BaseI18nProvider,
  Language,
  supportedLanguages,
  defaultLanguage,
} from "@rota/i18n";

const LANGUAGE_STORAGE_KEY = "rota-language";

interface WebI18nProviderProps {
  children: React.ReactNode;
}

function getInitialLanguage(): Language {
  // Check localStorage first
  if (typeof window !== "undefined") {
    const stored = localStorage.getItem(LANGUAGE_STORAGE_KEY);
    if (stored && supportedLanguages.includes(stored as Language)) {
      return stored as Language;
    }

    // Check browser language
    const browserLang = navigator.language.split("-")[0];
    if (supportedLanguages.includes(browserLang as Language)) {
      return browserLang as Language;
    }
  }

  return defaultLanguage;
}

export function WebI18nProvider({ children }: WebI18nProviderProps) {
  const [initialLanguage, setInitialLanguage] = useState<Language>(defaultLanguage);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setInitialLanguage(getInitialLanguage());
    setMounted(true);
  }, []);

  const handleLanguageChange = (lang: Language) => {
    if (typeof window !== "undefined") {
      localStorage.setItem(LANGUAGE_STORAGE_KEY, lang);
    }
  };

  // Prevent hydration mismatch by waiting for client
  if (!mounted) {
    return (
      <BaseI18nProvider initialLanguage={defaultLanguage}>
        {children}
      </BaseI18nProvider>
    );
  }

  return (
    <BaseI18nProvider
      initialLanguage={initialLanguage}
      onLanguageChange={handleLanguageChange}
    >
      {children}
    </BaseI18nProvider>
  );
}
