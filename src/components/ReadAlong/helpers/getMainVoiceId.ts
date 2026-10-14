import { ReadAloudSettings, valueForLanguage } from "@readium/navigator";

// The voice the publication's language is spoken with, matched as the navigator applies it
export const getMainVoiceId = (voice: ReadAloudSettings["voice"] | undefined, language?: string): string | null => {
  if (!voice) return null;
  if (typeof voice === "string") return voice;
  return language ? valueForLanguage(voice, language) ?? null : null;
};
