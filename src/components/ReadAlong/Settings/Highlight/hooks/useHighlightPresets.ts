"use client";

import { useCallback, useMemo } from "react";

import { BuiltinDecorationStyle, DecorationStyleType, ReadAloudDecorationStyle } from "@readium/navigator";
import {
  ThReadAlongHighlightKeys,
  ThReadAlongHighlightPreset,
  ThReadAlongHighlightPresetKeys,
  ThReadAlongKeys,
  ThThemeKeys,
  defaultReadAlongHighlightPresets
} from "@/preferences/models";
import { ThColorScheme } from "@/core/Hooks/useColorScheme";
import { getPreferenceKey } from "../../../../Settings/helpers/settingsKeyMapping";

import { usePreferences } from "@/preferences/hooks/usePreferences";
import { useReadAloudNavigator } from "@/core/Hooks/ReadAloud/useReadAloudNavigator";

import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import {
  HighlightStateKey,
  setReadAlongHighlightEffective,
  setReadAlongHighlightPreset,
  setReadAlongUtteranceStyle,
  setReadAlongWordStyle
} from "@/lib/readAlongSettingsReducer";

type HighlightStyles = Partial<Record<HighlightStateKey, ReadAloudDecorationStyle>>;

type KeyedPresetKeys = Exclude<ThReadAlongHighlightPresetKeys, ThReadAlongHighlightPresetKeys.none | ThReadAlongHighlightPresetKeys.custom>;

const isSameStyle = (a: ThReadAlongHighlightPreset[ThReadAlongHighlightKeys.utteranceStyle], b: ThReadAlongHighlightPreset[ThReadAlongHighlightKeys.utteranceStyle]) => {
  if (a === false || b === false) return a === b;
  const keys = new Set([...Object.keys(a), ...Object.keys(b)]) as Set<keyof typeof a>;
  return Array.from(keys).every((key) => a[key] === b[key]);
};

/**
 * Hook to apply highlight presets, and resolve styles against the reading theme
 * Styles without a tint take the reading theme's, tints set in a preset
 * or picked by the user are used as-is
 */
