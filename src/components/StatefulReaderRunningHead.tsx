"use client";

import { useMemo } from "react";

import { ThRunningHeadFormat } from "@/preferences/models";
import { ThFormatPref, ThFormatPrefValue } from "@/preferences";

import { ThRunningHead } from "@/core/Components";

import { useI18n } from "@/i18n/useI18n";

import { useAppSelector } from "@/lib/hooks";
import { makeBreakpointsMap } from "@/core/Helpers/breakpointsMap";

export const StatefulReaderRunningHead = ({ 
  formatPref
}: {
  formatPref?: ThFormatPref<ThRunningHeadFormat>;
}) => {
  const { t } = useI18n();
  
  const progress = useAppSelector(state => state.publication.progress);
  const isImmersive = useAppSelector(state => state.reader.isImmersive);
  const isHovering = useAppSelector(state => state.reader.isHovering);
  const isFullscreen = useAppSelector(state => state.reader.isFullscreen);
  const breakpoint = useAppSelector(state => state.theming.containerBreakpoint);

  // Get the fallback format based on isFXL
  const fallbackFormat = useMemo<ThFormatPrefValue<ThRunningHeadFormat>>(() => ({
    variants: ThRunningHeadFormat.title,
    displayInImmersive: true,
    displayInFullscreen: true
  }), []);

  const breakpointsMap = useMemo(() => {
    return makeBreakpointsMap<ThFormatPrefValue<ThRunningHeadFormat>>({
      defaultValue: formatPref?.default || fallbackFormat,
      fromEnum: ThRunningHeadFormat,
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

  const displayFormat = useMemo(() => {
    if (!variants) return ThRunningHeadFormat.title;
    
    // Check if we should hide in immersive mode
    if (isImmersive && displayInImmersive === false && !isHovering) {
      return ThRunningHeadFormat.none;
    }
    
    // Check if we should hide in fullscreen mode
    if (isImmersive && isFullscreen && displayInFullscreen === false && !isHovering) {
      return ThRunningHeadFormat.none;
    }
    
    return variants;
  }, [variants, isImmersive, displayInImmersive, isHovering, isFullscreen, displayInFullscreen]);

  const runningHead = useMemo(() => {
    if (displayFormat === ThRunningHeadFormat.title) {
      return progress?.title || "";
    } else if (displayFormat === ThRunningHeadFormat.chapter) {
      return progress?.progression?.currentChapter || progress?.title || "";
    }
    return "";
  }, [displayFormat, progress]);

  if (!runningHead || displayFormat === ThRunningHeadFormat.none) return null;
  
  return (
    <>
    <ThRunningHead 
      label={ runningHead } 
      aria-label={ t("reader.app.header.runningHead") }
    />
    </>
  );
}