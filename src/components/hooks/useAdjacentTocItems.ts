import { TocItem } from "@/helpers/buildTocTree";
import { useAppSelector } from "@/lib/hooks";

const flattenTocTree = (items: TocItem[]): TocItem[] => {
  const result: TocItem[] = [];
  for (const item of items) {
    if (item.href) result.push(item);
    if (item.children) result.push(...flattenTocTree(item.children));
  }
  return result;
};

export const useAdjacentTocItems = (): { previous: TocItem | null; next: TocItem | null } => {
  const tocTree = useAppSelector(state => state.publication.toc?.tree);
  const tocCurrentEntry = useAppSelector(state => state.publication.toc?.currentEntry);

  if (!tocTree || !tocCurrentEntry) return { previous: null, next: null };

  const flat = flattenTocTree(tocTree);
  const index = flat.findIndex(item => item.href === tocCurrentEntry.href);

  if (index < 0) return { previous: null, next: null };

  return {
    previous: index > 0 ? flat[index - 1] : null,
    next: index < flat.length - 1 ? flat[index + 1] : null,
  };
};
