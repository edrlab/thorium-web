import { ReadAloudSettings } from "@readium/navigator";

import { ReadAlongVoiceStateObject } from "@/lib/readAlongSettingsReducer";

// Undetermined, for publications that don't declare their language
const UNDETERMINED = "und";

// As the publication declares it, since the navigator's voice for a language and region wins over one for the language alone
export const getVoiceLanguageKey = (language?: string): string => language || UNDETERMINED;

// Persisted before voices were stored per language
export const getStoredVoices = (voices: ReadAlongVoiceStateObject | string | null | undefined): ReadAlongVoiceStateObject => {
  return voices && typeof voices === "object" ? voices : {};
};

// Content without a language can't be matched, so it takes its voice for all content
export const toVoicePreference = (voices: ReadAlongVoiceStateObject, language?: string): ReadAloudSettings["voice"] => {
  if (!language) return voices[UNDETERMINED] ?? null;
  return Object.keys(voices).length > 0 ? voices : null;
};
