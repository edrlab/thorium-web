import { ThAudioKeys, ThReadAlongKeys, ThSettingsKeys } from "@/preferences/models";

export enum ThSettingsStorageStrategy {
  // Shared by all publications
  global = "global",
  // Per publication, starting from the last value used in any publication
  glocal = "glocal",
  // Per publication only
  local = "local"
}

// Scoped like the settings orders, a setting left out is global
export interface ThSettingsStorageStrategies {
  reflow: Partial<Record<ThSettingsKeys, ThSettingsStorageStrategy>>;
  fxl: Partial<Record<ThSettingsKeys, ThSettingsStorageStrategy>>;
  webPub: Partial<Record<ThSettingsKeys, ThSettingsStorageStrategy>>;
  divina: Partial<Record<ThSettingsKeys, ThSettingsStorageStrategy>>;
  audio: Partial<Record<ThAudioKeys, ThSettingsStorageStrategy>>;
  readAlong: Partial<Record<ThReadAlongKeys, ThSettingsStorageStrategy>>;
}

// Reflowable settings, but the theme which is always shared
const REFLOWABLE_STRATEGIES = {
  [ThSettingsKeys.fontFamily]: ThSettingsStorageStrategy.glocal,
  [ThSettingsKeys.fontWeight]: ThSettingsStorageStrategy.glocal,
  [ThSettingsKeys.hyphens]: ThSettingsStorageStrategy.glocal,
  [ThSettingsKeys.letterSpacing]: ThSettingsStorageStrategy.glocal,
  [ThSettingsKeys.ligatures]: ThSettingsStorageStrategy.glocal,
  [ThSettingsKeys.lineHeight]: ThSettingsStorageStrategy.glocal,
  [ThSettingsKeys.noRuby]: ThSettingsStorageStrategy.glocal,
  [ThSettingsKeys.paragraphIndent]: ThSettingsStorageStrategy.glocal,
  [ThSettingsKeys.paragraphSpacing]: ThSettingsStorageStrategy.glocal,
  [ThSettingsKeys.publisherStyles]: ThSettingsStorageStrategy.glocal,
  [ThSettingsKeys.spacingPresets]: ThSettingsStorageStrategy.glocal,
  [ThSettingsKeys.textAlign]: ThSettingsStorageStrategy.glocal,
  [ThSettingsKeys.textNormalize]: ThSettingsStorageStrategy.glocal,
  [ThSettingsKeys.wordSpacing]: ThSettingsStorageStrategy.glocal,
  [ThSettingsKeys.zoom]: ThSettingsStorageStrategy.glocal
};

// Same as Thorium Mobile
export const defaultSettingsStorageStrategies: ThSettingsStorageStrategies = {
  reflow: {
    ...REFLOWABLE_STRATEGIES,
    [ThSettingsKeys.columns]: ThSettingsStorageStrategy.glocal,
    [ThSettingsKeys.layout]: ThSettingsStorageStrategy.glocal
  },
  fxl: {
    [ThSettingsKeys.columns]: ThSettingsStorageStrategy.glocal,
    [ThSettingsKeys.theme]: ThSettingsStorageStrategy.glocal
  },
  webPub: {
    ...REFLOWABLE_STRATEGIES
  },
  divina: {
    [ThSettingsKeys.divinaQuality]: ThSettingsStorageStrategy.glocal,
    [ThSettingsKeys.divinaSpreads]: ThSettingsStorageStrategy.glocal,
    [ThSettingsKeys.divinaStripWidth]: ThSettingsStorageStrategy.glocal,
    [ThSettingsKeys.layout]: ThSettingsStorageStrategy.glocal,
    [ThSettingsKeys.theme]: ThSettingsStorageStrategy.glocal
  },
  audio: {},
  // Voice, volume and pitch are global
  readAlong: {
    [ThReadAlongKeys.language]: ThSettingsStorageStrategy.glocal,
    [ThReadAlongKeys.highlightPresets]: ThSettingsStorageStrategy.glocal,
    [ThReadAlongKeys.utteranceStyle]: ThSettingsStorageStrategy.glocal,
    [ThReadAlongKeys.wordStyle]: ThSettingsStorageStrategy.glocal,
    [ThReadAlongKeys.keepCentered]: ThSettingsStorageStrategy.glocal,
    [ThReadAlongKeys.prosodyPresets]: ThSettingsStorageStrategy.glocal,
    [ThReadAlongKeys.rate]: ThSettingsStorageStrategy.glocal,
    [ThReadAlongKeys.pauseDuration]: ThSettingsStorageStrategy.glocal,
    [ThReadAlongKeys.autoPause]: ThSettingsStorageStrategy.glocal,
    [ThReadAlongKeys.verbosity]: ThSettingsStorageStrategy.glocal
  }
};
