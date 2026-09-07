import type { Metadata } from "next";
import { Inter } from "next/font/google";

import { ThStoreProvider } from "@/lib/ThStoreProvider";
import { ThGlobalPreferencesProvider } from "@/preferences/ThGlobalPreferencesProvider";
import { ThI18nProvider } from "@/i18n/ThI18nProvider";

import "./reset.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Thorium Web",
  description: "Play with the capabilities of the Readium Web Toolkit",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={ inter.className }>
        <ThStoreProvider>
          <ThGlobalPreferencesProvider>
            { /*
              i18next initializes once, here, for the whole app. StatefulReaderWrapper mounts its
              own ThI18nProvider on read routes, but since i18n is a singleton, that second mount
              is a no-op — any `i18n` prop passed to StatefulReaderWrapper in this app would be
              silently ignored. If a route ever needs custom i18n options, pass them here instead.
            */ }
            <ThI18nProvider>
              { children }
            </ThI18nProvider>
          </ThGlobalPreferencesProvider>
        </ThStoreProvider>
      </body>
    </html>
  );
}
