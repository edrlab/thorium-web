import { ContextualizedTocEntry, Timeline } from "@readium/shared";

export interface TocItem {
  id: string;
  href: string;
  title: string;
  position?: string;
  children?: TocItem[];
}

export type TocEntryRef = Omit<TocItem, "children">;

export const toEntryRef = ({ children: _, ...ref }: TocItem): TocEntryRef => ref;

export const buildTocTreeFromTimeline = (timeline: Timeline, publicationTitle?: string): TocItem[] => {
  let counter = 0;

  const map = (entries: ContextualizedTocEntry[]): TocItem[] =>
    entries.map((entry) => {
      counter += 1;

      return {
        id: `toc-${ counter }`,
        href: entry.link.href,
        title: entry.link.title || (
          publicationTitle
            ? `${ publicationTitle } ${ counter }`
            : `Resource ${ counter }`
        ),
        position: entry.position ?? entry.timestamp,
        children: entry.children ? map(entry.children) : undefined
      };
    });

  return map(timeline.contextualizedToc);
};

export const findTocItemById = (items: TocItem[], id: string): TocItem | undefined => {
  for (const item of items) {
    if (item.id === id) return item;
    if (item.children) {
      const found = findTocItemById(item.children, id);
      if (found) return found;
    }
  }
  return undefined;
};

export const findTocItemByHref = (items: TocItem[], href: string): TocItem | undefined => {
  for (const item of items) {
    if (item.href === href) return item;
    if (item.children) {
      const found = findTocItemByHref(item.children, href);
      if (found) return found;
    }
  }
  return undefined;
};
