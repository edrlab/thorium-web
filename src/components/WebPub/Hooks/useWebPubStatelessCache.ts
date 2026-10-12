"use client";

import { useRef } from "react";
import { ThTextAlignOptions, ThLineHeightOptions } from "@/preferences/models";
import { FontFamilyStateObject } from "@/lib/settingsReducer";
import { useWebPubSettingsCache, WebPubStatelessCache } from "@/core/Hooks/WebPub/useWebPubSettingsCache";

export interface WebPubReaderStatelessCache extends WebPubStatelessCache {
  isReadAlongActive: boolean;
  isReadAlongPlaying: boolean;
}

export const useWebPubStatelessCache = (
  fontFamily: FontFamilyStateObject,
  fontWeight: number,
  hyphens: boolean | null,
  letterSpacing: number | null,
  ligatures: boolean | null,
  lineHeight: ThLineHeightOptions | null,
  noRuby: boolean | null,
  paragraphIndent: number | null,
  paragraphSpacing: number | null,
  publisherStyles: boolean,
  textAlign: ThTextAlignOptions | null,
  textNormalization: boolean,
  wordSpacing: number | null,
  zoom: number,
  isReadAlongActive: boolean,
  isReadAlongPlaying: boolean
) => {
  const settingsCache = useWebPubSettingsCache(
    fontFamily,
    fontWeight,
    hyphens,
    letterSpacing,
    ligatures,
    lineHeight,
    noRuby,
    paragraphIndent,
    paragraphSpacing,
    publisherStyles,
    textAlign,
    textNormalization,
    wordSpacing,
    zoom
  );

  const cache = useRef<WebPubReaderStatelessCache>({
    settings: settingsCache.current.settings,
    isReadAlongActive,
    isReadAlongPlaying
  });

  // Update cache synchronously on every render to ensure fresh values
  cache.current.settings = settingsCache.current.settings;
  cache.current.isReadAlongActive = isReadAlongActive;
  cache.current.isReadAlongPlaying = isReadAlongPlaying;

  return cache;
};
