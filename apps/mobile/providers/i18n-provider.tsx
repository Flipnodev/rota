import { useEffect, useState } from "react";
import * as Localization from "expo-localization";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  I18nProvider as BaseI18nProvider,
  Language,
  supportedLanguages,
  defaultLanguage,
} from "@rota/i18n";

const LANGUAGE_STORAGE_KEY = "@rota/language";

interface MobileI18nProviderProps {
  children: React.ReactNode;
}

export function MobileI18nProvider({ children }: MobileI18nProviderProps) {
  const [initialLanguage, setInitialLanguage] = useState<Language | undefined>(
    undefined
  );
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    async function loadLanguage() {
      try {
        // First, check if user has manually selected a language
        const storedLanguage = await AsyncStorage.getItem(LANGUAGE_STORAGE_KEY);

        if (
          storedLanguage &&
          supportedLanguages.includes(storedLanguage as Language)
        ) {
          setInitialLanguage(storedLanguage as Language);
        } else {
          // Otherwise, detect device locale
          const deviceLocale = Localization.getLocales()[0]?.languageCode;

          if (
            deviceLocale &&
            supportedLanguages.includes(deviceLocale as Language)
          ) {
            setInitialLanguage(deviceLocale as Language);
          } else {
            setInitialLanguage(defaultLanguage);
          }
        }
      } catch (error) {
        console.warn("Failed to load language preference:", error);
        setInitialLanguage(defaultLanguage);
      } finally {
        setIsReady(true);
      }
    }

    loadLanguage();
  }, []);

  const handleLanguageChange = async (lang: Language) => {
    try {
      await AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, lang);
    } catch (error) {
      console.warn("Failed to save language preference:", error);
    }
  };

  // Don't render until we've determined the language
  if (!isReady) {
    return null;
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
