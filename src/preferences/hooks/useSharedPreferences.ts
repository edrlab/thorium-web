"use client";

import { useContext } from "react";
import { ThIconPref, ThLayoutDefaultsPref, ThShortcutsPref } from "../preferences";
import { ThAudioPreferencesContext } from "../ThAudioPreferencesContext";
import { ThPreferencesContext } from "../ThPreferencesContext";
import { ThBackLinkPref, ThDockingKeys, ThDockingPref } from "../models";
import { ThemeTokens } from "./useTheming";
import { BreakpointsMap } from "@/core/Hooks/useBreakpoints";

export interface SharedPreferences {
  shortcuts: ThShortcutsPref;
  docking: ThDockingPref<ThDockingKeys>;
  theming: {
    icon: ThIconPref;
    header?: {
      backLink?: ThBackLinkPref | null;
    };
    themes: {
      systemThemes?: { light: string; dark: string };
      keys: Record<string, ThemeTokens>;
      audioOrder?: Array<string>;
      reflowOrder?: Array<string>;
      fxlOrder?: Array<string>;
    };
    layout: {
      defaults: ThLayoutDefaultsPref;
    };
    breakpoints: BreakpointsMap<number | null>;
  };
}

/**
 * Resolves preference values that are shared across both provider trees
 * (audio and reader). Both providers expose these fields — this hook picks
 * the active one so callers never need to touch the contexts directly.
 */
export const useSharedPreferences = (): SharedPreferences => {
  const audioCtx = useContext(ThAudioPreferencesContext);
  const readerCtx = useContext(ThPreferencesContext);

  const ctx = audioCtx ?? readerCtx;

  if (!ctx) throw new Error("useSharedPreferences must be used within a ThPreferencesProvider or ThAudioPreferencesProvider");

  const prefs = ctx.preferences;

  return {
    shortcuts: prefs.shortcuts,
    docking: prefs.docking,
    theming: {
      icon: prefs.theming.icon,
      header: prefs.theming.header
        ? { backLink: prefs.theming.header.backLink }
        : undefined,
      themes: {
        systemThemes: prefs.theming.themes.systemThemes as { light: string; dark: string } | undefined,
        keys: prefs.theming.themes.keys as Record<string, ThemeTokens>,
        audioOrder: audioCtx?.preferences.theming.themes.audioOrder as Array<string> | undefined,
        reflowOrder: readerCtx?.preferences.theming.themes.reflowOrder as Array<string> | undefined,
        fxlOrder: readerCtx?.preferences.theming.themes.fxlOrder as Array<string> | undefined,
      },
      layout: {
        defaults: prefs.theming.layout.defaults,
      },
      breakpoints: prefs.theming.breakpoints,
    },
  };
};
