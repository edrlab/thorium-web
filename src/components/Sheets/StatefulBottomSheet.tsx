"use client";

import React, { CSSProperties, KeyboardEvent, useCallback, useMemo, useRef } from "react";

import { ThBottomSheetDetent, ThSheetHeaderVariant } from "@/preferences";

import { useLocale } from "../Epub/AppLocale";

import { StatefulSheet } from "./models/sheets";

import sheetStyles from "./assets/styles/sheets.module.css";
import readerSharedUI from "../assets/styles/readerSharedUI.module.css";

import { SheetRef } from "react-modal-sheet";

import { ThBottomSheet } from "@/core/Components/Containers/ThBottomSheet";
import { ThContainerHeader } from "@/core/Components/Containers/ThContainerHeader";
import { ThContainerBody } from "@/core/Components/Containers/ThContainerBody";
import { ThNavigationButton } from "@/core/Components/Buttons/ThNavigationButton";
import { ThCloseButton } from "@/core/Components/Buttons/ThCloseButton";

import { usePreferences } from "@/preferences/hooks/usePreferences";

import { useAppSelector } from "@/lib/hooks";

import classNames from "classnames";

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
  dismissEscapeKeyClose
}: StatefulBottomSheetProps) => {
  const RSPrefs = usePreferences();
  const locale = useLocale();
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

    // Array needs max @ index 0 and min @ index 2 when complete
    // If it doesn’t have a max, then peek is @ index 0. This means
    // the initialProp should always be one item from last
    let snapArray: number[] = [];

    const snapPref = RSPrefs.actions.keys[id as keyof typeof RSPrefs.actions.keys].snapped;
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
              ? snapArray.unshift(minVal) 
              : snapArray.unshift(DEFAULT_SNAPPOINTS.min);
            break;
        }
      } else {
        // Fallback value
        snapArray.unshift(DEFAULT_SNAPPOINTS.min);
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
            snapArray.unshift(1);
            return snapArray;
          default:
            const peekVal = snapPref.peekHeight / 100;
            const prevVal = snapArray[0];

            peekVal > 0 && peekVal < 1
              ? snapArray.unshift(getSecureVal(peekVal, prevVal)) 
              : snapArray.unshift(getSecureVal(DEFAULT_SNAPPOINTS.peek, prevVal))
            break;
        }
      } else {
        // Fallback value
        snapArray.unshift(getSecureVal(DEFAULT_SNAPPOINTS.peek, snapArray[0]));
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
            snapArray.unshift(1);
            return snapArray;
          default:
            const maxVal = snapPref.maxHeight / 100;
            const prevVal = snapArray[0];

            maxVal > 0 && maxVal < 1 
              ? snapArray.unshift(getSecureVal(maxVal, prevVal)) 
              : snapArray.unshift(getSecureVal(DEFAULT_SNAPPOINTS.max, prevVal));
            break;
        }
      } else {
        // Fallback value
        snapArray.unshift(getSecureVal(DEFAULT_SNAPPOINTS.max, snapArray[0]));
      }
    } else {
      // There is no pref set
      // Reminder: order of React Modal Sheet is descending so max, peek, min
      snapArray.push(DEFAULT_SNAPPOINTS.max, DEFAULT_SNAPPOINTS.peek, DEFAULT_SNAPPOINTS.min);
    }

    return snapArray;
  }, [id, RSPrefs]);

  const snapIdx = useRef<number | null>(null);

  const onDragPressCallback = useCallback(() => {
    if (snapIdx.current !== null) {
      // Don’t forget we’re having to handle max @ 0 and min @ 2 (decreasing order)
      const nextIdx = snapIdx.current === 0 ? snapArray.length - 1 : (snapIdx.current - 1);
      sheetRef.current?.snapTo(nextIdx);
    }
  }, [snapArray]);

  const onDragKeyCallback = useCallback((e: KeyboardEvent) => {
    if (snapIdx.current !== null) {
      // Don’t forget we’re having to handle max @ 0 and min @ 2 (decreasing order)
      // Implementation is being kept consistent with React Resizable Panels, which
      // implements this logic by default for PanelResizeHandle when focused
      switch(e.code) {
        case "PageUp":
          if (snapIdx.current === 0) return;
          sheetRef.current?.snapTo(0);
          break;
        case "ArrowUp":
          if (snapIdx.current === 0) return;
          sheetRef.current?.snapTo(snapIdx.current - 1);
          break;
        case "PageDown":
          onClosePress();
          break;
        case "ArrowDown":
          if (snapIdx.current === snapArray.length - 1) {
            onClosePress();
            break;
          }
          sheetRef.current?.snapTo(snapIdx.current + 1)
          break;
        default:
          break;
      }
    }
  }, [snapArray, onClosePress]);

  const maxWidthPref = useMemo(() => {
    const maxWidth = RSPrefs.actions.keys[id as keyof typeof RSPrefs.actions.keys].snapped?.maxWidth;
    if (typeof maxWidth === "undefined") {
      return undefined;
    } else if (maxWidth === null) {
      return "100%";
    } else {
      return `${ maxWidth }px`;
    }
  }, [id, RSPrefs]);

  const scrimPref = useMemo(() => {
    let scrimPref: ScrimPref = {
      active: false,
      override: undefined
    }
    const scrim = RSPrefs.actions.keys[id as keyof typeof RSPrefs.actions.keys].snapped?.scrim;
    if (scrim) {
      scrimPref.active = true;

      if (typeof scrim === "string") {
        scrimPref.override = scrim;
      }
    }

    return scrimPref;
  }, [id, RSPrefs]);

  const detentClassName = useMemo(() => {
    let className = "";
    if (detent.current === "content-height") {
      className = sheetStyles.bottomSheetModalContentHeightDetent;
    } else {
      className = sheetStyles.bottomSheetModalFullHeightDetent;
    }
    return className;
  }, [detent]);

  const scrimClassName = useMemo(() => {
    return scrimPref.active ? sheetStyles.bottomSheetScrim : "";
  }, [scrimPref]);

  if (React.Children.toArray(children).length > 0) {
    return(
      <>
      <ThBottomSheet
        id={ id }
        ref={ sheetRef }
        isOpen={ isOpen }
        focusOptions={{
          withinRef: focusWithinRef ?? bottomSheetBodyRef,
          trackedState: isOpen,
          fallbackRef: bottomSheetCloseRef,
          updateState: resetFocus
        }}
        onOpenChange={ onOpenChange }
        isKeyboardDismissDisabled={ dismissEscapeKeyClose }
        { ...(snapArray.length > 1 
          ? { 
            snapPoints: snapArray, 
            initialSnap: snapArray.length - 2,
            detent: detent.current
          } 
          : {
            detent: detent.current
          }) 
        }
        onSnap={ (index) => { snapIdx.current = index }}
        prefersReducedMotion={ prefersReducedMotion }
        compounds={ {
          container: {
            className: classNames(sheetStyles.bottomSheetModal, detentClassName),
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
            className: classNames(sheetStyles.bottomSheet, className),
            disableDrag: true
          },
          scroller: {
            className: classNames(sheetStyles.bottomSheetScroller, sheetStyles.sheetBody),
            draggable: false
          },
          backdrop: {
            className: classNames(sheetStyles.bottomSheetBackdrop, scrimClassName),
            style: { "--defaults-scrim": scrimPref.override }
          }
        } }
      >
        <ThContainerHeader
          label={ heading }
          className={ sheetStyles.bottomSheetHeader }
          compounds={ {
            heading: {
              className: sheetStyles.sheetHeading
            }
          }}
        >
        { headerVariant === ThSheetHeaderVariant.previous 
            ? <ThNavigationButton 
              direction={ direction === "ltr" ? "left" : "right" }
              label={ locale.reader.app.back.trigger }
              ref={ bottomSheetCloseRef }
              className={ classNames(className, readerSharedUI.backButton) } 
              aria-label={ locale.reader.app.back.trigger }
              onPress={ onClosePress }
            /> 
            : <ThCloseButton
              ref={ bottomSheetCloseRef }
              className={ readerSharedUI.closeButton } 
              aria-label={ locale.reader.app.docker.close.trigger } 
              onPress={ onClosePress }
            />
          }
        </ThContainerHeader>
        <ThContainerBody 
          ref={ bottomSheetBodyRef }
        >
          { children }
        </ThContainerBody>
      </ThBottomSheet>
      </>
    )
  }
}