"use client";

import { useRef } from "react";
import { AudioSettings, useAudioSettingsCache } from "@/core/Hooks/Audio/useAudioSettingsCache";
import { TimelineItemRef } from "@/lib/publicationReducer";

export interface AudioStatelessCache {
  settings: AudioSettings;
  sleepTimerOnTrackEnd: boolean;
  sleepTimerOnFragmentEnd: boolean;
  adjacentTimelineItems: {
    previous: TimelineItemRef | null;
    next: TimelineItemRef | null;
  };
}

export const useAudioStatelessCache = (
  volume: number,
  playbackRate: number,
  preservePitch: boolean,
  skipBackwardInterval: number,
  skipForwardInterval: number,
  skipInterval: number,
  pollInterval: number,
  autoPlay: boolean,
  enableMediaSession: boolean,
  sleepTimerOnTrackEnd: boolean,
  sleepTimerOnFragmentEnd: boolean,
  adjacentTimelineItems: {
    previous: TimelineItemRef | null;
    next: TimelineItemRef | null;
  }
) => {
  const settingsCache = useAudioSettingsCache(
    volume,
    playbackRate,
    preservePitch,
    skipBackwardInterval,
    skipForwardInterval,
    skipInterval,
    pollInterval,
    autoPlay,
    enableMediaSession
  );

  const cache = useRef<AudioStatelessCache>({
    settings: settingsCache.current.settings,
    sleepTimerOnTrackEnd,
    sleepTimerOnFragmentEnd,
    adjacentTimelineItems,
  });

  // Update cache synchronously on every render to ensure fresh values
  cache.current.settings = settingsCache.current.settings;
  cache.current.sleepTimerOnTrackEnd = sleepTimerOnTrackEnd;
  cache.current.sleepTimerOnFragmentEnd = sleepTimerOnFragmentEnd;
  cache.current.adjacentTimelineItems = adjacentTimelineItems;

  return cache;
};
