import { extractLangRegionFromBCP47, ReadiumSpeechVoice } from "@readium/navigator";

import { getLanguageLabel } from "./getLanguageLabel";

export interface ReadAlongVoiceGroup {
  id: string;
  label: string;
  flag?: string;
  voices: ReadiumSpeechVoice[];
}

const getRegionLabel = (region: string, displayLocale?: string) => {
  try {
    return new Intl.DisplayNames(displayLocale ? [displayLocale] : [], { type: "region" }).of(region) ?? region;
  } catch {
    return region;
  }
};

// Regional indicator symbols only exist for alpha-2 codes, not UN M49 ones like 419
const getRegionFlag = (region: string) => /^[A-Z]{2}$/.test(region)
  ? String.fromCodePoint(...[...region].map((char) => 0x1F1A5 + char.charCodeAt(0)))
  : undefined;

// Region labels only when all voices share a language, otherwise the language must be named too
export const groupVoicesByRegion = (voices: ReadiumSpeechVoice[], displayLocale?: string): ReadAlongVoiceGroup[] => {
  const parsed = voices.map((voice) => ({ voice, tag: extractLangRegionFromBCP47(voice.language) }));
  const isSingleLanguage = new Set(parsed.map(({ tag: [language] }) => language)).size <= 1;
  const groups = new Map<string, ReadAlongVoiceGroup>();

  parsed.forEach(({ voice, tag: [language, region] }) => {
    const id = region ? `${ language }-${ region }` : language;
    const group = groups.get(id);
    if (group) {
      group.voices.push(voice);
    } else {
      groups.set(id, {
        id,
        label: region && isSingleLanguage ? getRegionLabel(region, displayLocale) : getLanguageLabel(id, displayLocale),
        flag: region ? getRegionFlag(region) : undefined,
        voices: [voice]
      });
    }
  });

  return Array.from(groups.values());
};
