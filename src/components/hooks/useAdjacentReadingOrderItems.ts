import { Link, Links } from "@readium/shared";

import { useAppSelector } from "@/lib/hooks";

export const useAdjacentReadingOrderItems = (
  readingOrder: Links | undefined
): { previous: Link | null; next: Link | null } => {
  const currentIndex = useAppSelector(state => state.publication.progress?.progression?.currentIndex);

  if (!readingOrder || currentIndex === undefined) return { previous: null, next: null };

  const index = currentIndex - 1; // currentIndex is 1-based, see usePublicationProgress.ts

  return {
    previous: index > 0 ? readingOrder.items[index - 1] : null,
    next: index < readingOrder.items.length - 1 ? readingOrder.items[index + 1] : null
  };
};
