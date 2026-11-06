/**
 * List of supported locales in the application.
 * These locales are used for i18n configuration and language selection.
 */
export const supportedLocales = ["ar","da", "en", "es", "et", "fi", "fr", "it", "lt", "pl", "pt-BR", "pt-PT", "sv", "ta"] as const;

export type SupportedLocale = typeof supportedLocales[number];

/**
 * Type guard to check if a string is a supported locale
 * @param locale The locale string to check
 * @returns boolean indicating if the locale is supported
 */
export function isSupportedLocale(locale: string): locale is SupportedLocale {
  return supportedLocales.includes(locale as SupportedLocale);
}
