"use client";

import React, { CSSProperties, KeyboardEvent, useCallback, useMemo, useRef } from "react";

import { ThBottomSheetDetent, ThSheetHeaderVariant } from "@/preferences";

import { StatefulSheet } from "./models/sheets";

import sheetStyles from "./assets/styles/thorium-web.sheets.module.css";
import readerSharedUI from "../assets/styles/thorium-web.button.module.css";

import { SheetRef, SheetDetent } from "react-modal-sheet";

import { ThBottomSheet } from "@/core/Components/Containers/ThBottomSheet";
import { ThContainerHeader } from "@/core/Components/Containers/ThContainerHeader";
import { ThContainerBody } from "@/core/Components/Containers/ThContainerBody";
import { ThNavigationButton } from "@/core/Components/Buttons/ThNavigationButton";
import { ThCloseButton } from "@/core/Components/Buttons/ThCloseButton";

import { useActionsPreferences } from "@/preferences/hooks/useActionsPreferences";
import { useSharedPreferences } from "@/preferences/hooks/useSharedPreferences";
import { useI18n } from "@/i18n";

import { useAppSelector } from "@/lib/hooks";

import classNames from "classnames";
import { prefixString } from "@/core/Helpers/prefixString";

export interface StatefulBottomSheetProps extends StatefulSheet {};

export interface ScrimPref {
  active: boolean;
  override?: string;
}

const DEFAULT_SNAPPOINTS = {
  min: 0.3,
  peek: 0.5,
  max: 1
}

