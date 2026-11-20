import { ThAudioKeys, ThReadAlongKeys, ThSettingsKeys } from "@/preferences/models";
import { ThSettingsStorageStrategies, ThSettingsStorageStrategy } from "../settingsStorageStrategies";
import { ThemeStateObject } from "../themeReducer";
import { RootState } from "../store";

export type SettingsSlice = "settings" | "webPubSettings" | "divinaSettings" | "audioSettings" | "readAlongSettings";

export type SettingsScope = keyof ThSettingsStorageStrategies;

export type ThemeKey = keyof ThemeStateObject;

export const SETTINGS_SLICES: SettingsSlice[] = ["settings", "webPubSettings", "divinaSettings", "audioSettings", "readAlongSettings"];

// The scopes each slice is used in, reflowable and fixed-layout EPUB sharing one
const SLICE_SCOPES: Record<SettingsSlice, SettingsScope[]> = {
  settings: ["reflow", "fxl"],
  webPubSettings: ["webPub"],
  divinaSettings: ["divina"],
  audioSettings: ["audio"],
  readAlongSettings: ["readAlong"]
};

const SHARED_READER_FIELDS = {
  fontFamily: ThSettingsKeys.fontFamily,
  fontWeight: ThSettingsKeys.fontWeight,
  hyphens: ThSettingsKeys.hyphens,
  letterSpacing: ThSettingsKeys.letterSpacing,
  ligatures: ThSettingsKeys.ligatures,
  lineHeight: ThSettingsKeys.lineHeight,
  noRuby: ThSettingsKeys.noRuby,
  paragraphIndent: ThSettingsKeys.paragraphIndent,
  paragraphSpacing: ThSettingsKeys.paragraphSpacing,
  publisherStyles: ThSettingsKeys.publisherStyles,
  spacing: ThSettingsKeys.spacingPresets,
  textAlign: ThSettingsKeys.textAlign,
  textNormalization: ThSettingsKeys.textNormalize,
  wordSpacing: ThSettingsKeys.wordSpacing
} as const;

// The setting each stored field belongs to, fields without one are global
const FIELD_SETTINGS: { [S in SettingsSlice]: Partial<Record<keyof RootState[S], string>> } = {
  settings: {
    ...SHARED_READER_FIELDS,
    columnCount: ThSettingsKeys.columns,
    fontSize: ThSettingsKeys.zoom,
    scroll: ThSettingsKeys.layout
  },
  webPubSettings: {
    ...SHARED_READER_FIELDS,
    zoom: ThSettingsKeys.zoom
  },
  divinaSettings: {
    quality: ThSettingsKeys.divinaQuality,
    scrolled: ThSettingsKeys.layout,
    spreads: ThSettingsKeys.divinaSpreads,
    stripWidth: ThSettingsKeys.divinaStripWidth
  },
  audioSettings: {
    autoPlay: ThAudioKeys.autoPlay,
    playbackRate: ThAudioKeys.playbackRate,
    skipBackwardInterval: ThAudioKeys.skipBackwardInterval,
    skipForwardInterval: ThAudioKeys.skipForwardInterval,
    skipInterval: ThAudioKeys.skipInterval,
    volume: ThAudioKeys.volume
  },
  readAlongSettings: {
    autoPause: ThReadAlongKeys.autoPause,
    format: ThReadAlongKeys.format,
    highlight: ThReadAlongKeys.highlightPresets,
    interruptions: ThReadAlongKeys.verbosity,
    keepCentered: ThReadAlongKeys.keepCentered,
    language: ThReadAlongKeys.language,
    languageOverride: ThReadAlongKeys.languageOverride,
    pauseDuration: ThReadAlongKeys.pauseDuration,
    pitch: ThReadAlongKeys.pitch,
    prosody: ThReadAlongKeys.prosodyPresets,
    rate: ThReadAlongKeys.rate,
    segmentation: ThReadAlongKeys.segmentation,
    utteranceStyle: ThReadAlongKeys.utteranceStyle,
    verbosity: ThReadAlongKeys.verbosity,
    voice: ThReadAlongKeys.voice,
    volume: ThReadAlongKeys.volume,
    wordStyle: ThReadAlongKeys.wordStyle
  }
};

// The reading themes each scope uses
const THEME_SCOPES: Record<ThemeKey, SettingsScope[]> = {
  reflow: ["reflow"],
  fxl: ["fxl", "divina"],
  audio: ["audio"]
};

const strategyOf = (strategies: ThSettingsStorageStrategies, scope: SettingsScope, setting: string) => {
  return (strategies[scope] as Record<string, ThSettingsStorageStrategy | undefined>)[setting] ?? ThSettingsStorageStrategy.global;
};

export const getFieldStrategy = (strategies: ThSettingsStorageStrategies, scope: SettingsScope, slice: SettingsSlice, field: string) => {
  const setting = (FIELD_SETTINGS[slice] as Record<string, string | undefined>)[field];
  return setting ? strategyOf(strategies, scope, setting) : ThSettingsStorageStrategy.global;
};

export const getThemeStrategy = (strategies: ThSettingsStorageStrategies, scope: SettingsScope) => {
  return strategyOf(strategies, scope, ThSettingsKeys.theme);
};

// The fields a publication of `scope` stores, glocal or local
export const getPublicationFields = (strategies: ThSettingsStorageStrategies, scope: SettingsScope, slice: SettingsSlice) => {
  return Object.keys(FIELD_SETTINGS[slice]).filter((field) => getFieldStrategy(strategies, scope, slice, field) !== ThSettingsStorageStrategy.global);
};

// Kept globally while a scope using it needs it, publications reset their own local settings anyway
export const withoutLocalSettings = (state: Record<string, any>, strategies: ThSettingsStorageStrategies) => {
  const result: Record<string, any> = { ...state };
  const isLocal = (scopes: SettingsScope[], strategyFor: (scope: SettingsScope) => ThSettingsStorageStrategy) => {
    return scopes.length > 0 && scopes.every((scope) => strategyFor(scope) === ThSettingsStorageStrategy.local);
  };

  SETTINGS_SLICES.forEach((slice) => {
    if (!result[slice]) return;
    result[slice] = Object.fromEntries(
      Object.entries(result[slice]).filter(([field]) => !isLocal(SLICE_SCOPES[slice], (scope) => getFieldStrategy(strategies, scope, slice, field)))
    );
  });

  if (result.theming?.theme) {
    const theme = Object.fromEntries(
      Object.entries(result.theming.theme as ThemeStateObject).filter(([key]) =>
        !isLocal(THEME_SCOPES[key as ThemeKey] ?? [], (scope) => getThemeStrategy(strategies, scope))
      )
    );
    result.theming = { ...result.theming, theme };
  }

  return result;
};
