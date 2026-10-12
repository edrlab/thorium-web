"use client";

import { useCallback, useContext } from "react";

import { ThAudioActionKeys, ThAudioKeys, ThReadAlongActionKeys, ThReadAlongKeys, defaultReadAlongRate } from "@/preferences/models";
import { ThAudioPreferencesContext } from "@/preferences/ThAudioPreferencesContext";
import { ThPreferencesContext } from "@/preferences/ThPreferencesContext";
import { getPreferenceKey } from "../../../../Settings/helpers/settingsKeyMapping";

import { useNavigator } from "@/core/Navigator";
import { useEffectiveRange } from "../../../../Settings/hooks/useEffectiveRange";
import { usePlaybackStatus } from "../../../hooks/usePlaybackStatus";

import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { setPlaybackRate } from "@/lib/audioSettingsReducer";
import { setReadAlongRate } from "@/lib/readAlongSettingsReducer";

// Read along has no audio preferences provider, the reader's one holds its preferences instead
export const usePlaybackRateAction = () => {
  const audioContext = useContext(ThAudioPreferencesContext);
  const readerContext = useContext(ThPreferencesContext);
  const isAudio = useAppSelector(state => state.reader.profile === "audio");

  const navigator = useNavigator();
  const readAloud = navigator.readAloud;
  const dispatch = useAppDispatch();

  const { isLoading } = usePlaybackStatus();
  const storedRate = useAppSelector(state => isAudio ? state.audioSettings.playbackRate : state.readAlongSettings.rate);
  const voiceSupportsRate = useAppSelector(state => state.readAlongPlayer.voiceControls.speed);

  const actionKey = isAudio ? ThAudioActionKeys.playbackRate : ThReadAlongActionKeys.rate;

  const config = isAudio && audioContext
    ? audioContext.preferences.settings.keys[ThAudioKeys.playbackRate]
    : readerContext?.preferences.readAlong?.settings.keys[ThReadAlongKeys.rate] ?? defaultReadAlongRate;

  const supportedRange = isAudio
    ? navigator.media.preferencesEditor?.playbackRate?.supportedRange
    : readAloud?.preferencesEditor?.rate?.supportedRange;
  const { range, presets } = useEffectiveRange(config.range, supportedRange, config.presets);

  const audioPrefKey = getPreferenceKey(ThAudioKeys.playbackRate, "audio");
  const readAlongPrefKey = getPreferenceKey(ThReadAlongKeys.rate, "readAlong");

  const playbackRate = storedRate ?? readAloud?.getSetting(readAlongPrefKey) ?? 1;
  const isDisabled = isAudio ? isLoading : !readAloud || isLoading || !voiceSupportsRate;

  const updatePlaybackRate = useCallback(async (value: number) => {
    if (isAudio) {
      const { submitPreferences, getSetting } = navigator.media;
      await submitPreferences({ [audioPrefKey]: value });
      dispatch(setPlaybackRate(getSetting(audioPrefKey)));
    } else if (readAloud) {
      await readAloud.submitPreferences({ [readAlongPrefKey]: value });
      dispatch(setReadAlongRate(readAloud.getSetting(readAlongPrefKey)));
    }
  }, [isAudio, navigator, readAloud, audioPrefKey, readAlongPrefKey, dispatch]);

  return { actionKey, config, range, presets, playbackRate, isDisabled, updatePlaybackRate };
};
