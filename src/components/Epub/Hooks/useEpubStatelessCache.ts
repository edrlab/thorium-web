"use client";

import { useRef } from "react";
import { ThLayoutUI, ThTextAlignOptions, ThLineHeightOptions } from "@/preferences/models";
import { ThColorScheme } from "@/core/Hooks/useColorScheme";
import { LineLengthStateObject, FontFamilyStateObject } from "@/lib/settingsReducer";
import { SerializedLocator } from "@/helpers/serializePositions";
import { useEpubSettingsCache, ReadiumCSSSettings } from "@/core/Hooks/Epub/useEpubSettingsCache";

export interface EPubStatelessCache {
  layoutUI: ThLayoutUI;
  isImmersive: boolean;
  isHovering: boolean;
  arrowsOccupySpace: boolean;
  settings: ReadiumCSSSettings;
  positionsList: SerializedLocator[];
  colorScheme?: ThColorScheme;
  reducedMotion?: boolean;
}

export const useEpubStatelessCache = (
  textAlign: ThTextAlignOptions | null,
  columnCount: string,
  fontFamily: FontFamilyStateObject,
  fontSize: number,
  fontWeight: number,
  hyphens: boolean | null,
  letterSpacing: number | null,
  ligatures: boolean | null,
  lineLength: LineLengthStateObject | null,
  lineHeight: ThLineHeightOptions | null,
  noRuby: boolean | null,
  paragraphIndent: number | null,
  paragraphSpacing: number | null,
  publisherStyles: boolean,
  scroll: boolean,
  textNormalization: boolean,
  wordSpacing: number | null,
  theme: string | undefined,
  positionsList: SerializedLocator[],
  colorScheme: ThColorScheme,
  reducedMotion: boolean,
  layoutUI: ThLayoutUI,
  isImmersive: boolean,
  isHovering: boolean,
  arrowsOccupySpace: boolean
) => {
  const settingsCache = useEpubSettingsCache(
    textAlign,
    columnCount,
    fontFamily,
    fontSize,
    fontWeight,
    hyphens,
    letterSpacing,
    ligatures,
    lineLength,
    lineHeight,
    noRuby,
    paragraphIndent,
    paragraphSpacing,
    publisherStyles,
    scroll,
    textNormalization,
    wordSpacing,
    theme
  );

  const cache = useRef<EPubStatelessCache>({
    layoutUI,
    isImmersive,
    isHovering,
    arrowsOccupySpace: arrowsOccupySpace || false,
    settings: settingsCache.current.settings,
    positionsList: positionsList,
    colorScheme,
    reducedMotion,
  });

  // Update cache synchronously on every render to ensure fresh values
  cache.current.layoutUI = layoutUI;
  cache.current.isImmersive = isImmersive;
  cache.current.isHovering = isHovering;
  cache.current.arrowsOccupySpace = arrowsOccupySpace || false;
  cache.current.settings = settingsCache.current.settings;
  cache.current.positionsList = positionsList;
  cache.current.colorScheme = colorScheme;
  cache.current.reducedMotion = reducedMotion;

  return cache;
};
