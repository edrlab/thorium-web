"use client";

import { useCallback } from "react";

import { ThAudioKeys } from "@/preferences/models";
import { getPreferenceKey } from "../../Settings/helpers/settingsKeyMapping";

import { StatefulSwitch } from "../../Settings/StatefulSwitch";

import { useI18n } from "@/i18n/useI18n";
import { useNavigator } from "@/core/Navigator";

import { useAppSelector, useAppDispatch } from "@/lib/hooks";
import { setAutoPlay } from "@/lib/audioSettingsReducer";

export interface StatefulAudioAutoPlayProps {
  standalone?: boolean;
}

export const StatefulAudioAutoPlay = ({
  standalone = true
}: StatefulAudioAutoPlayProps) => {
  const { t } = useI18n();

  const autoPlay = useAppSelector(state => state.audioSettings.autoPlay);
  const dispatch = useAppDispatch();
  const { submitPreferences, getSetting } = useNavigator().media;

  const prefKey = getPreferenceKey(ThAudioKeys.autoPlay, "audio");

  const updatePreference = useCallback(async (isSelected: boolean) => {
    await submitPreferences({ [prefKey]: isSelected });
    const effectiveAutoPlay = getSetting(prefKey);
    dispatch(setAutoPlay(effectiveAutoPlay));
  }, [prefKey, submitPreferences, getSetting, dispatch]);

  return (
    <StatefulSwitch
      standalone={ standalone }
      heading={ t("reader.playback.preferences.autoPlay.title") }
      label={ t("reader.playback.preferences.autoPlay.label") }
      isSelected={ autoPlay }
      onChange={ updatePreference }
    />
  );
};
