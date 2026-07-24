"use client";

import React, { useRef, useEffect } from "react";

import { StatefulSheet } from "./models/sheets";
import { ThSheetHeaderVariant } from "@/preferences/models";

import sheetStyles from "./assets/styles/thorium-web.sheets.module.css";
import readerSharedUI from "../assets/styles/thorium-web.button.module.css";

import { PopoverProps } from "react-aria-components";

import { ThPopover } from "@/core/Components/Containers/ThPopover";
import { ThContainerHeader } from "@/core/Components/Containers/ThContainerHeader";
import { ThContainerBody } from "@/core/Components/Containers/ThContainerBody";
import { ThNavigationButton } from "@/core/Components/Buttons/ThNavigationButton";
import { StatefulDocker } from "../Docking/StatefulDocker";

import { useI18n } from "@/i18n";
import { useWebkitPatch } from "./hooks/useWebkitPatch";

import { useAppSelector } from "@/lib/hooks";

import classNames from "classnames";
import { prefixString } from "@/core/Helpers/prefixString";

export interface StatefulPopoverSheetProps extends StatefulSheet {
  placement?: PopoverProps["placement"];
}

export const StatefulPopoverSheet = ({ 
    id,
    triggerRef,
    heading,
    headerVariant,
    className,
    headerClassName,
    isOpen,
    onOpenChange, 
    onClosePress,
    placement,
    docker,
    children,
    resetFocus,
    focusWithinRef,
    focusSelector,
    scrollTopOnFocus,
    dismissEscapeKeyClose
  }: StatefulPopoverSheetProps) => {
  const { t } = useI18n()
  const direction = useAppSelector(state => state.reader.direction);
  const popoverRef = useRef<HTMLDivElement | null>(null);
  const popoverHeaderRef = useRef<HTMLDivElement | null>(null);
  const popoverBodyRef = useRef<HTMLDivElement | null>(null);
  const popoverCloseRef = useRef<HTMLButtonElement | null>(null);

  // Update the CSS variable when the popover is open and header ref is available
  useEffect(() => {
    if (isOpen && popoverRef.current && popoverHeaderRef.current) {
      popoverRef.current.style.setProperty(
        `--${ prefixString("sheet-sticky-header") }`,
        `${ popoverHeaderRef.current.clientHeight }px`
      );
    }
  }, [isOpen]);

  // Warning: This is a temporary fix for a bug in React Aria Components.
  useWebkitPatch(!!isOpen);

  if (React.Children.toArray(children).length > 0) {
    return(
      <>
      <ThPopover
        id={ id }
        ref={ popoverRef }
        triggerRef={ triggerRef }
        focusOptions={{
          withinRef: focusWithinRef ?? popoverBodyRef,
          trackedState: isOpen,
          fallbackRef: popoverCloseRef,
          withSelector: focusSelector,
          action: {
            type: "focus",
            options: {
              preventScroll: scrollTopOnFocus ? true : false,
              scrollContainerToTop: scrollTopOnFocus
            }
          },
          updateState: resetFocus
        }}
        placement={ placement || "bottom" }
        className={ classNames(sheetStyles.popover , className) }
        isOpen={ isOpen }
        onOpenChange={ onOpenChange } 
        isKeyboardDismissDisabled={ dismissEscapeKeyClose }
        compounds={{
          dialog: {
            className: sheetStyles.dialog
          }
        }}
      >
        <ThContainerHeader
          ref={ popoverHeaderRef }
          className={ classNames(sheetStyles.header, headerClassName) }
          label={ heading }
          compounds={{
            heading: {
              className: sheetStyles.heading
            }
          }}
        >
          { headerVariant === ThSheetHeaderVariant.previous 
            ? <ThNavigationButton 
                direction={ direction === "ltr" ? "left" : "right" }
                label={ t("reader.app.back.trigger") }
                ref={ popoverCloseRef }
                className={ classNames(className, readerSharedUI.backButton) } 
                aria-label={ t("reader.app.back.trigger") }
                onPress={ onClosePress }
              />
              : <StatefulDocker 
                id={ id }
                keys={ docker || [] }
                ref={ popoverCloseRef }
                onClose={ onClosePress }
              />
          }
        </ThContainerHeader>
        <ThContainerBody
          ref={ popoverBodyRef }
          className={ sheetStyles.body }
        >
          { children }
        </ThContainerBody>
      </ThPopover>
      </>
    ) 
  }
}