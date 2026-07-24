import { useCallback } from "react";

import { Timeline, TimelineItem } from "@readium/shared";

import { useAppDispatch } from "@/lib/hooks";
import { setAdjacentTimelineItems } from "@/lib/publicationReducer";
import { resolveChapterTitle } from "@/helpers/timelineFallback";

export const useTimelineAdjacency = (getNavigatorTimeline: () => Timeline | undefined) => {
  const dispatch = useAppDispatch();

  const updateAdjacentItems = useCallback((item: TimelineItem) => {
    const tl = getNavigatorTimeline();
    if (!tl) return;

    const { previous, next } = tl.navigableFrom(item);

    const previousHref = previous ? tl.linkFor(previous)?.href : undefined;
    const nextHref = next ? tl.linkFor(next)?.href : undefined;

    dispatch(setAdjacentTimelineItems({
      previous: previous && previousHref
        ? { title: resolveChapterTitle(tl, previous), href: previousHref }
        : null,
      next: next && nextHref
        ? { title: resolveChapterTitle(tl, next), href: nextHref }
        : null
    }));
  }, [dispatch, getNavigatorTimeline]);

  const clearAdjacentItems = useCallback(() => {
    dispatch(setAdjacentTimelineItems({ previous: null, next: null }));
  }, [dispatch]);

  return { updateAdjacentItems, clearAdjacentItems };
};
