import { useCallback } from "react";

import { Publication, TimelineItem } from "@readium/shared";

import { useAppDispatch } from "@/lib/hooks";
import { setAdjacentTimelineItems } from "@/lib/publicationReducer";

// Real Timeline adjacency only — previous/next chapter lookup via the
// publication's native Timeline. No TOC involvement.
export const useTimelineAdjacency = (publication: Publication | null) => {
  const dispatch = useAppDispatch();

  const updateAdjacentItems = useCallback((item: TimelineItem) => {
    if (!publication) return;

    const tl = publication.timeline;
    const { previous, next } = tl.adjacentTo(item);

    dispatch(setAdjacentTimelineItems({
      previous: previous ? { title: previous.title, href: tl.linkFor(previous)?.href ?? "" } : null,
      next: next ? { title: next.title, href: tl.linkFor(next)?.href ?? "" } : null
    }));
  }, [dispatch, publication]);

  const clearAdjacentItems = useCallback(() => {
    dispatch(setAdjacentTimelineItems({ previous: null, next: null }));
  }, [dispatch]);

  return { updateAdjacentItems, clearAdjacentItems };
};
