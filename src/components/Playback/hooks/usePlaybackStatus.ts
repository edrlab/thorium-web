"use client";

import { useAppSelector } from "@/lib/hooks";

export const usePlaybackStatus = () => {
  const isAudio = useAppSelector(state => state.reader.profile === "audio");

  const isPlaying = useAppSelector(state => isAudio
    ? state.player.status === "playing"
    : state.readAlongPlayer.status === "playing"
  );

  const isLoading = useAppSelector(state => isAudio
    ? !state.player.isTrackReady || state.player.isStalled
    : state.readAlongPlayer.status === "loading"
  );

  return { isPlaying, isLoading };
};
