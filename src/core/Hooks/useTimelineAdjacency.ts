import { useCallback } from "react";

import { Timeline, TimelineItem } from "@readium/shared";

import { useAppDispatch } from "@/lib/hooks";
import { setAdjacentTimelineItems } from "@/lib/publicationReducer";
import { resolveChapterTitle } from "@/helpers/timelineFallback";

// adjacentTo() stays resource-by-resource so every resource is reachable;
// only the label falls back to a preceding titled resource, never the target.
export const useTimelineAdjacency = (getNavigatorTimeline: () => Timeline | undefined) => {
  const dispatch = useAppDispatch();

  const updateAdjacentItems = useCallback((item: TimelineItem) => {
    const tl = getNavigatorTimeline();
    if (!tl) return;

    const { previous, next } = tl.navigableFrom(item);

    dispatch(setAdjacentTimelineItems({
      previous: previous
        ? { title: resolveChapterTitle(tl, previous), href: tl.linkFor(previous)?.href ?? "" }
        : null,
      next: next
        ? { title: resolveChapterTitle(tl, next), href: tl.linkFor(next)?.href ?? "" }
        : null
    }));
  }, [dispatch, getNavigatorTimeline]);

  const clearAdjacentItems = useCallback(() => {
    dispatch(setAdjacentTimelineItems({ previous: null, next: null }));
  }, [dispatch]);

  return { updateAdjacentItems, clearAdjacentItems };
};
