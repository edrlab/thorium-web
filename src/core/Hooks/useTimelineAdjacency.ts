import { useCallback } from "react";

import { Publication, Timeline, TimelineItem } from "@readium/shared";

import { useAppDispatch } from "@/lib/hooks";
import { setAdjacentTimelineItems } from "@/lib/publicationReducer";
import { resolveChapterTitle } from "@/helpers/timelineFallback";

// A TimelineItem with children (a resource whose own bare href has no toc
// entry, only a fragment further in) is a container, not a real stop: its
// content is identical to its first child's. adjacentTo() still counts it as
// one step, which stalls previous/next on that duplicate position instead of
// reaching the actual previous/next resource. Walk past it: further back for
// previous, into the first child for next.
const skipContainer = (tl: Timeline, item: TimelineItem | undefined, direction: "previous" | "next"): TimelineItem | undefined => {
  let current = item;
  while (current?.children?.length) {
    current = direction === "previous" ? tl.adjacentTo(current).previous : current.children[0];
  }
  return current;
};

export const useTimelineAdjacency = (publication: Publication | null) => {
  const dispatch = useAppDispatch();

  const updateAdjacentItems = useCallback((item: TimelineItem) => {
    if (!publication) return;

    const tl = publication.timeline;
    const adjacent = tl.adjacentTo(item);
    const previous = skipContainer(tl, adjacent.previous, "previous");
    const next = skipContainer(tl, adjacent.next, "next");

    const previousHref = previous ? tl.linkFor(previous)?.href : undefined;
    const nextHref = next ? tl.linkFor(next)?.href : undefined;

    // A TimelineItem with no resolvable Link is not a valid navigation
    // target - treat it as absent rather than emit a button with an empty href.
    dispatch(setAdjacentTimelineItems({
      previous: previous && previousHref
        ? { title: resolveChapterTitle(publication, previous), href: previousHref }
        : null,
      next: next && nextHref
        ? { title: resolveChapterTitle(publication, next), href: nextHref }
        : null
    }));
  }, [dispatch, publication]);

  const clearAdjacentItems = useCallback(() => {
    dispatch(setAdjacentTimelineItems({ previous: null, next: null }));
  }, [dispatch]);

  return { updateAdjacentItems, clearAdjacentItems };
};
