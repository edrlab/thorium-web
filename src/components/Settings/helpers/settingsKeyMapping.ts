import { ThSettingsKeys } from "@/preferences/models";
import { ReaderProfile } from "@/lib/readerReducer";

// A preference name shared by all navigators, or one per profile when they differ
type PreferenceMapping = string | Partial<Record<NonNullable<ReaderProfile>, string>>;

const SETTINGS_KEY_TO_PREFERENCE = {
  [ThSettingsKeys.columns]: "columnCount",
  [ThSettingsKeys.divinaQuality]: "quality",
  [ThSettingsKeys.divinaSpreads]: "spreads",
  [ThSettingsKeys.divinaStripWidth]: "stripWidth",
  [ThSettingsKeys.fontFamily]: "fontFamily",
  [ThSettingsKeys.fontWeight]: "fontWeight",
  [ThSettingsKeys.hyphens]: "hyphens",
  [ThSettingsKeys.layout]: { epub: "scroll", divina: "scrolled" },
  [ThSettingsKeys.letterSpacing]: "letterSpacing",
  [ThSettingsKeys.ligatures]: "ligatures",
  [ThSettingsKeys.lineHeight]: "lineHeight",
  [ThSettingsKeys.paragraphIndent]: "paragraphIndent",
  [ThSettingsKeys.paragraphSpacing]: "paragraphSpacing",
  [ThSettingsKeys.publisherStyles]: "publisherStyles",
  [ThSettingsKeys.spacingGroup]: "spacingGroup",
  [ThSettingsKeys.spacingPresets]: "spacingPresets",
  [ThSettingsKeys.textAlign]: "textAlign",
  [ThSettingsKeys.textGroup]: "textGroup",
  [ThSettingsKeys.textNormalize]: "textNormalization",
  [ThSettingsKeys.noRuby]: "noRuby",
  [ThSettingsKeys.theme]: "theme",
  [ThSettingsKeys.wordSpacing]: "wordSpacing",
  [ThSettingsKeys.zoom]: { epub: "fontSize", webPub: "zoom" },
} as const satisfies Partial<Record<ThSettingsKeys, PreferenceMapping>>;

type SettingsKeyWithPreference = keyof typeof SETTINGS_KEY_TO_PREFERENCE;

type PreferenceKey<K extends SettingsKeyWithPreference> =
  typeof SETTINGS_KEY_TO_PREFERENCE[K] extends infer V
    ? V extends string ? V : V[keyof V]
    : never;

// The profile is ignored for global mappings
export const getPreferenceKey = <K extends SettingsKeyWithPreference>(settingsKey: K, profile?: ReaderProfile): PreferenceKey<K> => {
  const mapping: PreferenceMapping = SETTINGS_KEY_TO_PREFERENCE[settingsKey];
  if (typeof mapping === "string") return mapping as PreferenceKey<K>;

  const preferenceKey = profile ? mapping[profile] : undefined;
  if (!preferenceKey) throw new Error(`No preference mapped for setting "${ settingsKey }" in profile "${ profile }"`);
  return preferenceKey as PreferenceKey<K>;
};
