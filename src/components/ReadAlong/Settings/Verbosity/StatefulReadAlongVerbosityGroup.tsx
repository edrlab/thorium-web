"use client";

import { useCallback } from "react";

import {
  defaultReadAlongVerbosityMain,
  defaultReadAlongVerbositySubpanel,
  ThReadAlongVerbosityKeys,
  ThReadAlongSettingsContainerKeys
} from "@/preferences/models";

import { StatefulGroupWrapper } from "../../../Settings/StatefulGroupWrapper";

import { usePreferences } from "@/preferences/hooks/usePreferences";
import { usePlugins } from "../../../Plugins/PluginProvider";
import { useI18n } from "@/i18n/useI18n";

import { useAppDispatch } from "@/lib/hooks";
import { setReadAlongSettingsContainer } from "@/lib/readAlongPlayerReducer";

export const StatefulReadAlongVerbosityGroup = () => {
  const { preferences } = usePreferences();
  const { t } = useI18n();
  const { readAlongVerbositySettingsComponentsMap } = usePlugins();

  const verbosityPrefs = preferences.readAlong.settings.verbosity;

  const dispatch = useAppDispatch();

  const setVerbosityContainer = useCallback(() => {
    dispatch(setReadAlongSettingsContainer(ThReadAlongSettingsContainerKeys.verbosity));
  }, [dispatch]);

  return (
    <>
    <StatefulGroupWrapper<ThReadAlongVerbosityKeys>
      label={ t("_pendingThoriumLocales.reader.readAlong.preferences.verbosity.title") }
      moreLabel={ t("_pendingThoriumLocales.reader.readAlong.preferences.verbosity.advanced.trigger") }
      moreTooltip={ t("_pendingThoriumLocales.reader.readAlong.preferences.verbosity.advanced.tooltip") }
      onPressMore={ setVerbosityContainer }
      componentsMap={ readAlongVerbositySettingsComponentsMap }
      prefs={ {
        main: verbosityPrefs?.main ?? defaultReadAlongVerbosityMain,
        subPanel: verbosityPrefs?.subPanel === null ? null : verbosityPrefs?.subPanel ?? defaultReadAlongVerbositySubpanel,
        header: verbosityPrefs?.header
      } }
      defaultPrefs={ {
        main: defaultReadAlongVerbosityMain,
        subPanel: defaultReadAlongVerbositySubpanel
      }}
    />
    </>
  );
}

export const StatefulReadAlongVerbosityGroupContainer = () => {
  const { preferences } = usePreferences();
  const { readAlongVerbositySettingsComponentsMap } = usePlugins();

  const subPanel = preferences.readAlong.settings.verbosity?.subPanel ?? defaultReadAlongVerbositySubpanel;

  return(
    <>
    { subPanel.map((key: ThReadAlongVerbosityKeys) => {
      const match = readAlongVerbositySettingsComponentsMap[key];
      if (!match) {
        console.warn(`Setting key "${ key }" not found in the plugin registry while present in preferences.`);
        return null;
      }
      return <match.Comp key={ key } standalone={ true } />;
    }) }
    </>
  )
}
