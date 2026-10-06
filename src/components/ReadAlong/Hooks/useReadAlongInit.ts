"use client";

import { useEffect } from "react";

import { ReadAloudListeners } from "@readium/navigator";

import { ReadAloudNavigatorLoadProps, useReadAloudNavigator } from "@/core/Hooks/ReadAloud/useReadAloudNavigator";

import { useAppDispatch, useAppSelector, useAppStore } from "@/lib/hooks";
import { resetReadAlong, setReadAlongActive, setReadAlongStatus } from "@/lib/readAlongReducer";

interface UseReadAlongInitProps {
  navigatorReady: boolean;
  getVisualNavigator: () => ReadAloudNavigatorLoadProps["navigator"] | null;
}

export const useReadAlongInit = ({
  navigatorReady,
  getVisualNavigator
}: UseReadAlongInitProps) => {
  const isActive = useAppSelector(state => state.readAlong.isActive);
  const store = useAppStore();
  const dispatch = useAppDispatch();

  const { ReadAloudNavigatorLoad, ReadAloudNavigatorDestroy, setVoice, play } = useReadAloudNavigator();

  useEffect(() => {
    if (!navigatorReady || !isActive) return;

    const visualNavigator = getVisualNavigator();
    if (!visualNavigator) return;

    // Read at load time only: settings changes are submitted to the loaded navigator
    const { voice, ...preferences } = store.getState().readAlongSettings;

    const listeners: ReadAloudListeners = {
      stateChanged: (state) => dispatch(setReadAlongStatus(state)),
      error: (error) => console.warn("Read along:", error)
    };

    ReadAloudNavigatorLoad({ navigator: visualNavigator, listeners, preferences }, () => {
      if (voice) setVoice(voice);
      play();
    });

    return () => {
      ReadAloudNavigatorDestroy();
      dispatch(resetReadAlong());
    };
  }, [navigatorReady, isActive, getVisualNavigator, store, dispatch, ReadAloudNavigatorLoad, ReadAloudNavigatorDestroy, setVoice, play]);

  // Not persisted across readers, so the next publication doesn't start reading on its own
  useEffect(() => {
    return () => {
      dispatch(setReadAlongActive(false));
    };
  }, [dispatch]);
};