export const useHighlightPresets = () => {
  const { preferences } = usePreferences();
  const { isLoaded, submitPreferences } = useReadAloudNavigator();

  const profile = useAppSelector(state => state.reader.profile);
  const isFXL = useAppSelector(state => state.publication.isFXL);
  const themeObject = useAppSelector(state => state.theming.theme);
  const colorScheme = useAppSelector(state => state.theming.colorScheme);
  const highlight = useAppSelector(state => state.readAlongSettings.highlight);
  const anyVoiceHasBoundaries = useAppSelector(state => state.readAlongPlayer.anyVoiceHasBoundaries);

  const dispatch = useAppDispatch();

  const utteranceStylePrefKey = getPreferenceKey(ThReadAlongKeys.utteranceStyle, "readAlong");
  const wordStylePrefKey = getPreferenceKey(ThReadAlongKeys.wordStyle, "readAlong");

  const highlightPrefs = preferences.readAlong.settings.highlight;
  const presets = highlightPrefs?.presets ?? defaultReadAlongHighlightPresets;

  const preset = highlight?.preset ?? ThReadAlongHighlightPresetKeys.sentenceAndWord;

  // Presets only apply when their component is displayed, like spacing presets
  const shouldApplyPresets = useMemo(() => {
    if (!preferences.readAlong.settings.order.includes(ThReadAlongKeys.highlightGroup)) return false;
    const groupKeys = [...(highlightPrefs?.main ?? []), ...(highlightPrefs?.subPanel ?? [])];
    return groupKeys.includes(ThReadAlongHighlightKeys.highlightPresets);
  }, [preferences.readAlong.settings.order, highlightPrefs]);

  const hasCustomizableStyles = useMemo(() => {
    const subPanel = highlightPrefs?.subPanel ?? [];
    return subPanel.includes(ThReadAlongHighlightKeys.utteranceStyle) || subPanel.includes(ThReadAlongHighlightKeys.wordStyle);
  }, [highlightPrefs]);

  // Presets that highlight nothing or match another one without the word, mapped to that one if any
  const wordPresetFallbacks = useMemo(() => {
    const fallbacks = new Map<ThReadAlongHighlightPresetKeys, ThReadAlongHighlightPresetKeys | null>();

    presets.order.forEach((key) => {
      const values = presets.keys[key as KeyedPresetKeys];
      if (!values || values[ThReadAlongHighlightKeys.wordStyle] === false) return;

      const utteranceStyle = values[ThReadAlongHighlightKeys.utteranceStyle];
      const match = presets.order.find((other) => {
        if (other === key || other === ThReadAlongHighlightPresetKeys.custom) return false;
        if (other === ThReadAlongHighlightPresetKeys.none) return utteranceStyle === false;
        const otherValues = presets.keys[other as KeyedPresetKeys];
        return !!otherValues
          && otherValues[ThReadAlongHighlightKeys.wordStyle] === false
          && isSameStyle(otherValues[ThReadAlongHighlightKeys.utteranceStyle], utteranceStyle);
      });

      if (match || utteranceStyle === false) {
        fallbacks.set(key, match ?? null);
      }
    });

    return fallbacks;
  }, [presets.order, presets.keys]);

  const requiresWordBoundaries = useCallback((key: ThReadAlongHighlightPresetKeys) => {
    return wordPresetFallbacks.has(key);
  }, [wordPresetFallbacks]);

  const presetKeys = useMemo(() => {
    return presets.order.filter((key) => {
      if (key === ThReadAlongHighlightPresetKeys.custom) return hasCustomizableStyles;
      return anyVoiceHasBoundaries !== false || !wordPresetFallbacks.has(key);
    });
  }, [presets.order, hasCustomizableStyles, anyVoiceHasBoundaries, wordPresetFallbacks]);

  // A hidden preset shows as the one it matches without the word
  const displayedPreset = anyVoiceHasBoundaries === false && wordPresetFallbacks.has(preset)
    ? wordPresetFallbacks.get(preset) ?? null
    : preset;

  // Same resolution as the reader's theme, auto following the color scheme
  const themeTokens = useMemo(() => {
    const storedTheme = profile === "epub" ? (isFXL ? themeObject.fxl : themeObject.reflow) : ThThemeKeys.light;
    const { systemThemes, keys } = preferences.theming.themes;
    const resolvedTheme = storedTheme === "auto" && systemThemes
      ? (colorScheme === ThColorScheme.dark ? systemThemes.dark : systemThemes.light)
      : storedTheme;
    return resolvedTheme ? keys[resolvedTheme as keyof typeof keys] : undefined;
  }, [profile, isFXL, themeObject, colorScheme, preferences.theming.themes]);

  const resolveStyle = useCallback((key: HighlightStateKey, style: ReadAloudDecorationStyle | undefined): ReadAloudDecorationStyle | null => {
    if (style === undefined) return null;
    if (style === false) return false;

    // Theme tints are picked for their background and user tints are used as-is
    const builtinStyle: BuiltinDecorationStyle = { ...(style as BuiltinDecorationStyle), enforceContrast: false };
    if (builtinStyle.tint) return builtinStyle;

    const themeTint = key === ThReadAlongHighlightKeys.wordStyle
      ? themeTokens?.readAlongWord
      : builtinStyle.type === DecorationStyleType.Mask
        ? themeTokens?.readAlongMask
        : themeTokens?.readAlongUtterance;

    return themeTint ? { ...builtinStyle, tint: themeTint } : builtinStyle;
  }, [themeTokens]);

  const getPresetValues = useCallback((presetKey: ThReadAlongHighlightPresetKeys): HighlightStyles => {
    if (presetKey === ThReadAlongHighlightPresetKeys.custom) {
      return highlight?.custom ?? {};
    }

    if (presetKey === ThReadAlongHighlightPresetKeys.none) {
      return {
        [ThReadAlongHighlightKeys.utteranceStyle]: false,
        [ThReadAlongHighlightKeys.wordStyle]: false
      };
    }

    return presets.keys[presetKey] ?? {};
  }, [presets.keys, highlight?.custom]);

  // The style as stored, without the theme tint, for the advanced controls
  const getStoredStyle = useCallback((key: HighlightStateKey): ReadAloudDecorationStyle | undefined => {
    return getPresetValues(preset)[key];
  }, [getPresetValues, preset]);

  const applyPreset = useCallback(async (presetKey: ThReadAlongHighlightPresetKeys) => {
    const values = getPresetValues(presetKey);
    const effective = {
      [ThReadAlongHighlightKeys.utteranceStyle]: resolveStyle(ThReadAlongHighlightKeys.utteranceStyle, values[ThReadAlongHighlightKeys.utteranceStyle]),
      [ThReadAlongHighlightKeys.wordStyle]: resolveStyle(ThReadAlongHighlightKeys.wordStyle, values[ThReadAlongHighlightKeys.wordStyle])
    };

    await submitPreferences({
      [utteranceStylePrefKey]: effective[ThReadAlongHighlightKeys.utteranceStyle],
      [wordStylePrefKey]: effective[ThReadAlongHighlightKeys.wordStyle]
    });
    dispatch(setReadAlongHighlightPreset({ preset: presetKey, values, effective }));
  }, [getPresetValues, resolveStyle, submitPreferences, utteranceStylePrefKey, wordStylePrefKey, dispatch]);

  const setStyle = useCallback(async (key: HighlightStateKey, value: ReadAloudDecorationStyle) => {
    const effective = resolveStyle(key, value);
    const isUtterance = key === ThReadAlongHighlightKeys.utteranceStyle;
    await submitPreferences({ [isUtterance ? utteranceStylePrefKey : wordStylePrefKey]: effective });

    const payload = { value, effective, preset: shouldApplyPresets ? preset : undefined };
    if (isUtterance) {
      dispatch(setReadAlongUtteranceStyle(payload));
    } else {
      dispatch(setReadAlongWordStyle(payload));
    }
  }, [resolveStyle, submitPreferences, utteranceStylePrefKey, wordStylePrefKey, shouldApplyPresets, preset, dispatch]);

  // Recolors the current styles, keeping the colors the user picked
  const applyTheme = useCallback(async () => {
    if (!isLoaded || !shouldApplyPresets) return;

    const values = getPresetValues(preset);
    const effective = {
      [ThReadAlongHighlightKeys.utteranceStyle]: resolveStyle(ThReadAlongHighlightKeys.utteranceStyle, values[ThReadAlongHighlightKeys.utteranceStyle]),
      [ThReadAlongHighlightKeys.wordStyle]: resolveStyle(ThReadAlongHighlightKeys.wordStyle, values[ThReadAlongHighlightKeys.wordStyle])
    };

    await submitPreferences({
      [utteranceStylePrefKey]: effective[ThReadAlongHighlightKeys.utteranceStyle],
      [wordStylePrefKey]: effective[ThReadAlongHighlightKeys.wordStyle]
    });
    dispatch(setReadAlongHighlightEffective(effective));
  }, [isLoaded, shouldApplyPresets, getPresetValues, preset, resolveStyle, submitPreferences, utteranceStylePrefKey, wordStylePrefKey, dispatch]);

  return {
    preset,
    displayedPreset,
    presetKeys,
    requiresWordBoundaries,
    shouldApplyPresets,
    getStoredStyle,
    applyPreset,
    setStyle,
    applyTheme
  };
};
