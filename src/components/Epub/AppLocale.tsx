"use client";

import React, { createContext, useContext, ReactNode } from 'react';

// Import locale files
import en from '../../resources/locales/en.json';
import pl from '../../resources/locales/pl.json';

type SupportedLocale = 'en' | 'pl';

interface AppLocaleContextType {
  locale: SupportedLocale;
  translations: typeof en;
}

const AppLocaleContext = createContext<AppLocaleContextType | undefined>(undefined);

interface AppLocaleProps {
  locale: SupportedLocale;
  children: ReactNode;
}

export const AppLocale: React.FC<AppLocaleProps> = ({ locale, children }) => {
  const getTranslations = (locale: SupportedLocale) => {
    switch (locale) {
      case 'pl':
        return pl;
      case 'en':
      default:
        return en;
    }
  };

  const translations = getTranslations(locale);

  const value: AppLocaleContextType = {
    locale,
    translations
  };

  return (
    <AppLocaleContext.Provider value={value}>
      {children}
    </AppLocaleContext.Provider>
  );
};

export const useLocale = () => {
  const context = useContext(AppLocaleContext);
  if (context === undefined) {
    throw new Error('useLocale must be used within an AppLocale provider');
  }
  return context.translations;
};
