"use client";

import { useCallback } from "react";

import { DivinaQuality } from "@readium/navigator";
import { ThSettingsKeys } from "@/preferences/models";
import { SETTINGS_KEY_TO_PREFERENCE } from "../../Settings/helpers/settingsKeyMapping";

import { StatefulRadioGroup } from "../../Settings/StatefulRadioGroup";

import { usePreferences } from "@/preferences/hooks/usePreferences";

import { useDivinaNavigator } from "@/core/Hooks/Divina/useDivinaNavigator";
import { useI18n } from "@/i18n/useI18n";

import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { setDivinaQuality } from "@/lib/divinaSettingsReducer";

export const StatefulDivinaQuality = () => {
  const { t } = useI18n();
  const { preferences } = usePreferences();

  const dispatch = useAppDispatch();

  const { getSetting, submitPreferences } = useDivinaNavigator();

  const qualityPref = useAppSelector(state => state.divinaSettings.quality);
  const quality = getSetting("quality") ?? qualityPref ?? DivinaQuality.auto;

  const items = [
    {
      id: DivinaQuality.auto,
      label: t("reader.preferences.divinaQuality.auto"),
      value: DivinaQuality.auto
    },
    {
      id: DivinaQuality.low,
      label: t("reader.preferences.divinaQuality.low"),
      value: DivinaQuality.low
    },
    {
      id: DivinaQuality.high,
      label: t("reader.preferences.divinaQuality.high"),
      value: DivinaQuality.high
    },
    {
      id: DivinaQuality.max,
      label: t("reader.preferences.divinaQuality.max"),
      value: DivinaQuality.max
    }
    // The platform decides which qualities it can serve (e.g. no "max" when
    // no such variants exist in its manifests)
  ].filter(item => preferences.settings.keys[ThSettingsKeys.divinaQuality].choices.includes(item.value));

  const prefKey = SETTINGS_KEY_TO_PREFERENCE[ThSettingsKeys.divinaQuality];

  const updatePreference = useCallback(async (value: string) => {
    await submitPreferences({ [prefKey]: value as DivinaQuality });
    dispatch(setDivinaQuality(getSetting(prefKey)));
  }, [prefKey, submitPreferences, getSetting, dispatch]);

  return (
    <>
    <StatefulRadioGroup
      standalone={ true }
      label={ t("reader.preferences.divinaQuality.title") }
      orientation="horizontal"
      value={ quality }
      onChange={ async (val: string) => await updatePreference(val) }
      items={ items }
    />
    </>
  )
}