export const StatefulBottomSheet = ({
  id,
  heading,
  headerVariant,
  className, 
  isOpen,
  onOpenChange, 
  onClosePress,
  children,
  resetFocus,
  focusWithinRef,
  focusSelector,
  scrollTopOnFocus,
  dismissEscapeKeyClose
}: StatefulBottomSheetProps) => {
  const preferences = useActionsPreferences();
  const sharedPreferences = useSharedPreferences();
  const { t } = useI18n()
  const direction = useAppSelector((state) => state.reader.direction);
  const prefersReducedMotion = useAppSelector(state => state.theming.prefersReducedMotion);

  const sheetRef = useRef<SheetRef | null>(null);
  const sheetContainerRef = useRef<HTMLDivElement | null>(null);
  const bottomSheetBodyRef = useRef<HTMLDivElement | null>(null);
  const bottomSheetCloseRef = useRef<HTMLButtonElement | null>(null);

  const detent = useRef<ThBottomSheetDetent>("full-height");
  const isDraggable = useRef<boolean>(true);

  const snapArray = useMemo(() => {
    // Val is always checked in 0...1 range
    const getSecureVal = (val: number, ref: number) => {
      if (val > ref) {
        return val;
      } else {
        return ((1 - ref) / 2) + ref;
      }
    };

    // Since v5
    // Array needs min @ index and max @ index 2 when complete
    // If it doesn’t have a max, then peek is @ index 1.
    let snapArray: number[] = [0];

    const snapPref = preferences.actionsKeys[id].snapped;
    if (snapPref) {
      // We must start with minHeight to see if it’s 
      // constrained by a detent as it means
      // the bottom sheet is not draggable.
      // Hence why unshifting into the array instead of pushing
      if (snapPref.minHeight) {
        switch(snapPref.minHeight) {
          case "content-height":
          case "full-height":
          case 100:
            detent.current = snapPref.minHeight === 100 ? "full-height" : snapPref.minHeight;
            isDraggable.current = false;
            return [];
          default:
            const minVal = snapPref.minHeight / 100;
            // Protecting against pref > 100
            minVal > 0 && minVal < 1 
              ? snapArray.push(minVal) 
              : snapArray.push(DEFAULT_SNAPPOINTS.min);
            break;
        }
      } else {
        // Fallback value
        snapArray.push(DEFAULT_SNAPPOINTS.min);
      }

      // From now on, check if value is greater than the previous one in array
      // If not, use DEFAULT_SNAPPOINTS fallback and check it as well
      // This is to protect from cases that don’t validate min < peek < max

      // If peekHeight is constrained by a detent
      // then there is no maxHeight
      if (snapPref.peekHeight) {
        switch(snapPref.peekHeight) {
          case "content-height":
          case "full-height":
          case 100:
            detent.current = snapPref.peekHeight === 100 ? "full-height" : snapPref.peekHeight;
            snapArray.push(1);
            return snapArray;
          default:
            const peekVal = snapPref.peekHeight / 100;
            const prevVal = snapArray[0];

            peekVal > 0 && peekVal < 1
              ? snapArray.push(getSecureVal(peekVal, prevVal)) 
              : snapArray.push(getSecureVal(DEFAULT_SNAPPOINTS.peek, prevVal))
            break;
        }
      } else {
        // Fallback value
        snapArray.push(getSecureVal(DEFAULT_SNAPPOINTS.peek, snapArray[0]));
      }

      // If max-height is constrained by a content-height detent
      // then it means the bottom sheet can’t be fullscreen
      // Otherwise we can remove the top corners radii
      if (snapPref.maxHeight) {
        switch(snapPref.maxHeight) {
          case "content-height":
          case "full-height":
          case 100:
            detent.current = snapPref.maxHeight === 100 ? "full-height" : snapPref.maxHeight;
            snapArray.push(1);
            return snapArray;
          default:
            const maxVal = snapPref.maxHeight / 100;
            const prevVal = snapArray[0];

            maxVal > 0 && maxVal < 1 
              ? snapArray.push(getSecureVal(maxVal, prevVal)) 
              : snapArray.push(getSecureVal(DEFAULT_SNAPPOINTS.max, prevVal));
            break;
        }
      } else {
        // Fallback value
        snapArray.push(getSecureVal(DEFAULT_SNAPPOINTS.max, snapArray[0]));
      }
    } else {
      // There is no pref set
      // Reminder: order of React Modal Sheet is descending so min, peek, max
      snapArray.push(DEFAULT_SNAPPOINTS.min, DEFAULT_SNAPPOINTS.peek, DEFAULT_SNAPPOINTS.max);
    }

    return snapArray;
  }, [id, preferences]);

  const snapIdx = useRef<number | null>(null);

  const onDragPressCallback = useCallback(() => {
    if (snapIdx.current !== null) {
      // In [0, min, peek, max] order, cycle to next index but skip index 0
      const nextIdx = snapIdx.current === snapArray.length - 1 ? 1 : snapIdx.current + 1;
      sheetRef.current?.snapTo(nextIdx);
    }
  }, [snapArray]);

  const onDragKeyCallback = useCallback((e: KeyboardEvent) => {
    if (snapIdx.current !== null) {
      switch(e.code) {
        case "PageUp":
          if (snapIdx.current === snapArray.length - 1) return;
          sheetRef.current?.snapTo(snapArray.length - 1);
          break;
        case "ArrowUp":
          if (snapIdx.current === snapArray.length - 1) return;
          sheetRef.current?.snapTo(snapIdx.current + 1);
          break;
        case "PageDown":
          onClosePress();
          break;
        case "ArrowDown":
          if (snapIdx.current === 1) {
            onClosePress();
            break;
          }
          sheetRef.current?.snapTo(snapIdx.current - 1)
          break;
        default:
          break;
      }
    }
  }, [snapArray, onClosePress]);

  const maxWidthPref = useMemo(() => {
    const maxWidth = preferences.actionsKeys[id].snapped?.maxWidth;
    if (typeof maxWidth === "undefined") {
      return undefined;
    } else if (maxWidth === null) {
      return "100%";
    } else {
      return `${ maxWidth }px`;
    }
  }, [id, preferences]);

  const scrimPref = useMemo(() => {
    let scrimPref: ScrimPref = {
      active: false,
      override: undefined
    }
    const scrim = preferences.actionsKeys[id].snapped?.scrim ?? sharedPreferences.theming.layout.defaults.scrim;
    if (scrim) {
      scrimPref.active = true;

      if (typeof scrim === "string") {
        scrimPref.override = scrim;
      }
    }

    return scrimPref;
  }, [id, preferences, sharedPreferences]);

  const detentClassName = useMemo(() => {
    let className = "";
    if (detent.current === "content-height") {
      className = sheetStyles.draggableContentHeightDetent;
    } else {
      className = sheetStyles.draggableFullHeightDetent;
    }
    return className;
  }, [detent]);

  const scrimClassName = useMemo(() => {
    return scrimPref.active ? sheetStyles.draggableScrim : "";
  }, [scrimPref]);

  const convertDetent = (detent: ThBottomSheetDetent): SheetDetent => {
    switch(detent) {
      case "content-height":
        return "content";
      case "full-height":
        return "default";
      default:
        return "default";
    }
  };

  if (React.Children.toArray(children).length > 0) {
    return(
      <>
      <ThBottomSheet
        id={ id }
        ref={ sheetRef }
        className={ sheetStyles.draggableRoot }
        isOpen={ isOpen }
        focusOptions={{
          withinRef: focusWithinRef ?? bottomSheetBodyRef,
          trackedState: isOpen,
          fallbackRef: bottomSheetCloseRef,
          withSelector: focusSelector,
          action: {
            type: "focus",
            options: {
              preventScroll: true, // Safari needs this otherwise focus() creates artifacts on open
              scrollContainerToTop: scrollTopOnFocus
            }
          },
          updateState: resetFocus
        }}
        onOpenChange={ onOpenChange }
        isKeyboardDismissDisabled={ dismissEscapeKeyClose }
        { ...(snapArray.length > 2 
          ? { 
            snapPoints: snapArray, 
            initialSnap: 2,
            detent: convertDetent(detent.current)
          } 
          : {
            detent: convertDetent(detent.current)
          }) 
        }
        onSnap={ (index) => { snapIdx.current = index }}
        prefersReducedMotion={ prefersReducedMotion }
        compounds={ {
          container: {
            id: id,
            className: classNames(sheetStyles.draggable, detentClassName),
            ref: sheetContainerRef,
            style: {
              maxWidth: maxWidthPref
            } as CSSProperties
          },
          dragIndicator: {
            className: sheetStyles.dragIndicator,
            onPress: onDragPressCallback,
            onKeyDown: onDragKeyCallback
          },
          content: {
            className: classNames(sheetStyles.draggableContent, className),
            disableDrag: true
          },
          scroller: {
            className: sheetStyles.draggableScroller
          },
          backdrop: {
            className: classNames(sheetStyles.draggableBackdrop, scrimClassName),
            style: { [`--${ prefixString("layout-defaults-scrim") }`]: scrimPref.override }
          }
        } }
      >
        <ThContainerHeader
          label={ heading }
          className={ sheetStyles.draggableHeader }
          compounds={ {
            heading: {
              className: sheetStyles.heading
            }
          }}
        >
        { headerVariant === ThSheetHeaderVariant.previous 
            ? <ThNavigationButton 
              direction={ direction === "ltr" ? "left" : "right" }
              label={ t("reader.app.back.trigger") }
              ref={ bottomSheetCloseRef }
              className={ classNames(className, readerSharedUI.backButton) } 
              aria-label={ t("reader.app.back.trigger") }
              onPress={ onClosePress }
            /> 
            : <ThCloseButton
              ref={ bottomSheetCloseRef }
              className={ readerSharedUI.closeButton } 
              aria-label={ t("common.actions.close") } 
              onPress={ onClosePress }
            />
          }
        </ThContainerHeader>
        <ThContainerBody 
          ref={ bottomSheetBodyRef }
          className={ sheetStyles.body }
        >
          { children }
        </ThContainerBody>
      </ThBottomSheet>
      </>
    )
  }
}