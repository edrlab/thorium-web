import { useEffect } from "react";

import { Publication, Timeline } from "@readium/shared";

import { useAppDispatch } from "@/lib/hooks";
import { setTocTree } from "@/lib/publicationReducer";
import { buildTocTreeFromTimeline } from "@/helpers/buildTocTree";

// Builds and dispatches the TOC tree once, when the navigator reports it has
// actually loaded. Per-format position/timestamp data is populated as a side
// effect of accessing the navigator's own `timeline` getter (not
// publication.timeline directly) — going through it here, gated on
// navigatorReady, means this stays correct regardless of whether (or when) a
// given format's navigator introduces or changes that timing dependency.
export const useTocTreeBuilder = (
  publication: Publication | null,
  navigatorReady: boolean,
  getNavigatorTimeline: () => Timeline | undefined
) => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (!navigatorReady || !publication) return;

    const navigatorTimeline = getNavigatorTimeline();
    if (!navigatorTimeline) return;

    const publicationTitle = publication.metadata.title.getTranslation("en");
    dispatch(setTocTree(buildTocTreeFromTimeline(navigatorTimeline, publicationTitle)));
  }, [navigatorReady, publication, getNavigatorTimeline, dispatch]);
};
