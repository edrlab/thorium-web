"use client";

import React, { useRef } from "react";

import { StatefulSheet } from "./models/sheets";

import sheetStyles from "./assets/styles/thorium-web.sheets.module.css";

import { Popover, PopoverProps, Dialog } from "react-aria-components";

import { useWebkitPatch } from "./hooks/useWebkitPatch";
import { useFirstFocusable } from "@/core/Components/Containers/hooks/useFirstFocusable";

import classNames from "classnames";

export interface StatefulCompactPopoverSheetProps extends StatefulSheet {
  placement?: PopoverProps["placement"];
}

export const StatefulCompactPopoverSheet = ({
    id,
    triggerRef,
    heading,
    className,
    isOpen,
    onOpenChange,
    placement,
    children,
    resetFocus,
    focusWithinRef,
    focusSelector,
    scrollTopOnFocus,
    dismissEscapeKeyClose
  }: StatefulCompactPopoverSheetProps) => {
  const popoverRef = useRef<HTMLDivElement | null>(null);
  const popoverBodyRef = useRef<HTMLDivElement | null>(null);

  useFirstFocusable({
    withinRef: focusWithinRef ?? popoverBodyRef,
    trackedState: isOpen,
    withSelector: focusSelector,
    action: {
      type: "focus",
      options: {
        preventScroll: scrollTopOnFocus ? true : false,
        scrollContainerToTop: scrollTopOnFocus
      }
    },
    updateState: resetFocus
  });

  // Warning: This is a temporary fix for a bug in React Aria Components.
  useWebkitPatch(!!isOpen);

  if (React.Children.toArray(children).length > 0) {
    return(
      <>
      <Popover
        ref={ popoverRef }
        triggerRef={ triggerRef }
        placement={ placement || "bottom" }
        isOpen={ isOpen }
        onOpenChange={ onOpenChange }
        isKeyboardDismissDisabled={ dismissEscapeKeyClose }
        className={ classNames(sheetStyles.compactPopover, className) }
      >
        <Dialog
          id={ id }
          aria-label={ heading }
          className={ sheetStyles.dialog }
        >
          <div
            ref={ popoverBodyRef }
            className={ sheetStyles.body }
          >
            { children }
          </div>
        </Dialog>
      </Popover>
      </>
    ) 
  }
}
