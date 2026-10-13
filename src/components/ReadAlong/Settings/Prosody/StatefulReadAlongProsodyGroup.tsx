"use client";

import { useCallback } from "react";

import {
  defaultReadAlongProsodyMain,
  defaultReadAlongProsodySubpanel,
  ThReadAlongProsodyKeys,
  ThReadAlongSettingsContainerKeys
} from "@/preferences/models";

import { StatefulGroupWrapper } from "../../../Settings/StatefulGroupWrapper";

import { usePreferences } from "@/preferences/hooks/usePreferences";
import { usePlugins } from "../../../Plugins/PluginProvider";
import { useI18n } from "@/i18n/useI18n";

import { useAppDispatch } from "@/lib/hooks";
import { setReadAlongSettingsContainer } from "@/lib/readAlongPlayerReducer";

export const StatefulReadAlongProsodyGroup = () => {
  const { preferences } = usePreferences();
  const { t } = useI18n();
  const { readAlongProsodySettingsComponentsMap } = usePlugins();

  const prosodyPrefs = preferences.readAlong.settings.prosody;

  const dispatch = useAppDispatch();

  const setProsodyContainer = useCallback(() => {
    dispatch(setReadAlongSettingsContainer(ThReadAlongSettingsContainerKeys.prosody));
  }, [dispatch]);

  return (
    <>
    <StatefulGroupWrapper<ThReadAlongProsodyKeys>
      label={ t("_pendingThoriumLocales.reader.readAlong.preferences.prosody.title") }
      moreLabel={ t("_pendingThoriumLocales.reader.readAlong.preferences.prosody.advanced.trigger") }
      moreTooltip={ t("_pendingThoriumLocales.reader.readAlong.preferences.prosody.advanced.tooltip") }
      onPressMore={ setProsodyContainer }
      componentsMap={ readAlongProsodySettingsComponentsMap }
      prefs={ {
        main: prosodyPrefs?.main ?? defaultReadAlongProsodyMain,
        subPanel: prosodyPrefs?.subPanel === null ? null : prosodyPrefs?.subPanel ?? defaultReadAlongProsodySubpanel,
        header: prosodyPrefs?.header
      } }
      defaultPrefs={ {
        main: defaultReadAlongProsodyMain,
        subPanel: defaultReadAlongProsodySubpanel
      }}
    />
    </>
  );
}

export const StatefulReadAlongProsodyGroupContainer = () => {
  const { preferences } = usePreferences();
  const { readAlongProsodySettingsComponentsMap } = usePlugins();

  const subPanel = preferences.readAlong.settings.prosody?.subPanel ?? defaultReadAlongProsodySubpanel;

  return(
    <>
    { subPanel.map((key: ThReadAlongProsodyKeys) => {
      const match = readAlongProsodySettingsComponentsMap[key];
      if (!match) {
        console.warn(`Setting key "${ key }" not found in the plugin registry while present in preferences.`);
        return null;
      }
      return <match.Comp key={ key } standalone={ true } />;
    }) }
    </>
  )
}
