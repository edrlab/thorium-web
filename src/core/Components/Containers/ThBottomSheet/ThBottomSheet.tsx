"use client";

import React, { 
  RefObject, 
  useCallback, 
  useEffect, 
  useMemo, 
  useState 
} from "react";

import { OverlayTriggerState, useOverlayTriggerState } from "react-stately";

import { ThContainerHeader, ThContainerHeaderProps } from "../ThContainerHeader";
import { ThContainerBody } from "../ThContainerBody";
import { ThContainerProps } from "../ThContainer";

import { ThDragIndicatorButton, ThDragIndicatorButtonProps } from "./ThDragIndicatorButton";

import { Sheet, SheetDetent, SheetRef } from "react-modal-sheet";
import { HeadingProps } from "react-aria-components";
import { 
  AriaOverlayProps, 
  FocusScope, 
  OverlayProvider, 
  useDialog, 
  useModal, 
  useObjectRef, 
  useOverlay 
} from "react-aria";

import { useTransform } from "motion/react";
import { useFirstFocusable, UseFirstFocusableProps } from "../hooks/useFirstFocusable";

export interface ThBottomSheetHeaderProps extends ThContainerHeaderProps {
  wrapper: React.ComponentProps<typeof Sheet.Header>,
  dragIndicator: React.ComponentProps<typeof ThDragIndicatorButton>,
  header: ThContainerHeaderProps,
  heading: HeadingProps
}

export interface ThBottomSheetCompounds {
  container?: Omit<React.ComponentProps<typeof Sheet.Container>, "children">,
  header?: React.ComponentProps<typeof Sheet.Header>,
  dragIndicator?: ThDragIndicatorButtonProps,
  scroller?: { 
    ref?: React.RefObject<HTMLDivElement>; 
    className?: string; 
  },
  content?: React.ComponentProps<typeof Sheet.Content>,
  backdrop?: React.ComponentProps<typeof Sheet.Backdrop>
}

export interface ThBottomSheetProps extends Omit<React.ComponentProps<typeof Sheet>, "children" | "ref" | "isOpen" | "onClose">, AriaOverlayProps, ThContainerProps {
  onOpenChange?: (isOpen: boolean) => void;
  isKeyboardDismissDisabled?: boolean;
  compounds?: ThBottomSheetCompounds;
}

