"use client";

import { useRef } from "react";

import { ReadAloudSettings } from "@readium/navigator";
import { ReadAloudSettingsObject, useReadAloudSettingsCache } from "@/core/Hooks/ReadAloud/useReadAloudSettingsCache";
import { ReadAlongVoiceControls } from "@/lib/readAlongPlayerReducer";

export interface ReadAlongStatelessCache {
  settings: ReadAloudSettingsObject;
  voiceControls: ReadAlongVoiceControls;
  publicationLanguage: string | undefined;
}

export const useReadAlongStatelessCache = (
  format: ReadAloudSettings["format"] | null,
  inlineContextualization: ReadAloudSettings["inlineContextualization"] | null,
  keepCentered: boolean | null,
  verbosity: ReadAloudSettings["verbosity"] | null,
  skip: ReadAloudSettings["skip"] | null,
  contextualize: ReadAloudSettings["contextualize"] | null,
  language: ReadAloudSettings["language"] | null,
  segmentation: ReadAloudSettings["segmentation"] | null,
  pauseDuration: number | null,
  autoPause: ReadAloudSettings["autoPause"] | null,
  rate: number | null,
  pitch: number | null,
  volume: number | null,
  utteranceStyle: ReadAloudSettings["utteranceStyle"] | null,
  wordStyle: ReadAloudSettings["wordStyle"] | null,
  voice: ReadAloudSettings["voice"] | null,
  languageOverride: string | null,
  voiceControls: ReadAlongVoiceControls,
  publicationLanguage: string | undefined
) => {
  const settingsCache = useReadAloudSettingsCache(
    format,
    inlineContextualization,
    keepCentered,
    verbosity,
    skip,
    contextualize,
    language,
    segmentation,
    pauseDuration,
    autoPause,
    rate,
    pitch,
    volume,
    utteranceStyle,
    wordStyle,
    voice,
    languageOverride
  );

  const cache = useRef<ReadAlongStatelessCache>({
    settings: settingsCache.current.settings,
    voiceControls,
    publicationLanguage,
  });

  // Update cache synchronously on every render to ensure fresh values
  cache.current.settings = settingsCache.current.settings;
  cache.current.voiceControls = voiceControls;
  cache.current.publicationLanguage = publicationLanguage;

  return cache;
};
