"use client";

import { useEffect, useRef } from "react";

// Play/pause is disabled while loading, so focus waits for it, but only once per mount
export const usePlayPauseFocus = (isDisabled: boolean) => {
  const ref = useRef<HTMLButtonElement | null>(null);
  // Without user input yet, the player was restored on load rather than turned on, and focus stays where it is
  const isPending = useRef(typeof navigator === "undefined" || (navigator.userActivation?.hasBeenActive ?? true));

  useEffect(() => {
    if (!isPending.current || isDisabled || !ref.current) return;
    isPending.current = false;
    ref.current.focus({ preventScroll: true });
  }, [isDisabled]);

  return ref;
};
