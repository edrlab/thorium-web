"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import readAlongStyles from "./assets/styles/thorium-web.readAlong.module.css";
import sheetStyles from "../Sheets/assets/styles/thorium-web.sheets.module.css";
import readerStyles from "../assets/styles/thorium-web.reader.app.module.css";
import readerSharedUI from "../assets/styles/thorium-web.button.module.css";

import { SheetRef } from "react-modal-sheet";

import { ThBottomSheet } from "@/core/Components/Containers/ThBottomSheet";
import { ThContainerHeader } from "@/core/Components/Containers/ThContainerHeader";
import { ThContainerBody } from "@/core/Components/Containers/ThContainerBody";
import { ThCloseButton } from "@/core/Components/Buttons/ThCloseButton";
import { StatefulReadAlongMiniPlayer } from "./StatefulReadAlongMiniPlayer";
import { StatefulReadAlongPlayer } from "./StatefulReadAlongPlayer";

import { useBottomSheetSnap } from "../Sheets/BottomSheet/hooks";
import { useReadAlongState } from "./Hooks/useReadAlongState";
import { useI18n } from "@/i18n/useI18n";
import { useAppSelector } from "@/lib/hooks";

import classNames from "classnames";

const FALLBACK_COLLAPSED_HEIGHT = 96;

export const StatefulReadAlongSheet = ({ isOpen }: { isOpen: boolean }) => {
  const { t } = useI18n();
  const prefersReducedMotion = useAppSelector(state => state.theming.prefersReducedMotion);
  const { isExpanded, setActive, setExpanded } = useReadAlongState();

  const sheetRef = useRef<SheetRef | null>(null);
  const bodyRef = useRef<HTMLDivElement | null>(null);

  // The sheet mounts its contents after opening, so measuring has to wait for the elements
  const [headerElement, setHeaderElement] = useState<HTMLDivElement | null>(null);
  const [bodyElement, setBodyElement] = useState<HTMLDivElement | null>(null);

  const setBodyRef = useCallback((element: HTMLDivElement | null) => {
    bodyRef.current = element;
    setBodyElement(element);
  }, []);

  const [collapsedHeight, setCollapsedHeight] = useState(FALLBACK_COLLAPSED_HEIGHT);
  const [isDragging, setDragging] = useState(false);

  // Values above 1 are pixels: the collapsed point fits the mini player
  const snapArray = useMemo(() => [0, collapsedHeight, 1], [collapsedHeight]);

  const onSnap = useCallback((index: number) => {
    setDragging(false);
    if (index === 2) setExpanded(true);
    if (index === 1) setExpanded(false);
  }, [setExpanded]);

  const { onSnapCallback, onDragPressCallback, onDragKeyCallback } = useBottomSheetSnap({
    sheetRef,
    snapArray,
    onSnap
  });

  const showsPlayer = isExpanded || isDragging;

  useEffect(() => {
    if (!isOpen || showsPlayer || !headerElement || !bodyElement) return;

    const observer = new ResizeObserver(() => {
      setCollapsedHeight(headerElement.offsetHeight + bodyElement.offsetHeight);
    });
    observer.observe(headerElement);
    observer.observe(bodyElement);

    return () => {
      observer.disconnect();
    };
  }, [isOpen, showsPlayer, headerElement, bodyElement]);

  // Expanding or collapsing without dragging (shortcut, buttons, breakpoint change) must move the sheet too
  useEffect(() => {
    if (!isOpen) return;
    sheetRef.current?.snapTo(isExpanded ? 2 : 1);
  }, [isOpen, isExpanded, collapsedHeight]);

  return (
    <ThBottomSheet
      ref={ sheetRef }
      isOpen={ isOpen }
      onOpenChange={ (open) => { if (!open) setExpanded(false); } }
      isDismissable={ isExpanded }
      isKeyboardDismissDisabled={ !isExpanded }
      disableDismiss={ true }
      detent="default"
      snapPoints={ snapArray }
      initialSnap={ isExpanded ? 2 : 1 }
      onSnap={ onSnapCallback }
      onDragStart={ () => { if (!isExpanded) setDragging(true); } }
      disableScrollLocking={ !isExpanded }
      prefersReducedMotion={ prefersReducedMotion }
      focusOptions={ {
        withinRef: bodyRef,
        trackedState: isExpanded,
        action: {
          type: "focus",
          options: {
            preventScroll: true
          }
        }
      } }
      compounds={ {
        container: {
          className: classNames(sheetStyles.draggable, sheetStyles.draggableFullHeightDetent, readAlongStyles.playerSheet)
        },
        header: {
          ref: setHeaderElement
        },
        dragIndicator: {
          className: classNames(sheetStyles.dragIndicator, readAlongStyles.playerSheetDragIndicator),
          // The only control expanding and collapsing the sheet, so it needs a name
          "aria-label": isExpanded
            ? t("_pendingThoriumLocales.reader.readAlong.player.collapse")
            : t("_pendingThoriumLocales.reader.readAlong.player.expand"),
          onPress: onDragPressCallback,
          onKeyDown: onDragKeyCallback
        },
        backdrop: {
          className: readAlongStyles.miniPlayerSheetBackdrop
        }
      } }
    >
      <ThContainerHeader
        label={ t("reader.actions.readAloud.compact") }
        className={ readAlongStyles.playerSheetHeader }
        compounds={ {
          heading: {
            className: readerStyles.srOnly
          }
        } }
      >
        { isExpanded &&
          <ThCloseButton
            className={ readerSharedUI.closeButton }
            aria-label={ t("_pendingThoriumLocales.reader.readAlong.close") }
            onPress={ () => setActive(false) }
          />
        }
      </ThContainerHeader>
      <ThContainerBody
        ref={ setBodyRef }
        className={ classNames(readAlongStyles.miniPlayerSheetBody, showsPlayer && readAlongStyles.playerSheetBody) }
        inert={ showsPlayer && !isExpanded }
      >
        { showsPlayer
          ? <StatefulReadAlongPlayer />
          : <StatefulReadAlongMiniPlayer />
        }
      </ThContainerBody>
    </ThBottomSheet>
  );
};
