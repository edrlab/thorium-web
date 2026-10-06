"use client";

import { useContext, useEffect } from "react";

import { ThAudioPreferencesContext } from "@/preferences/ThAudioPreferencesContext";

import { useAudioNavigator } from "@/core/Hooks/Audio/useAudioNavigator";
import { useReadAloudNavigator } from "@/core/Hooks/ReadAloud/useReadAloudNavigator";
import { useSleepTimerAction } from "./useSleepTimerAction";

// Called where the player is always mounted, as the sleep timer's container is not
export const useSleepTimerCountdown = () => {
  const isAudio = !!useContext(ThAudioPreferencesContext);
  const { pause: pauseAudio } = useAudioNavigator();
  const { pause: pauseReadAloud } = useReadAloudNavigator();
  const { remainingSeconds, isPlaying, setRemainingSeconds } = useSleepTimerAction();

  const pause = isAudio ? pauseAudio : pauseReadAloud;

  useEffect(() => {
    if (remainingSeconds === null) return;
    if (remainingSeconds <= 0) {
      pause();
      setRemainingSeconds(null);
      return;
    }
    if (!isPlaying) return;
    const id = setTimeout(() => {
      setRemainingSeconds(remainingSeconds - 1);
    }, 1000);
    return () => clearTimeout(id);
  }, [remainingSeconds, isPlaying, pause, setRemainingSeconds]);
};
