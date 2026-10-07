"use client";

import { useCallback, useMemo } from "react";

import { BuiltinDecorationStyle, DecorationStyleType, ReadAloudDecorationStyle } from "@readium/navigator";
import {
  ThReadAlongHighlightKeys,
  ThReadAlongHighlightPresetKeys,
  ThReadAlongKeys,
  ThThemeKeys,
  defaultReadAlongHighlightPresets
} from "@/preferences/models";
import { ThColorScheme } from "@/core/Hooks/useColorScheme";

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

/**
 * Hook to apply highlight presets, and resolve styles against the reading theme
 * Presets only set which styles apply, their tints come from the reading theme
 * unless the user picked a color, which is used as-is
 */
export const useHighlightPresets = () => {
  const { preferences } = usePreferences();
  const { isLoaded, submitPreferences } = useReadAloudNavigator();

  const profile = useAppSelector(state => state.reader.profile);
  const isFXL = useAppSelector(state => state.publication.isFXL);
  const themeObject = useAppSelector(state => state.theming.theme);
  const colorScheme = useAppSelector(state => state.theming.colorScheme);
  const highlight = useAppSelector(state => state.readAlongSettings.highlight);

  const dispatch = useAppDispatch();

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

  const presetKeys = useMemo(() => {
    return hasCustomizableStyles
      ? presets.order
      : presets.order.filter(key => key !== ThReadAlongHighlightPresetKeys.custom);
  }, [presets.order, hasCustomizableStyles]);

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

    const presetValues = presets.keys[presetKey];
    if (!presetValues) return {};

    const toStyle = (type: DecorationStyleType | false): ReadAloudDecorationStyle => type === false ? false : { type };

    return {
      [ThReadAlongHighlightKeys.utteranceStyle]: toStyle(presetValues[ThReadAlongHighlightKeys.utteranceStyle]),
      [ThReadAlongHighlightKeys.wordStyle]: toStyle(presetValues[ThReadAlongHighlightKeys.wordStyle])
    };
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

    await submitPreferences(effective);
    dispatch(setReadAlongHighlightPreset({ preset: presetKey, values, effective }));
  }, [getPresetValues, resolveStyle, submitPreferences, dispatch]);

  const setStyle = useCallback(async (key: HighlightStateKey, value: ReadAloudDecorationStyle) => {
    const effective = resolveStyle(key, value);
    await submitPreferences({ [key]: effective });

    const payload = { value, effective, preset: shouldApplyPresets ? preset : undefined };
    if (key === ThReadAlongHighlightKeys.utteranceStyle) {
      dispatch(setReadAlongUtteranceStyle(payload));
    } else {
      dispatch(setReadAlongWordStyle(payload));
    }
  }, [resolveStyle, submitPreferences, shouldApplyPresets, preset, dispatch]);

  // Recolors the current styles, keeping the colors the user picked
  const applyTheme = useCallback(async () => {
    if (!isLoaded || !shouldApplyPresets) return;

    const values = getPresetValues(preset);
    const effective = {
      [ThReadAlongHighlightKeys.utteranceStyle]: resolveStyle(ThReadAlongHighlightKeys.utteranceStyle, values[ThReadAlongHighlightKeys.utteranceStyle]),
      [ThReadAlongHighlightKeys.wordStyle]: resolveStyle(ThReadAlongHighlightKeys.wordStyle, values[ThReadAlongHighlightKeys.wordStyle])
    };

    await submitPreferences(effective);
    dispatch(setReadAlongHighlightEffective(effective));
  }, [isLoaded, shouldApplyPresets, getPresetValues, preset, resolveStyle, submitPreferences, dispatch]);

  return {
    preset,
    presetKeys,
    shouldApplyPresets,
    getStoredStyle,
    applyPreset,
    setStyle,
    applyTheme
  };
};
