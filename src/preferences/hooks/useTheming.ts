"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { ThBreakpoints, CSSColor } from "../models";

import { BreakpointsMap, useBreakpoints } from "@/core/Hooks/useBreakpoints";
import { useReducedMotion } from "@/core/Hooks/useReducedMotion";
import { useReducedTransparency } from "@/core/Hooks/useReducedTransparency";
import { ThColorScheme, useColorScheme } from "@/core/Hooks/useColorScheme";
import { ThContrast, useContrast } from "@/core/Hooks/useContrast";
import { useForcedColors } from "@/core/Hooks/useForcedColors";
import { useMonochrome } from "@/core/Hooks/useMonochrome";

import { propsToCSSVars } from "@/core/Helpers/propsToCSSVars";
import { prefixString } from "@/core/Helpers/prefixString";
import { extractThemeFromImage } from "../helpers/themeGeneration";
import { proxyUrl } from "@/helpers/proxyUrl";
import { useContainerBreakpoints } from "@/core/Hooks/useContainerBreakpoints";

export interface ThemeTokens {
  background: CSSColor;
  text: CSSColor;
  link: CSSColor;
  visited: CSSColor;
  subdue: CSSColor;
  disable: CSSColor;
  hover: CSSColor;
  onHover: CSSColor;
  select: CSSColor;
  onSelect: CSSColor;
  focus: CSSColor;
  elevate: string;
  immerse: string;
}

export interface useThemingProps<T extends string> {
  theme?: string;
  themeKeys: { [key in T]?: ThemeTokens };
  systemKeys?: {
    light: T;
    dark: T;
  };
  breakpointsMap: BreakpointsMap<number | null>;
  initProps?: Record<string, any>;
  coverUrl?: string;
  autoThemeSource?: "cover" | "system";
  onCoverThemeGenerated?: (themeTokens: ThemeTokens) => void;
  onBreakpointChange?: (breakpoint: ThBreakpoints | null) => void;
  onColorSchemeChange?: (colorScheme: ThColorScheme) => void;
  onContrastChange?: (contrast: ThContrast) => void;
  onForcedColorsChange?: (forcedColors: boolean) => void;
  onMonochromeChange?: (isMonochrome: boolean) => void;
  onReducedMotionChange?: (reducedMotion: boolean) => void;
  onReducedTransparencyChange?: (reducedTransparency: boolean) => void;
  onContainerBreakpointChange?: (breakpoint: ThBreakpoints | null) => void;
}

