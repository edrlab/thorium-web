"use client";

import { useMemo } from "react";

import { ThProgressionFormat } from "@/preferences/models";
import { ThFormatPref, ThFormatPrefValue } from "@/preferences";

import { useAppSelector } from "@/lib/hooks";

import { makeBreakpointsMap } from "@/core/Helpers/breakpointsMap";
import { getBestMatchingProgressionFormat } from "@/core/Helpers/progressionFormat";

export const useProgressionFormat = (
  formatPref: ThFormatPref<ThProgressionFormat | ThProgressionFormat[]> | undefined,
  fallbackVariant: ThProgressionFormat | Array<ThProgressionFormat>
): ThProgressionFormat | Array<ThProgressionFormat> => {
  const progress = useAppSelector(state => state.publication.progress);
  const isImmersive = useAppSelector(state => state.reader.isImmersive);
  const isFullscreen = useAppSelector(state => state.reader.isFullscreen);
  const isHovering = useAppSelector(state => state.reader.isHovering);
  const breakpoint = useAppSelector(state => state.theming.breakpoint);

  const fallbackFormat = useMemo(() => {
    return {
      variants: fallbackVariant,
      displayInImmersive: true,
      displayInFullscreen: true
    };
  }, [fallbackVariant]);

  const breakpointsMap = useMemo(() => {
    return makeBreakpointsMap<ThFormatPrefValue<ThProgressionFormat | ThProgressionFormat[]>>({
      defaultValue: formatPref?.default || fallbackFormat,
      fromEnum: ThProgressionFormat,
      pref: formatPref?.breakpoints,
      validateKey: "variants"
    });
  }, [formatPref, fallbackFormat]);

  // Get current preferences with proper fallback
  const currentPrefs = useMemo(() => {
    if (!breakpoint) return formatPref?.default || fallbackFormat;
    return breakpointsMap[breakpoint] || formatPref?.default || fallbackFormat;
  }, [breakpoint, breakpointsMap, formatPref?.default, fallbackFormat]);

  const { variants, displayInImmersive, displayInFullscreen } = currentPrefs;

  // Get the display format, handling both single format and array of formats
  return useMemo(() => {
    if (!variants) return fallbackFormat.variants;

    // Check if we should hide in immersive mode
    if (isImmersive && displayInImmersive === false && !isHovering) {
      return ThProgressionFormat.none;
    }

    // Check if we should hide in fullscreen mode
    if (isImmersive && isFullscreen && displayInFullscreen === false && !isHovering) {
      return ThProgressionFormat.none;
    }

    if (Array.isArray(variants)) {
      return getBestMatchingProgressionFormat(variants, progress?.progression) ||
        fallbackFormat.variants;
    }

    return variants;
  }, [variants, progress?.progression, fallbackFormat, isImmersive, isHovering, isFullscreen, displayInImmersive, displayInFullscreen]);
};
