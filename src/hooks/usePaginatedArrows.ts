import { useEffect, useMemo } from "react";

import { ThArrowVariant, ThPaginatedAffordancePrefValue } from "@/preferences/models";

import { usePreferences } from "@/preferences/hooks/usePreferences";
import { useReaderTransitions } from "./useReaderTransitions";
import { usePrevious } from "@/core/Hooks/usePrevious";

import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { setHasArrows, setUserNavigated } from "@/lib/readerReducer";

import { makeBreakpointsMap } from "@/core/Helpers/breakpointsMap";

export interface UsePaginatedArrowsReturn {
  isVisible: boolean;
  occupySpace: boolean;
  shouldTrackNavigation: boolean;
  supportsVariant: boolean;
}

export const usePaginatedArrows = (): UsePaginatedArrowsReturn => {
  const { preferences } = usePreferences();
  const hasArrows = useAppSelector(state => state.reader.hasArrows);
  const isFXL = useAppSelector(state => state.publication.isFXL);
  const profile = useAppSelector(state => state.reader.profile);
  const breakpoint = useAppSelector(state => state.theming.containerBreakpoint);

  // Divina is page-based like FXL: same arrow affordances apply
  const pageBased = isFXL || profile === "divina";
  
  // Get reader state transitions
  const {
    isScroll,
    fromImmersive,
    toImmersive,
    fromFullscreen,
    toFullscreen,
    fromScroll,
    toUserNavigation
  } = useReaderTransitions();

  const dispatch = useAppDispatch();

  // Memoize the prefs object to avoid recreating it on every render
  const prefs = useMemo(() =>
    pageBased
      ? preferences.affordances.paginated.fxl
      : preferences.affordances.paginated.reflow,
    [pageBased, preferences.affordances.paginated.fxl, preferences.affordances.paginated.reflow]
  );

  // Memoize the breakpoints map to avoid recreating it on every breakpoint change
  const prefsMap = useMemo(() => 
    makeBreakpointsMap<ThPaginatedAffordancePrefValue>({
      defaultValue: prefs.default,
      fromEnum: ThArrowVariant,
      pref: prefs.breakpoints,
      validateKey: "variant"
    }),
    [prefs.default, prefs.breakpoints]
  );

  // Get the current preferences based on breakpoint
  const { variant, discard, hint } = useMemo(() => {
    // Get the current prefs for the breakpoint or fallback to default
    const result = prefsMap[breakpoint as keyof typeof prefsMap] || prefs.default;
    
    // Force layered variant for FXL to prevent layout issues
    // FXL navigator is using the window width to calculate the layout
    // so we need to force the layered variant to prevent layout issues
    if (pageBased) {
      return {
        ...result,
        variant: ThArrowVariant.layered
      };
    }

    return result;
  }, [breakpoint, prefsMap, pageBased, prefs.default]);

  // Track previous prefs
  const prevVariant = usePrevious(variant);
  const prevDiscard = usePrevious(discard);

  // Handle state transitions
  useEffect(() => {
    // If navigation was just added to discard, reset navigation state
    if (!prevDiscard?.includes("navigation") && discard?.includes("navigation")) {
      dispatch(setUserNavigated(false));
      return;
    }
    
    // If discard changed to "none", show the arrows and reset navigation state
    if (discard === "none" && prevDiscard !== "none") {
      dispatch(setHasArrows(true));
      dispatch(setUserNavigated(false));
      return;
    }
    // Reset when changing from "none" to "stacked" or "layered"
    if (prevVariant === ThArrowVariant.none && variant !== ThArrowVariant.none) {
      dispatch(setHasArrows(true));
      dispatch(setUserNavigated(false));
      return;
    }

    // Check for discard transitions (false -> true)
    const shouldHide = 
      (discard?.includes("immersive") && toImmersive) ||
      (discard?.includes("fullscreen") && toFullscreen) ||
      (discard?.includes("navigation") && toUserNavigation);

    // Check for hint transitions (true -> false)
    const shouldShow = 
      (hint?.includes("immersiveChange") && fromImmersive) ||
      (hint?.includes("fullscreenChange") && fromFullscreen) ||
      (hint?.includes("layoutChange") && fromScroll);

    if (shouldHide) {
      dispatch(setHasArrows(false));
      // Reset the navigation flag after handling the transition
      if (discard?.includes("navigation") && toUserNavigation) {
        dispatch(setUserNavigated(false));
      }
    } else if (shouldShow) {
      dispatch(setHasArrows(true));
    }
  }, [toImmersive, toFullscreen, toUserNavigation, fromImmersive, fromFullscreen, fromScroll, discard, hint, prevVariant, variant, prevDiscard, dispatch]);

  // Early return for special cases
  if (variant === ThArrowVariant.none || isScroll) {
    return {
      isVisible: false,
      occupySpace: false,
      shouldTrackNavigation: false,
      supportsVariant: !isFXL
    };
  }

  return {
    isVisible: hasArrows,
    occupySpace: variant === ThArrowVariant.stacked,
    shouldTrackNavigation: Array.isArray(discard) && discard.includes("navigation"),
    supportsVariant: !isFXL
  };
};