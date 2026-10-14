"use client";

import { useRef, useMemo } from "react";

import { ReadAloudSettings } from "@readium/navigator";

export interface ReadAloudSettingsObject {
  format: ReadAloudSettings["format"] | null;
  inlineContextualization: boolean | null;
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
}

export interface ReadAloudSettingsCache {
  settings: ReadAloudSettingsObject;
}

export const useReadAloudSettingsCache = (
  format: ReadAloudSettings["format"] | null,
  inlineContextualization: boolean | null,
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
  wordStyle: ReadAloudSettings["wordStyle"] | null
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
  ]);

  cache.current = memoizedCache;

  return cache;
};
