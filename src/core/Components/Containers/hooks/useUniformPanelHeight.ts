"use client";

import { RefObject, useEffect, useLayoutEffect, useRef } from "react";

export interface UseUniformPanelHeightProps {
  ref: RefObject<HTMLElement | null>;
  isEnabled?: boolean;
  isOpen: boolean;
  /**
   * Identifies the panel shown. The one shown on open sets the height of the others.
   */
  panel?: unknown;
}

export const useUniformPanelHeight = ({
  ref,
  isEnabled,
  isOpen,
  panel
}: UseUniformPanelHeightProps) => {
  const isActive = !!isEnabled && isOpen;
  const mainPanel = useRef<{ key: unknown } | null>(null);
  const mainPanelHeight = useRef<number | null>(null);

  // Layout effect so a switched panel never paints at its own height
  useLayoutEffect(() => {
    if (!isActive) {
      mainPanel.current = null;
      mainPanelHeight.current = null;
      return;
    }

    if (!mainPanel.current) mainPanel.current = { key: panel };

    const element = ref.current;
    if (!element) return;

    if (panel === mainPanel.current.key) {
      element.style.removeProperty("height");
    } else if (mainPanelHeight.current !== null) {
      element.style.height = `${ mainPanelHeight.current }px`;
    }
  }, [ref, isActive, panel]);

  useEffect(() => {
    const element = ref.current;
    if (!isActive || !element) return;

    const observer = new ResizeObserver(() => {
      if (!element.style.height) mainPanelHeight.current = element.offsetHeight;
    });
    observer.observe(element);

    return () => {
      observer.disconnect();
      element.style.removeProperty("height");
    };
  }, [ref, isActive]);
};
