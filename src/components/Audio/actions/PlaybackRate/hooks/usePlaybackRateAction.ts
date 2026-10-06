"use client";

import { useCallback, useContext } from "react";

import { ThAudioActionKeys, ThAudioKeys, ThReadAlongActionKeys, ThReadAlongKeys, defaultReadAlongRate } from "@/preferences/models";
import { ThAudioPreferencesContext } from "@/preferences/ThAudioPreferencesContext";
import { ThPreferencesContext } from "@/preferences/ThPreferencesContext";

import { useNavigator } from "@/core/Navigator";
import { useEffectiveRange } from "../../../../Settings/hooks/useEffectiveRange";

import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { setPlaybackRate } from "@/lib/audioSettingsReducer";
import { setReadAlongRate } from "@/lib/readAlongSettingsReducer";

// Read along has no audio preferences provider, the reader's one holds its preferences instead
export const usePlaybackRateAction = () => {
  const audioContext = useContext(ThAudioPreferencesContext);
  const readerContext = useContext(ThPreferencesContext);
  const isAudio = !!audioContext;

  const navigator = useNavigator();
  const readAloud = navigator.readAloud;
  const dispatch = useAppDispatch();

  const audioRate = useAppSelector(state => state.audioSettings.playbackRate);
  const readAlongRate = useAppSelector(state => state.readAlongSettings.rate);
  const voiceSupportsRate = useAppSelector(state => state.readAlongPlayer.voiceControls.speed);
  const isAudioDisabled = useAppSelector(state => !state.player.isTrackReady || state.player.isStalled);
  const isReadAlongLoading = useAppSelector(state => state.readAlongPlayer.status === "loading");

  const actionKey = isAudio ? ThAudioActionKeys.playbackRate : ThReadAlongActionKeys.rate;

  const config = isAudio
    ? audioContext.preferences.settings.keys[ThAudioKeys.playbackRate]
    : readerContext?.preferences.readAlong?.settings.keys[ThReadAlongKeys.rate] ?? defaultReadAlongRate;

  const supportedRange = isAudio
    ? navigator.media.preferencesEditor?.playbackRate?.supportedRange
    : readAloud?.preferencesEditor?.rate?.supportedRange;
  const { range, presets } = useEffectiveRange(config.range, supportedRange, config.presets);

  const playbackRate = isAudio ? audioRate : readAlongRate ?? readAloud?.getSetting("rate") ?? 1;
  const isDisabled = isAudio ? isAudioDisabled : !readAloud || isReadAlongLoading || !voiceSupportsRate;

  const updatePlaybackRate = useCallback(async (value: number) => {
    if (isAudio) {
      const { submitPreferences, getSetting } = navigator.media;
      await submitPreferences({ playbackRate: value });
      dispatch(setPlaybackRate(getSetting("playbackRate")));
    } else if (readAloud) {
      await readAloud.submitPreferences({ rate: value });
      dispatch(setReadAlongRate(readAloud.getSetting("rate")));
    }
  }, [isAudio, navigator, readAloud, dispatch]);

  return { actionKey, config, range, presets, playbackRate, isDisabled, updatePlaybackRate };
};
