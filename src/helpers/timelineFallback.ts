import { Timeline, TimelineItem } from "@readium/shared";

// A TOC entry can span several resources with only the first one titled.
// Walks backward from `href`, resolved fresh each call (so it works for
// non-linear navigation too), stopping at the first defined result.
const walkPrecedingResources = <T,>(
  timeline: Timeline,
  href: string,
  resolve: (candidate: TimelineItem, stepsBack: number) => T | undefined
): T | undefined => {
  const timelineItems = timeline.items;
  const startIndex = timelineItems.findIndex(item => timeline.linkFor(item)?.href === href);
  if (startIndex === -1) return undefined;

  for (let i = startIndex - 1; i >= 0; i--) {
    const candidate = timelineItems[i];
    if (!candidate) continue;
    const result = resolve(candidate, startIndex - i);
    if (result !== undefined) return result;
  }

  return undefined;
};

// Falls back to a preceding resource's title; appends "(N)" when inherited so repeated
// labels (e.g. next/next) don't look identical.
// `timeline` must come from the navigator (not `publication.timeline` directly) so it
// stays the single source of truth across every module that reads it.
export const resolveChapterTitle = (
  timeline: Timeline,
  item: TimelineItem
): string | undefined => {
  if (item.title !== undefined) return item.title;

  const href = timeline.linkFor(item)?.href;
  if (!href) return undefined;

  return walkPrecedingResources(timeline, href, (candidate, stepsBack) =>
    candidate.title !== undefined ? `${ candidate.title } (${ stepsBack + 1 })` : undefined
  );
};
