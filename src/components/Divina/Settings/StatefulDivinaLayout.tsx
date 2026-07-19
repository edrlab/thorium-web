"use client";

import { useCallback } from "react";

import { ThLayoutOptions, ThSettingsKeys } from "@/preferences/models";
import { SETTINGS_KEY_TO_PREFERENCE } from "../../Settings/helpers/settingsKeyMapping";

import ScrollableIcon from "../../Epub/Settings/assets/icons/contract.svg";
import PaginatedIcon from "../../Epub/Settings/assets/icons/docs.svg";

import { StatefulRadioGroup } from "../../Settings/StatefulRadioGroup";

import { useDivinaNavigator } from "@/core/Hooks/Divina/useDivinaNavigator";
import { useI18n } from "@/i18n/useI18n";

import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { setDivinaScrolled } from "@/lib/divinaSettingsReducer";

export const StatefulDivinaLayout = () => {
  const { t } = useI18n();

  const dispatch = useAppDispatch();

  const { getSetting, submitPreferences, preferencesEditor } = useDivinaNavigator();

  const scrolledPref = useAppSelector(state => state.divinaSettings.scrolled);
  const isScrolled = getSetting("scrolled") ?? scrolledPref ?? false;

  // Natively scrolled publications (webtoons) can't be switched to paged mode
  const isForcedScrolled = preferencesEditor ? !preferencesEditor.scrolled.isEffective : false;

  const items = [
    {
      id: ThLayoutOptions.paginated,
      icon: PaginatedIcon,
      label: t("reader.preferences.layout.paginated"),
      value: ThLayoutOptions.paginated
    },
    {
      id: ThLayoutOptions.scroll,
      icon: ScrollableIcon,
      label: t("reader.preferences.layout.scrolled"),
      value: ThLayoutOptions.scroll
    }
  ];

  const prefKey = SETTINGS_KEY_TO_PREFERENCE[ThSettingsKeys.divinaLayout];

  const updatePreference = useCallback(async (value: string) => {
    const derivedValue = value === ThLayoutOptions.scroll;
    await submitPreferences({ [prefKey]: derivedValue });
    dispatch(setDivinaScrolled(getSetting(prefKey)));
  }, [prefKey, submitPreferences, getSetting, dispatch]);

  return (
    <>
    <StatefulRadioGroup
      standalone={ true }
      label={ t("reader.preferences.layout.title") }
      orientation="horizontal"
      value={ isScrolled ? ThLayoutOptions.scroll : ThLayoutOptions.paginated }
      onChange={ async (val: string) => await updatePreference(val) }
      isDisabled={ isForcedScrolled }
      items={ items }
    />
    </>
  )
}
