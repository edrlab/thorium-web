"use client";

import { useEffect, useRef, RefObject } from "react";
import { usePrevious } from "../../../Hooks/usePrevious";

type ScrollOptions = {
  behavior?: ScrollBehavior;
  block?: ScrollLogicalPosition;
  inline?: ScrollLogicalPosition;
};

type Action = 
  | { 
      type: "focus";
      options?: {
        preventScroll?: boolean;
        scrollContainerToTop?: boolean;
      };
    }
  | { 
      type: "scrollIntoView";
      options?: ScrollOptions;
    }
  | { 
      type: "none";
    };

export interface UseFirstFocusableProps {
  withinRef: RefObject<HTMLElement | null>;
  fallbackRef?: RefObject<HTMLElement | null>;
  scrollerRef?: RefObject<HTMLElement | null>;
  trackedState?: boolean;
  updateState?: unknown;
  action?: Action;
  withSelector?: string;
}

const isInViewport = (element: Element, container: Element | null = null): boolean => {
  const elementRect = element.getBoundingClientRect();
  const containerRect = container?.getBoundingClientRect() ?? {
    top: 0,
    bottom: window.innerHeight,
    left: 0,
    right: window.innerWidth
  };

  return (
    elementRect.top >= containerRect.top &&
    elementRect.bottom <= containerRect.bottom &&
    elementRect.left >= containerRect.left &&
    elementRect.right <= containerRect.right
  );
};

// WARNING: This hook is not a general purpose hook, 
// it is specifically designed to be used with React Aria Components
// It is not recommended to use it with other libraries or components
export const useFirstFocusable = (props?: UseFirstFocusableProps) => {
  const { 
    withinRef, 
    fallbackRef, 
    scrollerRef, 
    trackedState, 
    updateState,
    action = { type: "none" }, // Default to no action if not provided
    withSelector
  } = props || {};

  // Store action in a ref to avoid triggering useEffect on action change
  // action will be updated on every render, but ref will not trigger useEffect
  const actionRef = useRef(action);
  actionRef.current = action;

  const focusableElement = useRef<HTMLElement | null>(null);
  const attemptsRef = useRef(0);
  const timeoutRef = useRef<number | null>(null);

  const previousUpdateState = usePrevious(updateState);
  const previousTrackedState = usePrevious(trackedState);

  useEffect(() => {
    if (!withinRef) return;
    
    // Nothing to focus while closed
    if (trackedState === false) return;
    
    // Determine what triggered this effect
    const isTrackedStateUpdate = trackedState && (previousTrackedState !== trackedState);
    const isUpdateStateUpdate = updateState !== previousUpdateState;

    attemptsRef.current = 0;

    const tryFindAndHandle = () => {
      const targetElement = withinRef.current?.firstElementChild || withinRef.current;
      let firstFocusable: HTMLElement | null = null;

      // Check withSelector first if provided
      if (withSelector) {
        firstFocusable = withinRef.current?.querySelector(withSelector) as HTMLElement | null;
      }

      // If withSelector was not provided or didn't find anything, try radio group logic
      if (!firstFocusable && targetElement?.getAttribute("role") === "radiogroup") {
        const selectedEl = targetElement.querySelector("[data-selected]");
        if (selectedEl === null) {
          const inputs = targetElement.querySelectorAll("input");
          const input = inputs && Array.from(inputs).find(
            (input: HTMLInputElement) => !input.disabled && input.tabIndex >= 0
          );
          firstFocusable = input as HTMLElement | null;
        } else if (selectedEl instanceof HTMLElement) {
          firstFocusable = selectedEl;
        }
      }

      if (!firstFocusable) {
        const focusableElements = withinRef.current?.querySelectorAll("a, button, input, select, [data-selected]");
        const element = focusableElements && Array.from(focusableElements).find(el => {
          const htmlEl = el as HTMLAnchorElement | HTMLButtonElement | HTMLInputElement | HTMLSelectElement;
          if (htmlEl instanceof HTMLAnchorElement) return true;
          if (htmlEl.getAttribute("data-selected") === "true") return true;
          return !htmlEl.disabled && htmlEl.tabIndex >= 0;
        });
        firstFocusable = element as HTMLElement | null;
      }

      const handleElement = (element: HTMLElement) => {
        if (actionRef.current.type === "none") return;

        switch (actionRef.current.type) {
          case "focus": {
            const preventScroll = actionRef.current.options?.scrollContainerToTop || actionRef.current.options?.preventScroll;
            element.focus({ preventScroll: preventScroll ?? false });
            
            // Handle container scrolling if requested
            if (actionRef.current.options?.scrollContainerToTop) {
              const scrollContainer = scrollerRef?.current || withinRef.current;
              scrollContainer?.scrollTo({ top: 0 });
            }
            break;
          }
          
          case "scrollIntoView":
            if (!isInViewport(element, scrollerRef?.current || null)) {
              element.scrollIntoView(actionRef.current.options);
            }
            break;
        }
      };

      if (firstFocusable) {
        handleElement(firstFocusable);
        focusableElement.current = firstFocusable;
      } else {
        attemptsRef.current++;
        if (attemptsRef.current < 3) {
          timeoutRef.current = window.setTimeout(tryFindAndHandle, 50);
        } else if (fallbackRef?.current) {
          // Handle fallback based on action type
          if (actionRef.current.type === "focus") {
            fallbackRef.current.focus({ preventScroll: true });
          } else if (actionRef.current.type === "scrollIntoView") {
            fallbackRef.current.scrollIntoView(actionRef.current.options);
          }
          focusableElement.current = fallbackRef.current;
        }
      }
    };

    if (isTrackedStateUpdate) {
      // Store the initial timeout ID
      // We need this because of the bottom sheet animation
      // requestAnimationFrame is not enough, and trackingState
      // from onOpenEnd does not work either for some unknown reason…
      const initialTimeoutId = window.setTimeout(() => {
        tryFindAndHandle();
      }, 100);

      return () => {
        // Clear the initial timeout
        clearTimeout(initialTimeoutId);

        // Clear any retry timeouts
        if (timeoutRef.current !== null) {
          window.clearTimeout(timeoutRef.current);
          timeoutRef.current = null;
        }
        attemptsRef.current = 0;
      };
    } else if (isUpdateStateUpdate) {
      // For updateState changes, run immediately in the next frame
      const rafId = requestAnimationFrame(() => {
        tryFindAndHandle();
      });

      return () => {
        cancelAnimationFrame(rafId);
        if (timeoutRef.current !== null) {
          window.clearTimeout(timeoutRef.current);
          timeoutRef.current = null;
        }
        attemptsRef.current = 0;
      };
    }
  }, [withinRef, fallbackRef, scrollerRef, trackedState, previousUpdateState, updateState, previousTrackedState, withSelector]);

  return focusableElement.current;
};