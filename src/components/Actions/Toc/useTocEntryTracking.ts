import { useCallback, useEffect, useRef } from "react";

import { Publication, TimelineItem } from "@readium/shared";

import { useAppDispatch } from "@/lib/hooks";
import { setTocEntry } from "@/lib/publicationReducer";
import { findTocItemByHref, TocItem } from "@/helpers/buildTocTree";

// Resolves the current TOC entry from a TimelineItem via Timeline.tocEntryFor
// (which also handles the nearest-preceding-entry fallback for mid-resource
// positions), then maps its href back to the corresponding row in our locally
// built tree so the UI can key/highlight by that row's stable id.
//
// Reads `tocTree` through a ref rather than closing over it: the navigator
// listeners this feeds are wired up once, in a mount effect with an empty
// dependency array (see EpubNavigatorLoad/WebPubNavigatorLoad/AudioNavigatorLoad),
// so the closure the navigator actually calls is frozen at first render — well
// before the tree has been built. Reading through a ref means the callback's
// *identity* can stay frozen without its *behavior* going stale.
//
// The tree also isn't guaranteed to exist yet by the time the very first
// timelineItemChanged fires (tree-building is itself gated on the navigator
// being ready) — so the opening chapter's own event can race the tree build
// and resolve to nothing. Track the last-seen item and re-resolve it whenever
// the tree updates, so that race can't leave the current entry stuck at null.
export const useTocEntryTracking = (publication: Publication | null, tocTree: TocItem[] | undefined) => {
  const dispatch = useAppDispatch();

  const tocTreeRef = useRef(tocTree);
  const lastItemRef = useRef<TimelineItem | undefined>(undefined);

  const resolve = useCallback((item: TimelineItem | undefined) => {
    if (!item) {
      dispatch(setTocEntry(null));
      return;
    }
    const entry = publication?.timeline.tocEntryFor(item);
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
