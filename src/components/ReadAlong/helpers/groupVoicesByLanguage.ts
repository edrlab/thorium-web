import { ReadiumSpeechVoice } from "@readium/navigator";

export interface ReadAlongVoiceGroup {
  id: string;
  label: string;
  voices: ReadiumSpeechVoice[];
}

const getLanguageLabel = (displayNames: Intl.DisplayNames | null, language: string, displayLocale?: string) => {
  let label = language;
  try {
    label = displayNames?.of(language) ?? language;
  } catch {
    return language;
  }
  // Some locales (e.g. French) return lowercase language names
  return label.charAt(0).toLocaleUpperCase(displayLocale) + label.slice(1);
};

// Labels come from Intl so every BCP 47 tag is covered without locale files
export const groupVoicesByLanguage = (voices: ReadiumSpeechVoice[], displayLocale?: string): ReadAlongVoiceGroup[] => {
  let displayNames: Intl.DisplayNames | null = null;
  try {
    displayNames = new Intl.DisplayNames(displayLocale ? [displayLocale] : undefined, { type: "language", languageDisplay: "standard" });
  } catch {
    displayNames = null;
  }

  const groups = new Map<string, ReadAlongVoiceGroup>();

  voices.forEach((voice) => {
    const id = voice.language;
    const group = groups.get(id);
    if (group) {
      group.voices.push(voice);
    } else {
      groups.set(id, { id, label: getLanguageLabel(displayNames, id, displayLocale), voices: [voice] });
    }
  });

  return Array.from(groups.values());
};
