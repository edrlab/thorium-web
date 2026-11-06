"use client";

import { useEffect, useMemo, useState } from "react";

import { ThBreakpoints } from "@/preferences/models";

import { useMediaQuery } from "./useMediaQuery";

type ThBreakpointRange = {
  min: number | null,
  max: number | null
}

type ThBreakpointRanges = { [key in ThBreakpoints]: ThBreakpointRange | null; }

export type BreakpointsMap<T> = {
  [key in ThBreakpoints]?: T
};

export type ThBreakpointsObject = { [key in ThBreakpoints]: boolean | null } & { current: string | null } & { ranges: ThBreakpointRanges }

export const useBreakpoints = (map: BreakpointsMap<number | null>, onChange?: (breakpoint: ThBreakpoints | null) => void): ThBreakpointsObject => {
  const [currentBreakpoint, setCurrentBreakpoint] = useState<ThBreakpoints | null>(null);

  const makeMediaString = (range: ThBreakpointRange | null) => {
    if (!range || (!range.min && !range.max)) return null;
  
    let mediaString = "screen"
    if (range.min) {
      mediaString += ` and (min-width: ${ range.min }px)`;
    }
    if (range.max) {
      mediaString += ` and (max-width: ${ range.max }px)`
    }
    return mediaString;
  };

  const initRanges = (prefs: BreakpointsMap<number | null>) => {
    const breakpointRanges: ThBreakpointRanges = {
      [ThBreakpoints.compact]: null,
      [ThBreakpoints.medium]: null,
      [ThBreakpoints.expanded]: null,
      [ThBreakpoints.large]: null,
      [ThBreakpoints.xLarge]: null
    };
  
    let prev: null | number = null;
    
    Object.entries(prefs).forEach(([ key, value ]) => {
      if (value && !isNaN(value)) {
        const max = value;
        const min = prev ? prev + 1 : null;
        Object.defineProperty(breakpointRanges, key, {
          value: {
            min: min,
            max: max
          }
        });
        prev = value;
      } else if (!value && key === ThBreakpoints.xLarge && prev) {
        Object.defineProperty(breakpointRanges, key, {
          value: {
            min: prev + 1,
            max: null
          }
        });
      }
    });

    return breakpointRanges;
  };

  const ranges = useMemo(() => initRanges(map), [map]);

  const compactMedia = makeMediaString(ranges[ThBreakpoints.compact]);
  const mediumMedia = makeMediaString(ranges[ThBreakpoints.medium]);
  const expandedMedia = makeMediaString(ranges[ThBreakpoints.expanded]);
  const largeMedia = makeMediaString(ranges[ThBreakpoints.large]);
  const xLargeMedia = makeMediaString(ranges[ThBreakpoints.xLarge]);

  const compactMatches = useMediaQuery(compactMedia);
  const mediumMatches = useMediaQuery(mediumMedia);
  const expandedMatches = useMediaQuery(expandedMedia);
  const largeMatches = useMediaQuery(largeMedia);
  const xLargeMatches = useMediaQuery(xLargeMedia);

  useEffect(() => {
    let newBreakpoint = currentBreakpoint;

    if (compactMatches) {
      newBreakpoint = ThBreakpoints.compact;
    } else if (mediumMatches) {
      newBreakpoint = ThBreakpoints.medium;
    } else if (expandedMatches) {
      newBreakpoint = ThBreakpoints.expanded;
    } else if (largeMatches) {
      newBreakpoint = ThBreakpoints.large;
    } else if (xLargeMatches) {
      newBreakpoint = ThBreakpoints.xLarge;
    }

    // Media queries are only evaluated after mount, so null means not measured yet, not no breakpoint
    if (newBreakpoint === null) return;

    setCurrentBreakpoint(newBreakpoint);
    onChange && onChange(newBreakpoint);
  }, [currentBreakpoint, compactMatches, mediumMatches, expandedMatches, largeMatches, xLargeMatches, onChange]);

  return {
    [ThBreakpoints.compact]: compactMatches,
    [ThBreakpoints.medium]: mediumMatches,
    [ThBreakpoints.expanded]: expandedMatches,
    [ThBreakpoints.large]: largeMatches,
    [ThBreakpoints.xLarge]: xLargeMatches,
    current: currentBreakpoint,
    ranges: ranges
  };
};