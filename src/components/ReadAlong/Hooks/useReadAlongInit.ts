"use client";

import { useEffect } from "react";

import { ReadAloudListeners } from "@readium/navigator";

import { ReadAloudNavigatorLoadProps, useReadAloudNavigator } from "@/core/Hooks/ReadAloud/useReadAloudNavigator";

import { useAppDispatch, useAppStore } from "@/lib/hooks";
import { resetReadAlongPlayer, setReadAlongStatus } from "@/lib/readAlongPlayerReducer";
import { useReadAlongState } from "./useReadAlongState";

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

  const { ReadAloudNavigatorLoad, ReadAloudNavigatorDestroy, setVoice } = useReadAloudNavigator();

  useEffect(() => {
    if (!navigatorReady || !isActive) return;

    const visualNavigator = getVisualNavigator();
    if (!visualNavigator) return;

    // Read at load time only: settings changes are submitted to the loaded navigator
    const { voice, ...preferences } = store.getState().readAlongSettings;

    // Persisted with the player state, but only valid for the navigator they came from
    dispatch(resetReadAlongPlayer());

    const listeners: ReadAloudListeners = {
      stateChanged: (state) => dispatch(setReadAlongStatus(state)),
      error: (error) => console.warn("Read along:", error)
    };

    ReadAloudNavigatorLoad({ navigator: visualNavigator, listeners, preferences }, () => {
      if (voice) setVoice(voice);
    });

    return () => {
      ReadAloudNavigatorDestroy();
      dispatch(resetReadAlongPlayer());
    };
  }, [navigatorReady, isActive, getVisualNavigator, store, dispatch, ReadAloudNavigatorLoad, ReadAloudNavigatorDestroy, setVoice]);

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
