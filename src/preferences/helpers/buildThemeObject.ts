import { ThColorScheme } from "@/core/Hooks/useColorScheme";
import { ThemeTokens } from "../hooks/useTheming";

import { validThemeToken } from "./validThemeToken";

export interface buildThemeProps<T extends string> {
  theme?: string;
  themeKeys: { [key in T]?: ThemeTokens },
  systemThemes?: {
    light: T,
    dark: T
  },
  colorScheme?: ThColorScheme;
}

export const buildThemeObject = <T extends string>({
  theme,
  themeKeys,
  systemThemes,
  colorScheme
}: buildThemeProps<T>) => {
  if (!theme) {
    return {};
  }

  if (theme === "auto" && colorScheme && systemThemes) {
    theme = colorScheme === ThColorScheme.dark ? systemThemes.dark : systemThemes.light;
  }

  let themeProps = {};

  const themeToken = themeKeys[theme as T];
  if (themeToken) {
    themeProps = {
      backgroundColor: validThemeToken(themeToken.background),
      textColor: validThemeToken(themeToken.text),
      linkColor: validThemeToken(themeToken.link),
      selectionBackgroundColor: validThemeToken(themeToken.select),
      selectionTextColor: validThemeToken(themeToken.onSelect),
      visitedColor: validThemeToken(themeToken.visited)
    };
  } else {
    // Fallback if theme doesn't exist
    console.warn(`Theme key "${String(theme)}" not found in themeKeys.`);
    themeProps = {
      backgroundColor: null,
      textColor: null,
      linkColor: null,
      selectionBackgroundColor: null,
      selectionTextColor: null,
      visitedColor: null
    };
  }

  return themeProps;
};