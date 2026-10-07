"use client";

import { useEffect } from "react";

import { IReadAloudDefaults, ReadAloudListeners } from "@readium/navigator";

import { ReadAloudNavigatorLoadProps, useReadAloudNavigator } from "@/core/Hooks/ReadAloud/useReadAloudNavigator";

import { useAppDispatch, useAppStore } from "@/lib/hooks";
import { resetReadAlongPlayer, setReadAlongStatus, setReadAlongVoiceControls } from "@/lib/readAlongPlayerReducer";
import { useReadAlongState } from "./useReadAlongState";
import { useSleepTimerCountdown } from "../../Audio/actions/SleepTimer/hooks/useSleepTimerCountdown";
import { getVoiceControls } from "../helpers/getVoiceControls";
import { useHighlightPresets } from "../Settings/Highlight/hooks/useHighlightPresets";

// Not settings, so pinned rather than left to the navigator's own defaults
const readAlongDefaults: IReadAloudDefaults = {
  segmentation: "sentence",
  format: "plain"
};

interface UseReadAlongInitProps {
  navigatorReady: boolean;
  getVisualNavigator: () => ReadAloudNavigatorLoadProps["navigator"] | null;
}

export const useReadAlongInit = ({
  navigatorReady,
  getVisualNavigator
}: UseReadAlongInitProps) => {
  const { isActive, isExpanded, setActive } = useReadAlongState();
  const store = useAppStore();
  const dispatch = useAppDispatch();

  const { ReadAloudNavigatorLoad, ReadAloudNavigatorDestroy, getVoices, setVoice, getCurrentVoice } = useReadAloudNavigator();

  useSleepTimerCountdown();

  const { applyTheme } = useHighlightPresets();

  // Recolors the highlight when the reading theme changes
  useEffect(() => {
    applyTheme();
  }, [applyTheme]);

  useEffect(() => {
    if (!navigatorReady || !isActive) return;

    const visualNavigator = getVisualNavigator();
    if (!visualNavigator) return;

    // Read at load time only: settings changes are submitted to the loaded navigator
    // Highlight is Thorium's own preset state, its resolved styles are already in the settings
    const { voice, highlight: _highlight, ...preferences } = store.getState().readAlongSettings;

    // Persisted with the player state, but only valid for the navigator they came from
    dispatch(resetReadAlongPlayer());

    // The default voice is picked asynchronously by the engine, so it is only known once state changes
    const syncVoiceControls = () => {
      const voiceControls = getVoiceControls(getCurrentVoice());
      const current = store.getState().readAlongPlayer.voiceControls;
      if (current.boundary !== voiceControls.boundary || current.speed !== voiceControls.speed) {
        dispatch(setReadAlongVoiceControls(voiceControls));
      }
    };

    const listeners: ReadAloudListeners = {
      stateChanged: (state) => {
        dispatch(setReadAlongStatus(state));
        syncVoiceControls();
      },
      error: (error) => console.warn("Read along:", error)
    };

    let cancelled = false;

    ReadAloudNavigatorLoad({ navigator: visualNavigator, listeners, preferences, defaults: readAlongDefaults }, async () => {
      // The engine loads its voices asynchronously, and a voice name set before then is not found
      if (voice) {
        const stored = (await getVoices()).find((item) => item.name === voice);
        if (cancelled) return;
        if (stored) setVoice(stored);
      }
      syncVoiceControls();
    });

    return () => {
      cancelled = true;
      ReadAloudNavigatorDestroy();
      dispatch(resetReadAlongPlayer());
    };
  }, [navigatorReady, isActive, getVisualNavigator, store, dispatch, ReadAloudNavigatorLoad, ReadAloudNavigatorDestroy, getVoices, setVoice, getCurrentVoice]);

  // The keyboard shortcut toggles the action open, which activates read along when inactive
  useEffect(() => {
    if (!isActive && isExpanded) setActive(true);
  }, [isActive, isExpanded, setActive]);

  // So that the next publication doesn't start reading on its own
  useEffect(() => {
    return () => {
      setActive(false);
    };
  }, [setActive]);
};
