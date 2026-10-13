"use client";

import { useRef } from "react";

import { ReadAloudSettings } from "@readium/navigator";
import { ReadAloudSettingsObject, useReadAloudSettingsCache } from "@/core/Hooks/ReadAloud/useReadAloudSettingsCache";
import { ReadAlongVoiceControls } from "@/lib/readAlongPlayerReducer";

export interface ReadAlongStatelessCache {
  settings: ReadAloudSettingsObject;
  voice: string | null;
  voiceControls: ReadAlongVoiceControls;
}

export const useReadAlongStatelessCache = (
  format: ReadAloudSettings["format"] | null,
  inlineContextualization: boolean | null,
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
  voice: string | null,
  voiceControls: ReadAlongVoiceControls
) => {
  const settingsCache = useReadAloudSettingsCache(
    format,
    inlineContextualization,
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
    wordStyle
  );

  const cache = useRef<ReadAlongStatelessCache>({
    settings: settingsCache.current.settings,
    voice,
    voiceControls,
  });

  // Update cache synchronously on every render to ensure fresh values
  cache.current.settings = settingsCache.current.settings;
  cache.current.voice = voice;
  cache.current.voiceControls = voiceControls;

  return cache;
};
