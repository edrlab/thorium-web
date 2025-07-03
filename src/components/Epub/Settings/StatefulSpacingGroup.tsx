"use client";

import { useCallback } from "react";

import { 
  defaultSpacingSettingsMain, 
  defaultSpacingSettingsSubpanel, 
  ThSettingsContainerKeys, 
  ThSpacingSettingsKeys 
} from "@/preferences";

import { useLocale } from "../AppLocale";

import { StatefulGroupWrapper } from "../../Settings/StatefulGroupWrapper";

import { usePreferences } from "@/preferences/hooks/usePreferences";
import { usePlugins } from "../../Plugins/PluginProvider";

import { useAppDispatch } from "@/lib/hooks";
import { setSettingsContainer } from "@/lib/readerReducer";

export const StatefulSpacingGroup = () => {
  const RSPrefs = usePreferences();
  const { spacingSettingsComponentsMap } = usePlugins();
  const dispatch = useAppDispatch();
  const locale = useLocale();
  
  const setSpacingContainer = useCallback(() => {
    dispatch(setSettingsContainer(ThSettingsContainerKeys.spacing));
  }, [dispatch]);

  return (
    <>
    <StatefulGroupWrapper 
      heading={ locale.reader.settings.spacing.title }
      moreLabel={ locale.reader.settings.spacing.advanced.trigger }
      moreTooltip={ locale.reader.settings.spacing.advanced.tooltip }
      onPressMore={ setSpacingContainer }
      componentsMap={ spacingSettingsComponentsMap }
      prefs={ RSPrefs.settings.spacing }
      defaultPrefs={ {
        main: defaultSpacingSettingsMain, 
        subPanel: defaultSpacingSettingsSubpanel
      }}
    />
    </>
  );
}

export const StatefulSpacingGroupContainer = () => {
  const RSPrefs = usePreferences();
  const displayOrder = RSPrefs.settings.spacing?.subPanel as ThSpacingSettingsKeys[] | null | undefined || defaultSpacingSettingsSubpanel;
  const { spacingSettingsComponentsMap } = usePlugins();

  return(
    <>
    { displayOrder.map((key: ThSpacingSettingsKeys) => {
      const match = spacingSettingsComponentsMap[key];
      if (!match) {
        console.warn(`Setting key "${ key }" not found in the plugin registry while present in preferences.`);
        return null;
      }
      return <match.Comp key={ key } standalone={ true } />;
    }) }
    </>
  )
}