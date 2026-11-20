"use client";

import React, { useContext, useEffect } from "react";

import { Tooltip, TooltipContext, TooltipProps, TooltipTriggerStateContext, useSlottedContext } from "react-aria-components";

import { isActiveElement } from "@/core/Helpers/focusUtilities";

// RAC's Tooltip gets stuck in its exit state after an instant (warmup swap) close, then renders unpositioned at 0,0.
// Unmounting it after instant closes resets that state.
export const ThTooltip = (props: TooltipProps & { ref?: React.Ref<HTMLDivElement> }) => {
  const state = useContext(TooltipTriggerStateContext);
  const triggerRef = useSlottedContext(TooltipContext)?.triggerRef;

  const isOpen = !!state?.isOpen;

  // RAC stops Escape from reaching the trigger while the tooltip is open, so blur it from here.
  useEffect(() => {
    if (!isOpen) return;

    const blurOnEsc = (event: KeyboardEvent) => {
      const trigger = triggerRef?.current;
      if (event.key === "Escape" && trigger instanceof HTMLElement && isActiveElement(trigger)) {
        trigger.blur();
      }
    };

    document.addEventListener("keydown", blurOnEsc, true);
    return () => document.removeEventListener("keydown", blurOnEsc, true);
  }, [isOpen, triggerRef]);

  if (state && !state.isOpen && state.shouldSkipAnimation) return null;

  return <Tooltip { ...props } />;
};
