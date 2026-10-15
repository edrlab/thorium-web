import { ReadAloudSettings, valueForLanguage } from "@readium/navigator";

// The voice the publication's language is spoken with, matched as the navigator applies it
export const getMainVoiceId = (voice: ReadAloudSettings["voice"] | undefined, language?: string): string | null => {
  if (!voice) return null;
  if (typeof voice === "string") return voice;
  // Without a language only a voice for all content is submitted, so a record is the engine voice's alone
  if (!language) return Object.values(voice)[0] ?? null;
  return valueForLanguage(voice, language) ?? null;
};
