"use client";

import { useEffect, useRef } from "react";

// Play/pause is disabled while loading, so focus waits for it, but only once per mount
export const usePlayPauseFocus = (isDisabled: boolean) => {
  const ref = useRef<HTMLButtonElement | null>(null);
  const isPending = useRef(true);

  useEffect(() => {
    if (!isPending.current || isDisabled || !ref.current) return;
    isPending.current = false;
    ref.current.focus({ preventScroll: true });
  }, [isDisabled]);

  return ref;
};
