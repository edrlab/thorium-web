"use client";

import { useCallback } from "react";

import { ThProgressionFormat } from "@/preferences/models";

import { useI18n } from "@/i18n/useI18n";

import { useAppSelector } from "@/lib/hooks";

// Compact forms only reuse existing strings, and drop the parts that can be long
export const useProgressionText = () => {
  const { t } = useI18n();
  const progress = useAppSelector(state => state.publication.progress);

  return useCallback((
    displayFormat: ThProgressionFormat | Array<ThProgressionFormat>,
    compact: boolean = false
  ): string => {
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
          text = compact
            ? formatPositions(currentPositions)
            : t("reader.progression.xOfY.compact", {
                x: formatPositions(currentPositions),
                y: totalPositions
              });
        }
        break;

      case ThProgressionFormat.positionsPercentOfTotal:
        if (currentPositions.length > 0 && totalPositions) {
          const percentage = Math.round((totalProgression || 0) * 100);
          text = compact
            ? t("reader.progression.xOfY.compact", {
                x: formatPositions(currentPositions),
                y: totalPositions
              })
            : t("reader.progression.xOfY.descriptive", {
                x: formatPositions(currentPositions),
                y: totalPositions,
                z: `${ percentage }%`
              });
        }
        break;

      case ThProgressionFormat.positionsLeft:
        if (positionsLeft !== undefined) {
          text = compact
            ? t("reader.progression.positionsLeft.compact", { count: positionsLeft })
            : t("reader.progression.positionsLeftInChapter.descriptive", { count: positionsLeft });
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
          text = compact
            ? `${ percentage }%`
            : t("reader.progression.xOfY.compact", {
                x: `${ percentage }%`,
                y: currentChapter || t("reader.app.progression.referenceFallback")
              });
        }
        break;

      case ThProgressionFormat.readingOrderIndex:
        if (currentIndex !== undefined && totalItems !== undefined) {
          text = compact && totalProgression !== undefined
            ? `${ Math.round(totalProgression * 100) }%`
            : t("reader.progression.xOfY.compact", {
                x: currentIndex,
                y: totalItems
              });
        }
        break;
    }

    return text;
  }, [progress, t]);
};
