"use client";

import { useCallback, useContext } from "react";

import { ThAudioActionKeys, ThAudioKeys, ThReadAlongActionKeys, ThReadAlongKeys, defaultReadAlongVolume } from "@/preferences/models";
import { ThAudioPreferencesContext } from "@/preferences/ThAudioPreferencesContext";
import { ThPreferencesContext } from "@/preferences/ThPreferencesContext";
import { getPreferenceKey } from "../../../../Settings/helpers/settingsKeyMapping";

import { useNavigator } from "@/core/Navigator";
import { useEffectiveRange } from "../../../../Settings/hooks/useEffectiveRange";

import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { setVolume } from "@/lib/audioSettingsReducer";
import { setReadAlongVolume } from "@/lib/readAlongSettingsReducer";

// Read along has no audio preferences provider, the reader's one holds its preferences instead
export const useVolumeAction = () => {
  const audioContext = useContext(ThAudioPreferencesContext);
  const readerContext = useContext(ThPreferencesContext);
  const isAudio = !!audioContext;

  const navigator = useNavigator();
  const readAloud = navigator.readAloud;
  const dispatch = useAppDispatch();

  const audioVolume = useAppSelector(state => state.audioSettings.volume);
  const readAlongVolume = useAppSelector(state => state.readAlongSettings.volume);
  const isAudioDisabled = useAppSelector(state => !state.player.isTrackReady || state.player.isStalled);
  const isReadAlongLoading = useAppSelector(state => state.readAlongPlayer.status === "loading");

  const actionKey = isAudio ? ThAudioActionKeys.volume : ThReadAlongActionKeys.volume;

  const config = isAudio
    ? audioContext.preferences.settings.keys[ThAudioKeys.volume]
    : readerContext?.preferences.readAlong?.settings.keys[ThReadAlongKeys.volume] ?? defaultReadAlongVolume;

  const preferencesEditor = isAudio ? navigator.media.preferencesEditor : readAloud?.preferencesEditor;
  const { range } = useEffectiveRange(config.range, preferencesEditor?.volume?.supportedRange);

  const audioPrefKey = getPreferenceKey(ThAudioKeys.volume, "audio");
  const readAlongPrefKey = getPreferenceKey(ThReadAlongKeys.volume, "readAlong");

  const volume = isAudio ? audioVolume : readAlongVolume ?? readAloud?.getSetting(readAlongPrefKey) ?? 1;
  const isDisabled = isAudio ? isAudioDisabled : !readAloud || isReadAlongLoading;

  const updateVolume = useCallback(async (value: number) => {
    if (isAudio) {
      const { submitPreferences, getSetting } = navigator.media;
      await submitPreferences({ [audioPrefKey]: value });
      dispatch(setVolume(getSetting(audioPrefKey)));
    } else if (readAloud) {
      await readAloud.submitPreferences({ [readAlongPrefKey]: value });
      dispatch(setReadAlongVolume(readAloud.getSetting(readAlongPrefKey)));
    }
  }, [isAudio, navigator, readAloud, audioPrefKey, readAlongPrefKey, dispatch]);

  return { actionKey, config, range, volume, isDisabled, updateVolume };
};
