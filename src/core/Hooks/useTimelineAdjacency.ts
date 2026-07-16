import { useCallback } from "react";

import { Publication, TimelineItem } from "@readium/shared";

import { useAppDispatch } from "@/lib/hooks";
import { setAdjacentTimelineItems } from "@/lib/publicationReducer";
import { resolveChapterTitle } from "@/helpers/timelineFallback";

// adjacentTo() stays resource-by-resource so every resource is reachable;
// only the label falls back to a preceding titled resource, never the target.
export const useTimelineAdjacency = (publication: Publication | null) => {
  const dispatch = useAppDispatch();

  const updateAdjacentItems = useCallback((item: TimelineItem) => {
    if (!publication) return;

    const tl = publication.timeline;
    const { previous, next } = tl.adjacentTo(item);

    dispatch(setAdjacentTimelineItems({
      previous: previous
        ? { title: resolveChapterTitle(publication, previous), href: tl.linkFor(previous)?.href ?? "" }
        : null,
      next: next
        ? { title: resolveChapterTitle(publication, next), href: tl.linkFor(next)?.href ?? "" }
        : null
    }));
  }, [dispatch, publication]);

  const clearAdjacentItems = useCallback(() => {
    dispatch(setAdjacentTimelineItems({ previous: null, next: null }));
  }, [dispatch]);

  return { updateAdjacentItems, clearAdjacentItems };
};
