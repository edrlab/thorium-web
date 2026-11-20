import { isSupportedLocale, supportedLocales } from "@/i18n/supported-locales";

export interface ThGlobalPreferences {
  locale?: string;
}

export const createGlobalPreferences = (params: ThGlobalPreferences): ThGlobalPreferences => {
  if (params.locale) {
    const languageCode = params.locale.split("-")[0];
    if (!isSupportedLocale(params.locale) && !isSupportedLocale(languageCode)) {
      console.warn(`Locale "${ params.locale }" is not supported. Supported locales: ${ supportedLocales.join(", ") }. Falling back to browser/OS language settings.`);
      return { ...params, locale: undefined };
    }
  }
  return params;
};
