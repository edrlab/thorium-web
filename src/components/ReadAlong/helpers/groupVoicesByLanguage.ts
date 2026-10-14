import { getLanguageDisplayName, ReadiumSpeechVoice } from "@readium/navigator";

export interface ReadAlongVoiceGroup {
  id: string;
  label: string;
  voices: ReadiumSpeechVoice[];
}

const getLanguageLabel = (language: string, displayLocale?: string) => {
  const label = getLanguageDisplayName(language, displayLocale);
  // Some locales (e.g. French) return lowercase language names
  return label.charAt(0).toLocaleUpperCase(displayLocale) + label.slice(1);
};

// Labels come from Intl so every BCP 47 tag is covered without locale files
export const groupVoicesByLanguage = (voices: ReadiumSpeechVoice[], displayLocale?: string): ReadAlongVoiceGroup[] => {
  const groups = new Map<string, ReadAlongVoiceGroup>();

  voices.forEach((voice) => {
    const id = voice.language;
    const group = groups.get(id);
    if (group) {
      group.voices.push(voice);
    } else {
      groups.set(id, { id, label: getLanguageLabel(id, displayLocale), voices: [voice] });
    }
  });

  return Array.from(groups.values());
};
