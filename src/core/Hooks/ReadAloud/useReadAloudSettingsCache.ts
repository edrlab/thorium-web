"use client";

import { useRef, useMemo } from "react";

import { ReadAloudSettings } from "@readium/navigator";

export interface ReadAloudSettingsObject {
  format: ReadAloudSettings["format"] | null;
  interruptions: ReadAloudSettings["interruptions"] | null;
  keepCentered: boolean | null;
  verbosity: ReadAloudSettings["verbosity"] | null;
  language: ReadAloudSettings["language"] | null;
  segmentation: ReadAloudSettings["segmentation"] | null;
  pauseDuration: number | null;
  autoPause: ReadAloudSettings["autoPause"] | null;
  rate: number | null;
  pitch: number | null;
  volume: number | null;
  utteranceStyle: ReadAloudSettings["utteranceStyle"] | null;
  wordStyle: ReadAloudSettings["wordStyle"] | null;
  voice: ReadAloudSettings["voice"] | null;
  languageOverride: string | null;
}

export interface ReadAloudSettingsCache {
  settings: ReadAloudSettingsObject;
}

export const useReadAloudSettingsCache = (
  format: ReadAloudSettings["format"] | null,
  interruptions: ReadAloudSettings["interruptions"] | null,
  keepCentered: boolean | null,
  verbosity: ReadAloudSettings["verbosity"] | null,
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
  languageOverride: string | null
) => {
  const cache = useRef<ReadAloudSettingsCache>({
    settings: {
      format,
      interruptions,
      keepCentered,
      verbosity,
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
      languageOverride,
    },
  });

  const memoizedCache = useMemo(() => ({
    settings: {
      format,
      interruptions,
      keepCentered,
      verbosity,
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
      languageOverride,
    },
  }), [
    format,
    interruptions,
    keepCentered,
    verbosity,
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
    languageOverride,
  ]);

  cache.current = memoizedCache;

  return cache;
};
