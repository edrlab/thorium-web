"use client";

import { useCallback } from "react";

import { ThSettingsKeys } from "@/preferences/models";
import { SETTINGS_KEY_TO_PREFERENCE } from "../../Settings/helpers/settingsKeyMapping";

import { StatefulSwitch } from "../../Settings/StatefulSwitch";

import { useDivinaNavigator } from "@/core/Hooks/Divina/useDivinaNavigator";
import { useI18n } from "@/i18n/useI18n";

import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { setDivinaSpreads } from "@/lib/divinaSettingsReducer";

export const StatefulDivinaSpreads = () => {
  const { t } = useI18n();

  const dispatch = useAppDispatch();

  const { getSetting, submitPreferences } = useDivinaNavigator();

  const spreadsPref = useAppSelector(state => state.divinaSettings.spreads);
  const scrolledPref = useAppSelector(state => state.divinaSettings.scrolled);

  const isSelected = getSetting("spreads") ?? spreadsPref ?? true;

  // Spreads are only effective in paged mode
  const isScrolled = getSetting("scrolled") ?? scrolledPref ?? false;

  const prefKey = SETTINGS_KEY_TO_PREFERENCE[ThSettingsKeys.divinaSpreads];

  const updatePreference = useCallback(async (value: boolean) => {
    await submitPreferences({ [prefKey]: value });
    dispatch(setDivinaSpreads(getSetting(prefKey)));
  }, [prefKey, submitPreferences, getSetting, dispatch]);

  return (
    <>
    <StatefulSwitch
      standalone={ true }
      heading={ t("reader.preferences.divinaSpreads.title") }
      label={ t("reader.preferences.divinaSpreads.label") }
      isSelected={ isSelected }
      onChange={ async (value: boolean) => await updatePreference(value) }
      isDisabled={ isScrolled }
    />
    </>
  )
}
