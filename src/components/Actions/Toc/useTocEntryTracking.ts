import { useCallback, useEffect, useRef } from "react";

import { Publication, TimelineItem } from "@readium/shared";

import { useAppDispatch } from "@/lib/hooks";
import { setTocEntry } from "@/lib/publicationReducer";
import { findTocItemByHref, TocItem } from "@/helpers/buildTocTree";

// Resolves the current TOC entry for a TimelineItem via Timeline.tocEntryFor
// and maps it to our local tree's row id for highlighting.
//
// tocTreeRef: the navigator listeners are wired up once on mount, before the
// tree exists, so we read it through a ref to keep the callback identity
// stable without going stale.
//
// lastItemRef: the tree may still be empty on the very first event, so we
// re-resolve the last-seen item once the tree lands.
export const useTocEntryTracking = (publication: Publication | null, tocTree: TocItem[] | undefined) => {
  const dispatch = useAppDispatch();

  const tocTreeRef = useRef(tocTree);
  const lastItemRef = useRef<TimelineItem | undefined>(undefined);

  const resolve = useCallback((item: TimelineItem | undefined) => {
    if (!item || !publication) {
      dispatch(setTocEntry(null));
      return;
    }
    const entry = publication.timeline.tocEntryFor(item);
    const matched = entry ? findTocItemByHref(tocTreeRef.current || [], entry.link.href) : undefined;
    dispatch(setTocEntry(matched || null));
  }, [dispatch, publication]);

  useEffect(() => {
    tocTreeRef.current = tocTree;
    if (tocTree && lastItemRef.current) {
      resolve(lastItemRef.current);
    }
  }, [tocTree, resolve]);

  const updateCurrentTocEntry = useCallback((item: TimelineItem) => {
    lastItemRef.current = item;
    resolve(item);
  }, [resolve]);

  const clearCurrentTocEntry = useCallback(() => {
    lastItemRef.current = undefined;
    dispatch(setTocEntry(null));
  }, [dispatch]);

  return { updateCurrentTocEntry, clearCurrentTocEntry };
};
