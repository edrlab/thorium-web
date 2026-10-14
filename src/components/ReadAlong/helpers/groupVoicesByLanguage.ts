import { ReadiumSpeechVoice } from "@readium/navigator";

import { getLanguageLabel } from "./getLanguageLabel";

export interface ReadAlongVoiceGroup {
  id: string;
  label: string;
  voices: ReadiumSpeechVoice[];
}

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