const ThBottomSheetContainer = ({
  sheetRef,
  sheetState,
  isDraggable, 
  isDismissable,
  isKeyboardDismissDisabled,
  focusOptions,
  detent,
  compounds,
  children
}: {
  sheetRef: RefObject<HTMLDivElement | SheetRef | null>;
  sheetState: OverlayTriggerState;
  onFullHeight?: Omit<React.ComponentProps<typeof Sheet.Container>, "children">;
  isDraggable?: boolean;
  isDismissable?: boolean;
  isKeyboardDismissDisabled?: boolean;
  focusOptions?: UseFirstFocusableProps;
  detent?: SheetDetent;
  compounds?: ThBottomSheetCompounds;
  children: ThContainerProps["children"];
}) => {
  const containerRef = useObjectRef(compounds?.container?.ref);
  const scrollerRef = useObjectRef(compounds?.scroller?.ref);
  const dialog = useDialog({}, containerRef);
  const overlay = useOverlay({ 
    onClose: sheetState.close, 
    isOpen: true, 
    isDismissable: isDismissable,
    isKeyboardDismissDisabled: isKeyboardDismissDisabled
  }, containerRef);
  const [isFullHeight, setFullHeight] = useState<boolean>(false);

  const autoPadding = useTransform(() => {
    return (sheetRef.current as SheetRef)?.y.get() ?? 0;
  });

  // Apply scroller className from compounds
  useEffect(() => {
    if (!scrollerRef.current || !compounds?.scroller?.className) return;
    scrollerRef.current.className = compounds.scroller.className;
  }, [scrollerRef, compounds?.scroller]);

  useEffect(() => {
    if (!isDraggable || !scrollerRef.current) return;

    // We need this so that scrolling into the scrollerRef does not shift Sheet.content
    scrollerRef.current.style.overscrollBehavior = "contain";
    scrollerRef.current.style.contain = "content";
  }, [isDraggable, scrollerRef]);

  useModal();

  const fullHeightIntersectionCallback = useCallback((entries: IntersectionObserverEntry[]) => {
    entries.forEach( (entry) => {
      if (
          detent === "default" &&
          entry.isIntersecting && 
          entry.intersectionRatio === 1 && 
          // For some reason width is larger on mobile (and border-right is almost invisible)…
          entry.boundingClientRect.width >= window.innerWidth
        ) {
          setFullHeight(true);
      } else {
        setFullHeight(false);
      }
    });
  }, [setFullHeight, detent]);

  useEffect(() => {
    const observer = new IntersectionObserver(fullHeightIntersectionCallback, {
      threshold: 1.0
    });
    containerRef.current && observer.observe(containerRef.current);

    return () => {
      observer.disconnect();
    }
  });

  const [Header, Body] = useMemo(() => {
    const header = children.find((child) => child.type === ThContainerHeader);
    const body = children.find((child) => child.type === ThContainerBody);
    
    const modifiedHeader = header ? React.cloneElement(header as React.ReactElement<ThContainerHeaderProps>, {
      ...header.props,
      compounds: {
        ...(header.props as ThContainerHeaderProps).compounds,
        heading: {
          ...(header.props as ThContainerHeaderProps).compounds?.heading,
          ...dialog.titleProps
        }
      }
    }) : null;

    return [modifiedHeader, body];
  }, [children, dialog.titleProps]);

  const updatedFocusOptions = useMemo(() => 
    focusOptions ? {
      ...focusOptions,
      scrollerRef: scrollerRef
    } : undefined,
    [focusOptions, scrollerRef]
  );

  useFirstFocusable(updatedFocusOptions);

  return (
    <>
    <Sheet.Container 
      { ...compounds?.container }
      ref={ containerRef }
      {...(isFullHeight ? { "data-full-height": "true" } : {} )}
      { ...overlay.overlayProps as any}
      { ...dialog.dialogProps }
    >
      <Sheet.Header
        { ...compounds?.header }
      >
        { isDraggable && 
          <ThDragIndicatorButton 
            { ...compounds?.dragIndicator }
          /> 
        }
        { Header }
      </Sheet.Header>
      <Sheet.Content 
        scrollRef={ scrollerRef }
        { ...compounds?.content }
        { ...(isDraggable && compounds?.content?.disableDrag ? { style: { ...compounds?.content?.style, paddingBottom: autoPadding } as { [key: string]: any }} : {})}
      >
        { Body }
      </Sheet.Content>
    </Sheet.Container>
    <Sheet.Backdrop 
      { ...compounds?.backdrop }
    />
    </>
  )
}

export const ThBottomSheet = ({
  isOpen,
  onOpenChange,
  ref,
  focusOptions,
  isDismissable = true,
  isKeyboardDismissDisabled,
  detent,
  snapPoints,
  compounds,
  children, 
  ...props
}: ThBottomSheetProps) => {
  const resolvedRef = useObjectRef(ref);

  let sheetState = useOverlayTriggerState({
    isOpen: isOpen,
    onOpenChange: onOpenChange
  });

  const isDraggable = useMemo(() => snapPoints && snapPoints.length > 1, [snapPoints]);

  return(
    <>
    <Sheet
      ref={ resolvedRef }
      isOpen={ sheetState.isOpen }
      onClose={ sheetState.close }
      detent={ detent }
      snapPoints={ snapPoints }
      { ...props }
    >
      <OverlayProvider>
        <FocusScope 
          contain={ isDismissable } 
          // If not set to true, focus is not contained on open
          autoFocus={ isDismissable } 
          restoreFocus={ true }
        >
          <ThBottomSheetContainer 
            sheetRef={ resolvedRef } 
            sheetState={ sheetState } 
            isDraggable= { isDraggable }
            isDismissable={ isDismissable }
            isKeyboardDismissDisabled={ isKeyboardDismissDisabled }
            focusOptions={ focusOptions }
            detent={ detent }
            compounds={ compounds }
          >
            { children }
          </ThBottomSheetContainer>
      </FocusScope>
    </OverlayProvider>
  </Sheet> 
  </>
  )
}