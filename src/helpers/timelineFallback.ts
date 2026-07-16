import { Publication, TimelineItem } from "@readium/shared";

// A TOC entry can span several resources with only the first one titled.
// Walks backward from `href`, resolved fresh each call (so it works for
// non-linear navigation too), stopping at the first defined result.
const walkPrecedingResources = <T,>(
  publication: Publication,
  href: string,
  resolve: (candidate: TimelineItem, stepsBack: number) => T | undefined
): T | undefined => {
  const startIndex = publication.readingOrder.items.findIndex(link => link.href === href);
  if (startIndex === -1) return undefined;

  const timelineItems = publication.timeline.items;
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
export const resolveChapterTitle = (
  publication: Publication,
  item: TimelineItem
): string | undefined => {
  if (item.title !== undefined) return item.title;

  const href = publication.timeline.linkFor(item)?.href;
  if (!href) return undefined;

  return walkPrecedingResources(publication, href, (candidate, stepsBack) =>
    candidate.title !== undefined ? `${ candidate.title } (${ stepsBack + 1 })` : undefined
  );
};
