"use client";

import { useCallback, useMemo } from "react";

import { BuiltinDecorationStyle, DecorationStyleType, ReadAloudDecorationStyle } from "@readium/navigator";
import { ThReadAlongHighlightPreset, ThReadAlongHighlightThemes } from "@/preferences/preferences";
import {
  ThReadAlongHighlightKeys,
  ThReadAlongHighlightPresetKeys,
  ThReadAlongKeys,
  ThThemeKeys,
  ThReadAlongHighlightColors,
  ThReadAlongHighlightWordColors,
  defaultReadAlongHighlightPresets,
  defaultReadAlongHighlightThemes
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

type EffectiveStyles = Record<HighlightStateKey, ReadAloudDecorationStyle | null>;

type HighlightKind = "fill" | "line" | "text" | "mask";

const getHighlightKind = (style: ReadAloudDecorationStyle | null | undefined): HighlightKind | null => {
  if (!style) return null;
  switch (style.type ?? DecorationStyleType.Highlight) {
    case DecorationStyleType.Highlight:
    case DecorationStyleType.HighlightUnderline:
      return "fill";
    case DecorationStyleType.Underline:
    case DecorationStyleType.Outline:
    case DecorationStyleType.Strikethrough:
      return "line";
    case DecorationStyleType.TextColor:
      return "text";
    case DecorationStyleType.Mask:
      return "mask";
    default:
      return null;
  }
};

// A mask leaves the utterance itself untouched, so the word is on the page
const getWordSurface = (utterance: ReadAloudDecorationStyle | null | undefined): keyof ThReadAlongHighlightWordColors => {
  switch (getHighlightKind(utterance)) {
    case "fill":
      return "onFill";
    case "line":
      return "onLine";
    case "text":
      return "onText";
    default:
      return "onPage";
  }
};

// The word's underline would merge with the utterance's, so it is drawn with a translucent fill
export const isUnderlineOnUnderline = (
  word: ReadAloudDecorationStyle | null | undefined,
  utterance: ReadAloudDecorationStyle | null | undefined
): boolean => {
  return !!word && !!utterance
    && (word as BuiltinDecorationStyle).type === DecorationStyleType.Underline
    && (utterance as BuiltinDecorationStyle).type === DecorationStyleType.Underline;
};

type KeyedPresetKeys = Exclude<ThReadAlongHighlightPresetKeys, ThReadAlongHighlightPresetKeys.none | ThReadAlongHighlightPresetKeys.custom>;

const isSameStyle = (a: ThReadAlongHighlightPreset[ThReadAlongHighlightKeys.utteranceStyle], b: ThReadAlongHighlightPreset[ThReadAlongHighlightKeys.utteranceStyle]) => {
  if (a === false || b === false) return a === b;
  const keys = new Set([...Object.keys(a), ...Object.keys(b)]) as Set<keyof typeof a>;
  return Array.from(keys).every((key) => a[key] === b[key]);
};

/**
 * Hook to apply highlight presets, and resolve styles against the reading theme
 * Styles without a tint take the highlight theme's color for the reading theme,
 * the word's depending on the utterance style it is drawn on.
 * Tints set in a preset or picked by the user are used as-is
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
  const highlightThemes: ThReadAlongHighlightThemes = highlightPrefs?.themes ?? defaultReadAlongHighlightThemes;

  const preset = highlight?.preset ?? ThReadAlongHighlightPresetKeys.sentenceAndWord;

  // Unlike spacing, styles always start from a preset so that the highlight theme colors them
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
  const highlightColors = useMemo((): ThReadAlongHighlightColors | undefined => {
    const storedTheme = profile === "epub" ? (isFXL ? themeObject.fxl : themeObject.reflow) : ThThemeKeys.light;
    const { systemThemes } = preferences.theming.themes;
    const resolvedTheme = storedTheme === "auto" && systemThemes
      ? (colorScheme === ThColorScheme.dark ? systemThemes.dark : systemThemes.light)
      : storedTheme;
    const highlightTheme = highlightThemes.keys[highlightThemes.default];
    return resolvedTheme && highlightTheme ? highlightTheme[resolvedTheme as keyof typeof highlightTheme] : undefined;
  }, [profile, isFXL, themeObject, colorScheme, preferences.theming.themes, highlightThemes]);

  // The word is resolved against the effective utterance it sits on
  const resolveStyle = useCallback((
    key: HighlightStateKey,
    style: ReadAloudDecorationStyle | undefined,
    utterance?: ReadAloudDecorationStyle | null
  ): ReadAloudDecorationStyle | null => {
    if (style === undefined) return null;
    if (style === false) return false;

    // Theme tints are picked for their background and user tints are used as-is
    const builtinStyle: BuiltinDecorationStyle = { ...(style as BuiltinDecorationStyle), enforceContrast: false };

    // Keeps the line color picked for the underline
    const withType = (resolved: BuiltinDecorationStyle): BuiltinDecorationStyle =>
      key === ThReadAlongHighlightKeys.wordStyle && isUnderlineOnUnderline(builtinStyle, utterance)
        ? { ...resolved, type: DecorationStyleType.HighlightUnderline }
        : resolved;

    if (builtinStyle.tint) return withType(builtinStyle);

    const kind = getHighlightKind(builtinStyle);
    if (!highlightColors || !kind) return withType(builtinStyle);

    const themeTint = key === ThReadAlongHighlightKeys.utteranceStyle
      ? highlightColors.utterance[kind]
      : kind === "mask" ? undefined : highlightColors.word[kind][getWordSurface(utterance)];

    return withType(themeTint ? { ...builtinStyle, tint: themeTint } : builtinStyle);
  }, [highlightColors]);

  const resolveStyles = useCallback((values: HighlightStyles): EffectiveStyles => {
    const utterance = resolveStyle(ThReadAlongHighlightKeys.utteranceStyle, values[ThReadAlongHighlightKeys.utteranceStyle]);
    const word = resolveStyle(ThReadAlongHighlightKeys.wordStyle, values[ThReadAlongHighlightKeys.wordStyle], utterance);

    return {
      [ThReadAlongHighlightKeys.utteranceStyle]: utterance,
      [ThReadAlongHighlightKeys.wordStyle]: word
    };
  }, [resolveStyle]);

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
    const effective = resolveStyles(values);

    await submitPreferences({
      [utteranceStylePrefKey]: effective[ThReadAlongHighlightKeys.utteranceStyle],
      [wordStylePrefKey]: effective[ThReadAlongHighlightKeys.wordStyle]
    });
    dispatch(setReadAlongHighlightPreset({ preset: presetKey, values, effective }));
  }, [getPresetValues, resolveStyles, submitPreferences, utteranceStylePrefKey, wordStylePrefKey, dispatch]);

  // Both styles are resolved again, as each one can depend on the other
  const setStyle = useCallback(async (key: HighlightStateKey, value: ReadAloudDecorationStyle) => {
    const baseline = getPresetValues(preset);
    const effective = resolveStyles({ ...baseline, [key]: value });

    await submitPreferences({
      [utteranceStylePrefKey]: effective[ThReadAlongHighlightKeys.utteranceStyle],
      [wordStylePrefKey]: effective[ThReadAlongHighlightKeys.wordStyle]
    });

    // Stored even without presets, so that the styles can be resolved again
    const payload = { value, effective: effective[key], preset, baseline };
    if (key === ThReadAlongHighlightKeys.utteranceStyle) {
      dispatch(setReadAlongUtteranceStyle(payload));
    } else {
      dispatch(setReadAlongWordStyle(payload));
    }
    dispatch(setReadAlongHighlightEffective(effective));
  }, [getPresetValues, resolveStyles, submitPreferences, utteranceStylePrefKey, wordStylePrefKey, preset, dispatch]);

  // Recolors the current styles, keeping the colors the user picked, presets displayed or not
  const applyTheme = useCallback(async () => {
    if (!isLoaded) return;

    const effective = resolveStyles(getPresetValues(preset));

    await submitPreferences({
      [utteranceStylePrefKey]: effective[ThReadAlongHighlightKeys.utteranceStyle],
      [wordStylePrefKey]: effective[ThReadAlongHighlightKeys.wordStyle]
    });
    dispatch(setReadAlongHighlightEffective(effective));
  }, [isLoaded, getPresetValues, preset, resolveStyles, submitPreferences, utteranceStylePrefKey, wordStylePrefKey, dispatch]);

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
