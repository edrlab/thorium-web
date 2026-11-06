import { getLanguageDisplayName } from "@readium/navigator";

// Labels come from Intl so every BCP 47 tag is covered without locale files
export const getLanguageLabel = (language: string, displayLocale?: string) => {
  const label = getLanguageDisplayName(language, displayLocale);
  // Some locales (e.g. French) return lowercase language names
  return label.charAt(0).toLocaleUpperCase(displayLocale) + label.slice(1);
};
