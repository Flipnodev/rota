"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import i18next from "i18next";
import {
  initReactI18next,
  useTranslation as useI18nextTranslation,
  I18nextProvider,
} from "react-i18next";
import { i18nConfig, Language, defaultLanguage, Namespace } from "./config";

// Import all locale files
import enCommon from "./locales/en/common.json";
import enOnboarding from "./locales/en/onboarding.json";
import enWorkout from "./locales/en/workout.json";
import enPrograms from "./locales/en/programs.json";
import enSettings from "./locales/en/settings.json";
import enErrors from "./locales/en/errors.json";
import enWeb from "./locales/en/web.json";

import noCommon from "./locales/no/common.json";
import noWeb from "./locales/no/web.json";
import svCommon from "./locales/sv/common.json";
import svWeb from "./locales/sv/web.json";
import daCommon from "./locales/da/common.json";
import daWeb from "./locales/da/web.json";

// Resources bundle
const resources = {
  en: {
    common: enCommon,
    onboarding: enOnboarding,
    workout: enWorkout,
    programs: enPrograms,
    settings: enSettings,
    errors: enErrors,
    web: enWeb,
  },
  no: {
    common: noCommon,
    web: noWeb,
  },
  sv: {
    common: svCommon,
    web: svWeb,
  },
  da: {
    common: daCommon,
    web: daWeb,
  },
};

// Initialize i18next instance
let i18nInstance: typeof i18next | null = null;

function getI18nInstance() {
  if (!i18nInstance) {
    i18nInstance = i18next.createInstance();
    i18nInstance.use(initReactI18next).init({
      resources,
      lng: defaultLanguage,
      fallbackLng: i18nConfig.fallbackLng,
      defaultNS: i18nConfig.defaultNS,
      ns: [...i18nConfig.namespaces],
      interpolation: i18nConfig.interpolation,
      react: {
        useSuspense: false,
      },
    });
  }
  return i18nInstance;
}

// Language context for programmatic access
interface LanguageContextValue {
  language: Language;
  setLanguage: (lang: Language) => Promise<void>;
  supportedLanguages: readonly Language[];
  isChanging: boolean;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

interface I18nProviderProps {
  children: React.ReactNode;
  initialLanguage?: Language;
  onLanguageChange?: (lang: Language) => void;
}

export function I18nProvider({
  children,
  initialLanguage,
  onLanguageChange,
}: I18nProviderProps) {
  const i18n = getI18nInstance();
  const [language, setLanguageState] = useState<Language>(
    initialLanguage ?? defaultLanguage
  );
  const [isChanging, setIsChanging] = useState(false);

  useEffect(() => {
    if (initialLanguage && initialLanguage !== i18n.language) {
      i18n.changeLanguage(initialLanguage).then(() => {
        setLanguageState(initialLanguage);
      });
    }
  }, [initialLanguage, i18n]);

  const setLanguage = useCallback(
    async (lang: Language) => {
      if (lang === language) return;

      setIsChanging(true);
      try {
        await i18n.changeLanguage(lang);
        setLanguageState(lang);
        onLanguageChange?.(lang);
      } finally {
        setIsChanging(false);
      }
    },
    [language, i18n, onLanguageChange]
  );

  return (
    <I18nextProvider i18n={i18n}>
      <LanguageContext.Provider
        value={{
          language,
          setLanguage,
          supportedLanguages: i18nConfig.supportedLanguages,
          isChanging,
        }}
      >
        {children}
      </LanguageContext.Provider>
    </I18nextProvider>
  );
}

// Custom hooks
export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within an I18nProvider");
  }
  return context;
}

export function useTranslation(ns?: Namespace | Namespace[]) {
  return useI18nextTranslation(ns);
}

// Export i18n instance getter
export { getI18nInstance };