// Takes care of the init of theming and side effects on :root/html
// Reader still has to handle the side effects on Navigator
export const useTheming = <T extends string>({
  theme,
  systemKeys,
  themeKeys,
  breakpointsMap,
  initProps,
  coverUrl,
  autoThemeSource,
  onBreakpointChange,
  onColorSchemeChange,
  onContrastChange,
  onForcedColorsChange,
  onMonochromeChange,
  onReducedMotionChange,
  onReducedTransparencyChange,
  onCoverThemeGenerated,
  onContainerBreakpointChange,
}: useThemingProps<T>) => {
  const [coverThemeTokens, setCoverThemeTokens] = useState<ThemeTokens | null>(null);
  const [coverThemeFailed, setCoverThemeFailed] = useState(false);
  
  const breakpoints = useBreakpoints(breakpointsMap, onBreakpointChange);
  const setContainerRef = useContainerBreakpoints(breakpointsMap, onContainerBreakpointChange);
  const colorScheme = useColorScheme(onColorSchemeChange);
  const colorSchemeRef = useRef(colorScheme);
  const contrast = useContrast(onContrastChange);
  const forcedColors = useForcedColors(onForcedColorsChange);
  const monochrome = useMonochrome(onMonochromeChange);
  const reducedMotion = useReducedMotion(onReducedMotionChange);
  const reducedTransparency = useReducedTransparency(onReducedTransparencyChange);
  
  // Extract theme from cover when needed
  useEffect(() => {
    if (autoThemeSource === "cover" && coverUrl && !coverThemeTokens) {
      const extractTheme = async () => {
        try {
          const themeTokens = await extractThemeFromImage(proxyUrl(coverUrl) ?? coverUrl);
          setCoverThemeTokens(themeTokens);
          onCoverThemeGenerated?.(themeTokens);
        } catch (error) {
          console.warn("Failed to extract cover theme:", error);
          setCoverThemeFailed(true);
        }
      };
      
      extractTheme();
    }
  }, [autoThemeSource, coverUrl, coverThemeTokens, onCoverThemeGenerated]);

  const updateThemeColorMetaTag = useCallback((color: string): void => {
    if (typeof document === "undefined") return;
    
    let metaTag = document.querySelector("meta[name='theme-color']");
    if (!metaTag) {
      metaTag = document.createElement("meta");
      metaTag.setAttribute("name", "theme-color");
      document.head.appendChild(metaTag);
    }
    metaTag.setAttribute("content", color);
  }, []);

  const initThemingCustomProps = useCallback(() => {
    for (let p in initProps) {
      document.documentElement.style.setProperty(p, initProps[p])
    }
  }, [initProps]);

  const inferThemeAuto = useCallback(() => {
    if (autoThemeSource === "cover") {
      if (coverThemeTokens) return "cover" as T;
      // Only hold while actively fetching; no URL or fetch failed → fall through to system
      if (!coverThemeFailed && coverUrl) return undefined;
    }
    // Default behavior: use colorScheme (system)
    return colorSchemeRef.current === ThColorScheme.dark ? systemKeys?.dark : systemKeys?.light;
  }, [systemKeys, autoThemeSource, coverThemeTokens, coverThemeFailed, coverUrl]);

  const setThemeCustomProps = useCallback((t?: string) => {
    if (!t) {
      return;
    }

    if (t === "auto") {
      const autoTheme = inferThemeAuto();
      if (!autoTheme) {
        // We are not removing properties cos iframes won't update
        // Removing here would consequently create a theme inconsistency
        // between the iframe and the main window
        return;
      }
      t = autoTheme;
    }
  
    let themeTokens: ThemeTokens | undefined;
    
    if (t === "cover" && coverThemeTokens) {
      // Use the generated cover theme tokens
      themeTokens = coverThemeTokens;
    } else {
      // Use predefined theme keys
      themeTokens = themeKeys[t as T];
    }
    
    if (!themeTokens) {
      // We are not removing properties cos iframes won't update
      // Removing here would consequently create a theme inconsistency
      // between the iframe and the main window
      return;
    }
  
    const props = propsToCSSVars(themeTokens, { prefix: prefixString("theme") });
      
    for (let p in props) {
      document.documentElement.style.setProperty(p, props[p])
    }

    updateThemeColorMetaTag(themeTokens.background);
  }, [inferThemeAuto, updateThemeColorMetaTag, themeKeys, coverThemeTokens]);

  // On mount add custom props to :root/html
  useEffect(() => {
    initThemingCustomProps();
  }, [initThemingCustomProps]);

  // Update theme custom props
  useEffect(() => {
    colorSchemeRef.current = colorScheme;
    setThemeCustomProps(theme);
  }, [setThemeCustomProps, theme, colorScheme]);

  // Apply cover theme as soon as tokens are available
  useEffect(() => {
    if (!coverThemeTokens || theme !== "auto") return;
    const props = propsToCSSVars(coverThemeTokens, { prefix: prefixString("theme") });
    for (let p in props) {
      document.documentElement.style.setProperty(p, props[p]);
    }
    updateThemeColorMetaTag(coverThemeTokens.background);
  }, [coverThemeTokens, theme, updateThemeColorMetaTag]);

  const themeResolved = autoThemeSource !== "cover" || !coverUrl || !!coverThemeTokens || coverThemeFailed;

  return {
    inferThemeAuto,
    theme,
    breakpoints,
    colorScheme,
    contrast,
    forcedColors,
    monochrome,
    reducedMotion,
    reducedTransparency,
    coverThemeTokens,
    themeResolved,
    setContainerRef
  }
}
