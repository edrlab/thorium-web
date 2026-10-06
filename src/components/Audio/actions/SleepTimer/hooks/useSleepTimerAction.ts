"use client";

import { useCallback, useContext } from "react";

import { ThAudioActionKeys, ThAudioKeys, ThReadAlongActionKeys, ThReadAlongKeys, defaultReadAlongSleepTimer } from "@/preferences/models";
import { ThAudioPreferencesContext } from "@/preferences/ThAudioPreferencesContext";
import { ThPreferencesContext } from "@/preferences/ThPreferencesContext";

import { useReadAloudNavigator } from "@/core/Hooks/ReadAloud/useReadAloudNavigator";

import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { setSleepTimerOnFragmentEnd, setSleepTimerOnTrackEnd, setSleepTimerRemainingSeconds } from "@/lib/playerReducer";
import { setReadAlongSleepTimer } from "@/lib/readAlongPlayerReducer";

// Read along has no audio preferences provider, the reader's one holds its preferences instead.
// Its sleep timer has no end of track or fragment, so those stay false.
export const useSleepTimerAction = () => {
  const audioContext = useContext(ThAudioPreferencesContext);
  const readerContext = useContext(ThPreferencesContext);
  const isAudio = !!audioContext;

  const { isLoaded: isReadAloudLoaded } = useReadAloudNavigator();
  const dispatch = useAppDispatch();

  const audioRemainingSeconds = useAppSelector(state => state.player.sleepTimer.remainingSeconds);
  const readAlongRemainingSeconds = useAppSelector(state => state.readAlongPlayer.sleepTimer.remainingSeconds);
  const audioOnTrackEnd = useAppSelector(state => state.player.sleepTimer.onTrackEnd);
  const audioOnFragmentEnd = useAppSelector(state => state.player.sleepTimer.onFragmentEnd);
  const isAudioPlaying = useAppSelector(state => state.player.status === "playing");
  const isReadAlongPlaying = useAppSelector(state => state.readAlongPlayer.status === "playing");
  const isAudioDisabled = useAppSelector(state => !state.player.isTrackReady || state.player.isStalled);
  const isReadAlongLoading = useAppSelector(state => state.readAlongPlayer.status === "loading");

  const actionKey = isAudio ? ThAudioActionKeys.sleepTimer : ThReadAlongActionKeys.sleepTimer;

  const config = isAudio
    ? audioContext.preferences.settings.keys[ThAudioKeys.sleepTimer]
    : readerContext?.preferences.readAlong?.settings.keys[ThReadAlongKeys.sleepTimer] ?? defaultReadAlongSleepTimer;

  const remainingSeconds = isAudio ? audioRemainingSeconds : readAlongRemainingSeconds;
  const onTrackEnd = isAudio && audioOnTrackEnd;
  const onFragmentEnd = isAudio && audioOnFragmentEnd;
  const isPlaying = isAudio ? isAudioPlaying : isReadAlongPlaying;
  const isDisabled = isAudio ? isAudioDisabled : !isReadAloudLoaded || isReadAlongLoading;

  const setRemainingSeconds = useCallback((seconds: number | null) => {
    if (isAudio) {
      dispatch(setSleepTimerRemainingSeconds(seconds));
    } else {
      dispatch(setReadAlongSleepTimer({ remainingSeconds: seconds }));
    }
  }, [isAudio, dispatch]);

  const setOnTrackEnd = useCallback((value: boolean) => {
    if (isAudio) dispatch(setSleepTimerOnTrackEnd(value));
  }, [isAudio, dispatch]);

  const setOnFragmentEnd = useCallback((value: boolean) => {
    if (isAudio) dispatch(setSleepTimerOnFragmentEnd(value));
  }, [isAudio, dispatch]);

  return {
    actionKey,
    config,
    remainingSeconds,
    onTrackEnd,
    onFragmentEnd,
    isPlaying,
    isDisabled,
    setRemainingSeconds,
    setOnTrackEnd,
    setOnFragmentEnd
  };
};
