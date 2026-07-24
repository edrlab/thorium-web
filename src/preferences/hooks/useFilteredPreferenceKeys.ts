"use client";

import { useMemo } from "react";

import { ScriptMode, RCSSSettingsEntry } from "@readium/navigator";
import { useAppSelector } from "@/lib/hooks";
import {
  ThSettingsKeys,
  ThTextSettingsKeys,
  ThSpacingSettingsKeys
} from "@/preferences/models";
import { usePreferenceKeys } from "./usePreferenceKeys";
import ReadiumCSSSettings from "@readium/css/css/vars/settings.json";

// Translates ReadiumCSS property names to ThSettingsKeys.
// colCount is intentionally omitted — it's handled separately with the !isFXL guard below.
const READIUM_CSS_TO_SETTINGS_KEY: Record<string, string | undefined> = {
  bodyHyphens: ThTextSettingsKeys.hyphens,
  a11yNormalize: ThTextSettingsKeys.textNormalize,
  letterSpacing: ThSpacingSettingsKeys.letterSpacing,
  textAlign: ThTextSettingsKeys.textAlign,
  paraIndent: ThSpacingSettingsKeys.paragraphIndent,
  wordSpacing: ThSpacingSettingsKeys.wordSpacing,
  ligatures: ThTextSettingsKeys.ligatures,
  noRuby: ThTextSettingsKeys.noRuby
};

// Keys appearing in any mode's `added` are mode-specific — they should be excluded
// from every mode that does not explicitly list them in `added`.
const globallyAdded = new Set(
  Object.values(ReadiumCSSSettings).flatMap(entry => entry.added)
);

const deriveExcluded = (entry: RCSSSettingsEntry): string[] => {
  const fromDisabled = entry.disabled
    .map(k => READIUM_CSS_TO_SETTINGS_KEY[k])
    .filter((k): k is string => k !== undefined);

  const fromAddedInversion = [...globallyAdded]
    .filter(k => !entry.added.includes(k))
    .map(k => READIUM_CSS_TO_SETTINGS_KEY[k])
    .filter((k): k is string => k !== undefined);

  return [...fromDisabled, ...fromAddedInversion];
};

// ThSettingsKeys.layout is excluded for vertical modes but is not tracked in the JSON.
const CJK_VERTICAL_EXCLUDED = [...deriveExcluded(ReadiumCSSSettings["cjk-vertical"]), ThSettingsKeys.layout];

// Keys that are not applicable for each script mode and should be hidden from settings UI.
// Derived from @readium/css settings.json; mongolian-vertical follows cjk-vertical.
const EXCLUDED_BY_SCRIPT_MODE: Record<ScriptMode, string[]> = {
  "ltr":              deriveExcluded(ReadiumCSSSettings["ltr"]),
  "rtl":              deriveExcluded(ReadiumCSSSettings["rtl"]),
  "cjk-horizontal":   deriveExcluded(ReadiumCSSSettings["cjk-horizontal"]),
  "cjk-vertical":       CJK_VERTICAL_EXCLUDED,
  "mongolian-vertical": CJK_VERTICAL_EXCLUDED,
};

/**
 * Wraps usePreferenceKeys and filters out settings keys that are not applicable
 * for the current publication's script mode (RTL, CJK-horizontal, CJK-vertical).
 * Drop-in replacement for usePreferenceKeys at all call sites.
 */
export const useFilteredPreferenceKeys = () => {
  const keys = usePreferenceKeys();
  const scriptMode = useAppSelector(state => state.publication.scriptMode);
  const isFXL = useAppSelector(state => state.publication.isFXL);

  return useMemo(() => {
    const excluded = [
      ...(EXCLUDED_BY_SCRIPT_MODE[scriptMode] ?? []),
      ...((scriptMode === "cjk-vertical" || scriptMode === "mongolian-vertical") && !isFXL
        ? [ThSettingsKeys.columns]
        : []),
    ];
    if (excluded.length === 0) return keys;

    const filter = <T extends string>(arr: T[]): T[] =>
      arr.filter(k => !excluded.includes(k));

    return {
      ...keys,
      reflowSettingsKeys: filter(keys.reflowSettingsKeys),
      fxlSettingsKeys: filter(keys.fxlSettingsKeys),
      webPubSettingsKeys: filter(keys.webPubSettingsKeys),
      mainTextSettingsKeys: filter(keys.mainTextSettingsKeys),
      subPanelTextSettingsKeys: filter(keys.subPanelTextSettingsKeys),
      mainSpacingSettingsKeys: filter(keys.mainSpacingSettingsKeys),
      subPanelSpacingSettingsKeys: filter(keys.subPanelSpacingSettingsKeys),
    };
  }, [keys, scriptMode, isFXL]);
};
