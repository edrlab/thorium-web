"use client";

import { useCallback } from "react";

import {
  defaultReadAlongVoiceMain,
  defaultReadAlongVoiceSubpanel,
  ThReadAlongVoiceKeys,
  ThReadAlongSettingsContainerKeys
} from "@/preferences/models";

import { StatefulGroupWrapper } from "../../../Settings/StatefulGroupWrapper";

import { usePreferences } from "@/preferences/hooks/usePreferences";
import { usePlugins } from "../../../Plugins/PluginProvider";
import { useI18n } from "@/i18n/useI18n";

import { useAppDispatch } from "@/lib/hooks";
import { setReadAlongSettingsContainer } from "@/lib/readAlongPlayerReducer";

export const StatefulReadAlongVoiceGroup = () => {
  const { preferences } = usePreferences();
  const { t } = useI18n();
  const { readAlongVoiceSettingsComponentsMap } = usePlugins();

  const voicePrefs = preferences.readAlong.settings.voice;

  const dispatch = useAppDispatch();

  const setVoiceContainer = useCallback(() => {
    dispatch(setReadAlongSettingsContainer(ThReadAlongSettingsContainerKeys.voice));
  }, [dispatch]);

  return (
    <>
    <StatefulGroupWrapper<ThReadAlongVoiceKeys>
      label={ t("reader.playback.preferences.readAloud.voice.title") }
      moreLabel={ t("reader.readAlong.settings.voice.advanced.trigger") }
      moreTooltip={ t("reader.readAlong.settings.voice.advanced.tooltip") }
      onPressMore={ setVoiceContainer }
      componentsMap={ readAlongVoiceSettingsComponentsMap }
      prefs={ {
        main: voicePrefs?.main ?? defaultReadAlongVoiceMain,
        subPanel: voicePrefs?.subPanel === null ? null : voicePrefs?.subPanel ?? defaultReadAlongVoiceSubpanel,
        header: voicePrefs?.header
      } }
      defaultPrefs={ {
        main: defaultReadAlongVoiceMain,
        subPanel: defaultReadAlongVoiceSubpanel
      }}
    />
    </>
  );
}

export const StatefulReadAlongVoiceGroupContainer = () => {
  const { preferences } = usePreferences();
  const { readAlongVoiceSettingsComponentsMap } = usePlugins();

  const subPanel = preferences.readAlong.settings.voice?.subPanel ?? defaultReadAlongVoiceSubpanel;

  return(
    <>
    { subPanel.map((key: ThReadAlongVoiceKeys) => {
      const match = readAlongVoiceSettingsComponentsMap[key];
      if (!match) {
        console.warn(`Setting key "${ key }" not found in the plugin registry while present in preferences.`);
        return null;
      }
      return <match.Comp key={ key } standalone={ true } />;
    }) }
    </>
  )
}
