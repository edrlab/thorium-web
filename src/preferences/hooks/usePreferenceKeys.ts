"use client";

import { 
  ThSpacingPresetKeys,
  defaultSpacingSettingsSubpanel,
  defaultTextSettingsMain,
  defaultTextSettingsSubpanel,
  defaultSpacingSettingsMain,
  defaultSpacingPresetsOrder
} from "@/preferences/models";

import { usePreferences } from "./usePreferences";

export const usePreferenceKeys = () => {
  const { preferences } = usePreferences();

  const reflowActionKeys = preferences.actions.reflowOrder;
  const fxlActionKeys = preferences.actions.fxlOrder;
  const webPubActionKeys = preferences.actions.webPubOrder;
  const divinaActionKeys = preferences.actions.divinaOrder ?? preferences.actions.fxlOrder;

  const reflowThemeKeys = preferences.theming.themes.reflowOrder;
  const fxlThemeKeys = preferences.theming.themes.fxlOrder;
  const divinaThemeKeys = preferences.theming.themes.divinaOrder ?? preferences.theming.themes.fxlOrder;

  const reflowSettingsKeys = preferences.settings.reflowOrder;
  const fxlSettingsKeys = preferences.settings.fxlOrder;
  const webPubSettingsKeys = preferences.settings.webPubOrder;
  const divinaSettingsKeys = preferences.settings.divinaOrder ?? [];

  const mainTextSettingsKeys = preferences.settings.text?.main ?? defaultTextSettingsMain;
  const subPanelTextSettingsKeys = preferences.settings.text?.subPanel ?? defaultTextSettingsSubpanel;
  const mainSpacingSettingsKeys = preferences.settings.spacing?.main ?? defaultSpacingSettingsMain;
  const subPanelSpacingSettingsKeys = preferences.settings.spacing?.subPanel ?? defaultSpacingSettingsSubpanel;

  const reflowSpacingPresetKeys = preferences.settings.spacing?.presets?.reflowOrder ?? defaultSpacingPresetsOrder;
  const fxlSpacingPresetKeys: ThSpacingPresetKeys[] = [];
  const webPubSpacingPresetKeys = preferences.settings.spacing?.presets?.webPubOrder ?? defaultSpacingPresetsOrder;

  return {
    reflowActionKeys,
    fxlActionKeys,
    webPubActionKeys,
    divinaActionKeys,
    reflowThemeKeys,
    fxlThemeKeys,
    divinaThemeKeys,
    reflowSettingsKeys,
    fxlSettingsKeys,
    webPubSettingsKeys,
    divinaSettingsKeys,
    mainTextSettingsKeys,
    subPanelTextSettingsKeys,
    mainSpacingSettingsKeys,
    subPanelSpacingSettingsKeys,
    reflowSpacingPresetKeys,
    fxlSpacingPresetKeys,
    webPubSpacingPresetKeys
  };
}