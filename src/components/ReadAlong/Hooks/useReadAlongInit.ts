"use client";

import { useEffect } from "react";

import { ReadAloudListeners } from "@readium/navigator";

import { ReadAloudNavigatorLoadProps, useReadAloudNavigator } from "@/core/Hooks/ReadAloud/useReadAloudNavigator";

import { useAppDispatch, useAppStore } from "@/lib/hooks";
import { resetReadAlongPlayer, setReadAlongStatus, setReadAlongVoiceControls } from "@/lib/readAlongPlayerReducer";
import { useReadAlongState } from "./useReadAlongState";
import { useSleepTimerCountdown } from "../../Audio/actions/SleepTimer/hooks/useSleepTimerCountdown";

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

  const { ReadAloudNavigatorLoad, ReadAloudNavigatorDestroy, setVoice, getCurrentVoice } = useReadAloudNavigator();

  useSleepTimerCountdown();

  useEffect(() => {
    if (!navigatorReady || !isActive) return;

    const visualNavigator = getVisualNavigator();
    if (!visualNavigator) return;

    // Read at load time only: settings changes are submitted to the loaded navigator
    const { voice, ...preferences } = store.getState().readAlongSettings;

    // Persisted with the player state, but only valid for the navigator they came from
    dispatch(resetReadAlongPlayer());

    // The default voice is picked asynchronously by the engine, so it is only known once state changes
    const syncVoiceControls = () => {
      const controls = getCurrentVoice()?.controls;
      const voiceControls = { boundary: controls?.boundary !== false, speed: controls?.speed !== false };
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

    ReadAloudNavigatorLoad({ navigator: visualNavigator, listeners, preferences }, () => {
      if (voice) setVoice(voice);
      syncVoiceControls();
    });

    return () => {
      ReadAloudNavigatorDestroy();
      dispatch(resetReadAlongPlayer());
    };
  }, [navigatorReady, isActive, getVisualNavigator, store, dispatch, ReadAloudNavigatorLoad, ReadAloudNavigatorDestroy, setVoice, getCurrentVoice]);

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
