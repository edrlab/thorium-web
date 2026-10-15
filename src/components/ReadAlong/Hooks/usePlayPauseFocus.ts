"use client";

import { useEffect, useRef } from "react";

import { useAppSelector } from "@/lib/hooks";

// Play/pause is disabled while loading, so focus waits for it, but only once per mount
export const usePlayPauseFocus = (isDisabled: boolean) => {
  const ref = useRef<HTMLButtonElement | null>(null);
  const isReaderLoading = useAppSelector(state => state.reader.isLoading);
  // Mounted with the reader, so restored on load rather than turned on, and focus stays where it is
  const isPending = useRef(!isReaderLoading);

  useEffect(() => {
    if (!isPending.current || isDisabled || !ref.current) return;
    isPending.current = false;
    ref.current.focus({ preventScroll: true });
  }, [isDisabled]);

  return ref;
};
