"use client";

import { useRef, useMemo } from "react";

import { ReadAloudSettings } from "@readium/navigator";

export interface ReadAloudSettingsObject {
  format: ReadAloudSettings["format"] | null;
  inlineContextualization: ReadAloudSettings["inlineContextualization"] | null;
  keepCentered: boolean | null;
  verbosity: ReadAloudSettings["verbosity"] | null;
  skip: ReadAloudSettings["skip"] | null;
  contextualize: ReadAloudSettings["contextualize"] | null;
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
  languageOverride: string | null
) => {
  const cache = useRef<ReadAloudSettingsCache>({
    settings: {
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
      languageOverride,
    },
  });

  const memoizedCache = useMemo(() => ({
    settings: {
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
      languageOverride,
    },
  }), [
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
    languageOverride,
  ]);

  cache.current = memoizedCache;

  return cache;
};
