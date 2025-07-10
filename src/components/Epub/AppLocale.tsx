"use client";

import React, { createContext, useContext, ReactNode } from 'react';

// Import locale files
import en from '../../resources/locales/en.json';
import pl from '../../resources/locales/pl.json';

interface AppLocaleContextType {
  locale: string;
  translations: typeof en;
}

const AppLocaleContext = createContext<AppLocaleContextType | undefined>(undefined);

interface AppLocaleProps {
  locale?: string;
  children: ReactNode;
}

export const AppLocale: React.FC<AppLocaleProps> = ({ locale, children }) => {

  const { currentLocale, translations } = (() => {
    switch (locale) {
      case 'pl':
      case 'PL':
        return { currentLocale: 'pl', translations: pl };
      default:
        return { currentLocale: 'en', translations: en };
    }
  })();

  const value: AppLocaleContextType = {
    locale: currentLocale,
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
