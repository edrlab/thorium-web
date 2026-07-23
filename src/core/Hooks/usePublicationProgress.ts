import { useEffect, useMemo } from "react";

import { Locator, Publication, Timeline, TimelineItem } from "@readium/shared";
import { SerializedLocator } from "@/helpers/serializePositions";
import { resolveChapterTitle } from "@/helpers/timelineFallback";

export interface ProgressionDetails {
  totalItems?: number;
  currentIndex?: number;
  totalPositions?: number;
  currentPositions?: number[];
  relativeProgression?: number;
  totalProgression?: number;
  currentChapter?: string;
  positionsLeft?: number;
}

export interface Progress {
  title?: string;
  progression?: ProgressionDetails;
}

interface PositionEntry {
  positionRange?: [number, number?];
}

export const usePublicationProgress = ({
  publication,
  getNavigatorTimeline,
  currentTimelineItem,
  currentLocation,
  currentPositions,
  positionsList,
  onChange
}: {
  publication: Publication | null;
  getNavigatorTimeline: () => Timeline | undefined;
  currentTimelineItem?: TimelineItem;
  currentLocation?: Locator;
  currentPositions?: number[];
  positionsList?: SerializedLocator[];
  onChange?: (progress: Progress) => void;
}): Progress => {
  // Per-href position range table, derived once from positionsList — kept fully
  // decoupled from chapter/TOC resolution, which now comes from the real Timeline.
  const positionEntries = useMemo(() => {
    const entries: { [href: string]: PositionEntry } = {};
    if (!positionsList?.length) return entries;

    const readingOrder = publication?.readingOrder?.items || [];
    for (const item of readingOrder) {
      const positions = positionsList
        .filter(p => p.href === item.href)
        .sort((a, b) => (a.locations?.position || 0) - (b.locations?.position || 0));

      if (positions.length === 0) continue;

      const start = positions[0].locations;
      const end = positions.length > 1 ? positions[positions.length - 1].locations : start;

      entries[item.href] = {
        positionRange: start?.position !== undefined ? [start.position, end?.position] : undefined
      };
    }

    return entries;
  }, [publication, positionsList]);

  const navigatorTimeline = getNavigatorTimeline();

  const currentHref = currentLocation?.href;

  const currentIndex = currentHref
    ? publication?.readingOrder.items.findIndex(item => item.href === currentHref)
    : undefined;

  const currentChapter = currentTimelineItem && navigatorTimeline
    ? resolveChapterTitle(navigatorTimeline, currentTimelineItem)
    : undefined;

  const progress: Progress = useMemo(() => {
    const positionRange = currentHref ? positionEntries[currentHref]?.positionRange : undefined;
    const endPosition = positionRange?.[1];
    const currentPosition = currentPositions?.[0];

    return {
      title: publication?.metadata.title.getTranslation("en"),
      progression: {
        totalItems: publication?.readingOrder.items.length,
        currentIndex: currentIndex !== undefined && currentIndex >= 0 ? currentIndex + 1 : undefined,
        totalPositions: positionsList?.length,
        currentPositions: currentPositions || [],
        relativeProgression: currentLocation?.locations.progression,
        totalProgression: currentLocation?.locations.totalProgression,
        currentChapter,
        positionsLeft: (!positionsList?.length || endPosition === undefined || currentPosition === undefined)
          ? undefined
          : Math.max(0, endPosition - currentPosition)
      }
    };
  }, [
    publication,
    currentChapter,
    currentHref,
    currentIndex,
    positionEntries,
    positionsList,
    currentPositions,
    currentLocation
  ]);

  useEffect(() => {
    if (onChange) onChange(progress);
  }, [progress, onChange]);

  return progress;
};
