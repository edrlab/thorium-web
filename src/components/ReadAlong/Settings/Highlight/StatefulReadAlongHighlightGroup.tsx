"use client";

import { useCallback } from "react";

import {
  defaultReadAlongHighlightMain,
  defaultReadAlongHighlightSubpanel,
  ThReadAlongHighlightKeys,
  ThReadAlongSettingsContainerKeys
} from "@/preferences/models";

import { StatefulGroupWrapper } from "../../../Settings/StatefulGroupWrapper";

import { usePreferences } from "@/preferences/hooks/usePreferences";
import { usePlugins } from "../../../Plugins/PluginProvider";
import { useI18n } from "@/i18n/useI18n";

import { useAppDispatch } from "@/lib/hooks";
import { setReadAlongSettingsContainer } from "@/lib/readAlongPlayerReducer";

export const StatefulReadAlongHighlightGroup = () => {
  const { preferences } = usePreferences();
  const { t } = useI18n();
  const { readAlongHighlightSettingsComponentsMap } = usePlugins();

  const highlightPrefs = preferences.readAlong.settings.highlight;

  const dispatch = useAppDispatch();

  const setHighlightContainer = useCallback(() => {
    dispatch(setReadAlongSettingsContainer(ThReadAlongSettingsContainerKeys.highlight));
  }, [dispatch]);

  return (
    <>
    <StatefulGroupWrapper<ThReadAlongHighlightKeys>
      label={ t("reader.playback.preferences.readAloud.highlight.title") }
      moreLabel={ t("reader.readAlong.settings.highlight.advanced.trigger") }
      moreTooltip={ t("reader.readAlong.settings.highlight.advanced.tooltip") }
      onPressMore={ setHighlightContainer }
      componentsMap={ readAlongHighlightSettingsComponentsMap }
      prefs={ {
        main: highlightPrefs?.main ?? defaultReadAlongHighlightMain,
        subPanel: highlightPrefs?.subPanel === null ? null : highlightPrefs?.subPanel ?? defaultReadAlongHighlightSubpanel,
        header: highlightPrefs?.header
      } }
      defaultPrefs={ {
        main: defaultReadAlongHighlightMain,
        subPanel: defaultReadAlongHighlightSubpanel
      }}
    />
    </>
  );
}

export const StatefulReadAlongHighlightGroupContainer = () => {
  const { preferences } = usePreferences();
  const { readAlongHighlightSettingsComponentsMap } = usePlugins();

  const subPanel = preferences.readAlong.settings.highlight?.subPanel ?? defaultReadAlongHighlightSubpanel;

  return(
    <>
    { subPanel.map((key: ThReadAlongHighlightKeys) => {
      const match = readAlongHighlightSettingsComponentsMap[key];
      if (!match) {
        console.warn(`Setting key "${ key }" not found in the plugin registry while present in preferences.`);
        return null;
      }
      return <match.Comp key={ key } standalone={ true } />;
    }) }
    </>
  )
}
