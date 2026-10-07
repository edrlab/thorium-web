import { ThAudioKeys, ThReadAlongKeys, ThSettingsKeys } from "@/preferences/models";

// Names shared by the EPUB and WebPub navigators
const SHARED_READER_PREFERENCES = {
  [ThSettingsKeys.fontFamily]: "fontFamily",
  [ThSettingsKeys.fontWeight]: "fontWeight",
  [ThSettingsKeys.hyphens]: "hyphens",
  [ThSettingsKeys.letterSpacing]: "letterSpacing",
  [ThSettingsKeys.ligatures]: "ligatures",
  [ThSettingsKeys.lineHeight]: "lineHeight",
  [ThSettingsKeys.noRuby]: "noRuby",
  [ThSettingsKeys.paragraphIndent]: "paragraphIndent",
  [ThSettingsKeys.paragraphSpacing]: "paragraphSpacing",
  [ThSettingsKeys.publisherStyles]: "publisherStyles",
  [ThSettingsKeys.spacingGroup]: "spacingGroup",
  [ThSettingsKeys.spacingPresets]: "spacingPresets",
  [ThSettingsKeys.textAlign]: "textAlign",
  [ThSettingsKeys.textGroup]: "textGroup",
  [ThSettingsKeys.textNormalize]: "textNormalization",
  [ThSettingsKeys.theme]: "theme",
  [ThSettingsKeys.wordSpacing]: "wordSpacing",
} as const;

// One map per navigator, as keys of different enums can share a value
const SETTINGS_KEY_TO_PREFERENCE = {
  epub: {
    ...SHARED_READER_PREFERENCES,
    [ThSettingsKeys.columns]: "columnCount",
    [ThSettingsKeys.layout]: "scroll",
    [ThSettingsKeys.zoom]: "fontSize",
  },
  webPub: {
    ...SHARED_READER_PREFERENCES,
    [ThSettingsKeys.zoom]: "zoom",
  },
  divina: {
    [ThSettingsKeys.divinaQuality]: "quality",
    [ThSettingsKeys.divinaSpreads]: "spreads",
    [ThSettingsKeys.divinaStripWidth]: "stripWidth",
    [ThSettingsKeys.layout]: "scrolled",
    [ThSettingsKeys.theme]: "theme",
  },
  audio: {
    [ThAudioKeys.autoPlay]: "autoPlay",
    [ThAudioKeys.playbackRate]: "playbackRate",
    [ThAudioKeys.skipBackwardInterval]: "skipBackwardInterval",
    [ThAudioKeys.skipForwardInterval]: "skipForwardInterval",
    [ThAudioKeys.volume]: "volume",
  },
  readAlong: {
    [ThReadAlongKeys.autoPause]: "autoPause",
    [ThReadAlongKeys.inlineContextualization]: "inlineContextualization",
    [ThReadAlongKeys.language]: "language",
    [ThReadAlongKeys.pauseDuration]: "pauseDuration",
    [ThReadAlongKeys.pitch]: "pitch",
    [ThReadAlongKeys.rate]: "rate",
    [ThReadAlongKeys.utteranceStyle]: "utteranceStyle",
    [ThReadAlongKeys.verbosity]: "verbosity",
    [ThReadAlongKeys.volume]: "volume",
    [ThReadAlongKeys.wordStyle]: "wordStyle",
  },
} as const satisfies {
  epub: Partial<Record<ThSettingsKeys, string>>;
  webPub: Partial<Record<ThSettingsKeys, string>>;
  divina: Partial<Record<ThSettingsKeys, string>>;
  audio: Partial<Record<ThAudioKeys, string>>;
  readAlong: Partial<Record<ThReadAlongKeys, string>>;
};

type PreferenceScope = keyof typeof SETTINGS_KEY_TO_PREFERENCE;

type ScopeMappings<S extends PreferenceScope> = typeof SETTINGS_KEY_TO_PREFERENCE[S];

// A scope union, such as "epub" | "webPub", only accepts the keys all of them map
export const getPreferenceKey = <S extends PreferenceScope, K extends keyof ScopeMappings<S>>(
  settingsKey: K,
  scope: S
): ScopeMappings<S>[K] => {
  const preferenceKey = (SETTINGS_KEY_TO_PREFERENCE[scope] as Record<string, string>)[settingsKey as string];
  if (!preferenceKey) throw new Error(`No preference mapped for setting "${ String(settingsKey) }" in scope "${ scope }"`);
  return preferenceKey as ScopeMappings<S>[K];
};
