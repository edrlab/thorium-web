import { useMemo } from "react";

import { useAppSelector } from "@/lib/hooks";
import { usePrevious } from "@/core/Hooks/usePrevious";
import { useIsScroll } from "./useIsScroll";

export interface ReaderTransitions {
  // Current states
  isImmersive: boolean;
  isFullscreen: boolean;
  isScroll: boolean;
  hasUserNavigated: boolean;
  
  // Previous states
  wasImmersive: boolean;
  wasFullscreen: boolean;
  wasScroll: boolean;
  wasUserNavigated: boolean;
  
  // State transitions
  fromImmersive: boolean;
  toImmersive: boolean;
  fromFullscreen: boolean;
  toFullscreen: boolean;
  fromScroll: boolean;
  toScroll: boolean;
  fromUserNavigation: boolean;
  toUserNavigation: boolean;
}

export const useReaderTransitions = (): ReaderTransitions => {
  // Current states
  const isImmersive = useAppSelector(state => state.reader.isImmersive);
  const isFullscreen = useAppSelector(state => state.reader.isFullscreen);
  const hasUserNavigated = useAppSelector(state => state.reader.hasUserNavigated);
  const isScroll = useIsScroll();
  
  // One snapshot so the flags describe the latest change of any of these states
  const state = useMemo(() => ({ isImmersive, isFullscreen, isScroll, hasUserNavigated }), [isImmersive, isFullscreen, isScroll, hasUserNavigated]);
  const previous = usePrevious(state);

  // Previous states
  const wasImmersive = previous?.isImmersive ?? false;
  const wasFullscreen = previous?.isFullscreen ?? false;
  const wasScroll = previous?.isScroll ?? false;
  const wasUserNavigated = previous?.hasUserNavigated ?? false;

  // State transitions
  const fromImmersive = wasImmersive && !isImmersive;
  const toImmersive = !wasImmersive && isImmersive;
  const fromFullscreen = wasFullscreen && !isFullscreen;
  const toFullscreen = !wasFullscreen && isFullscreen;
  const fromScroll = wasScroll && !isScroll;
  const toScroll = !wasScroll && isScroll;
  const fromUserNavigation = wasUserNavigated && !hasUserNavigated;
  const toUserNavigation = !wasUserNavigated && hasUserNavigated;

  return {
    // Current states
    isImmersive,
    isFullscreen,
    isScroll,
    hasUserNavigated,
    
    // Previous states
    wasImmersive,
    wasFullscreen,
    wasScroll,
    wasUserNavigated,
    
    // State transitions
    fromImmersive,
    toImmersive,
    fromFullscreen,
    toFullscreen,
    fromScroll,
    toScroll,
    fromUserNavigation,
    toUserNavigation
  };
};
