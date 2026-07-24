"use client";

import { useMemo } from "react";

import progressionStyles from "./assets/styles/thorium-web.reader.progression.module.css";

import { ThProgressionFormat } from "@/preferences/models";
import { ThFormatPref, ThFormatPrefValue } from "@/preferences";

import { ThProgression } from "@/core/Components/Reader/ThProgression";

import { useI18n } from "@/i18n/useI18n";

import { useAppSelector } from "@/lib/hooks";

import { makeBreakpointsMap } from "@/core/Helpers/breakpointsMap";
import { getBestMatchingProgressionFormat } from "@/core/Helpers/progressionFormat";

import classNames from "classnames";

export const StatefulReaderProgression = ({ 
  className,
  formatPref,
  fallbackVariant
}: { 
  className?: string,
  formatPref?: ThFormatPref<ThProgressionFormat | ThProgressionFormat[]>,
  fallbackVariant: ThProgressionFormat | Array<ThProgressionFormat>
}) => {
  const { t } = useI18n();
  
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
  const displayFormat = useMemo(() => {
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

  // Compute display text based on current position and timeline
  const displayText = useMemo(() => {
    if (displayFormat === ThProgressionFormat.none || !progress?.progression) {
      return "";
    }

    const { 
      currentPositions = [],
      totalPositions,
      relativeProgression,
      totalProgression,
      currentChapter,
      positionsLeft,
      totalItems,
      currentIndex
    } = progress.progression;
    
    let text = "";
    
    // Format positions for display (handle array of two positions with a dash)
    const formatPositions = (positions: number[]) => {
      if (positions.length === 2) {
        return positions.join("–");
      }
      return positions[0]?.toString() || "";
    };
        
    switch (displayFormat) {
      case ThProgressionFormat.positions:
        if (currentPositions.length > 0) {
          text = formatPositions(currentPositions);
        }
        break;
        
      case ThProgressionFormat.positionsOfTotal:
        if (currentPositions.length > 0 && totalPositions) {
          text = t("reader.progression.xOfY.compact", { 
            x: formatPositions(currentPositions),
            y: totalPositions
          });
        }
        break;

      case ThProgressionFormat.positionsPercentOfTotal:
        if (currentPositions.length > 0 && totalPositions) {
          const percentage = Math.round((totalProgression || 0) * 100);
          text = t("reader.progression.xOfY.descriptive", { 
            x: formatPositions(currentPositions),
            y: totalPositions,
            z: `${ percentage }%`
          });
        }
        break;
        
      case ThProgressionFormat.positionsLeft:
        if (positionsLeft !== undefined) {
          text = t(`reader.progression.positionsLeftInChapter.descriptive`, { 
            count: positionsLeft
          });
        }
        break;
        
      case ThProgressionFormat.overallProgression:
        if (totalProgression !== undefined) {
          const percentage = Math.round(totalProgression * 100);
          text = `${ percentage }%`;
        }
        break;
        
      case ThProgressionFormat.resourceProgression:
        if (relativeProgression !== undefined) {
          const percentage = Math.round(relativeProgression * 100);
          text = `${ percentage }%`;
        }
        break;
        
      case ThProgressionFormat.progressionOfResource:
        if (relativeProgression !== undefined) {
          const percentage = Math.round(relativeProgression * 100);
          text = t("reader.progression.xOfY.compact", {
            x: `${ percentage }%`,
            y: currentChapter || t("reader.app.progression.referenceFallback")
          });
        }
        break;

      case ThProgressionFormat.readingOrderIndex:
        if (currentIndex !== undefined && totalItems !== undefined) {
          text = t("reader.progression.xOfY.compact", {
            x: currentIndex,
            y: totalItems
          });
        }
        break;
    }
    
    return text;
  }, [displayFormat, progress, t]);

  if (!displayText || displayFormat === ThProgressionFormat.none) {
    return null;
  }

  return (
    <ThProgression 
      id="current-progression" 
      className={ classNames(progressionStyles.wrapper, className) }
      aria-label={ t("reader.app.progression.wrapper") }
    >
      { displayText }
    </ThProgression>
  );
};