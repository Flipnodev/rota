export const supportedLanguages = ["en", "no", "sv", "da"] as const;
export type Language = (typeof supportedLanguages)[number];

export const defaultLanguage: Language = "en";

export const namespaces = [
  "common",
  "onboarding",
  "workout",
  "programs",
  "settings",
  "errors",
  "web",
] as const;
export type Namespace = (typeof namespaces)[number];

export const languageNames: Record<Language, string> = {
  en: "English",
  no: "Norsk",
  sv: "Svenska",
  da: "Dansk",
};

export const i18nConfig = {
  supportedLanguages,
  defaultLanguage,
  namespaces,
  languageNames,
  fallbackLng: defaultLanguage,
  defaultNS: "common" as Namespace,
  interpolation: {
    escapeValue: false, // React already escapes values
  },
};
