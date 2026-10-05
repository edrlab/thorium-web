"use client";

import { useCallback } from "react";

import { DivinaPreferencesEditor } from "@readium/navigator";
import { ThLayoutOptions, ThSettingsKeys } from "@/preferences/models";
import { SETTINGS_KEY_TO_PREFERENCE } from "./helpers/settingsKeyMapping";

import ScrollableIcon from "./assets/icons/contract.svg";
import PaginatedIcon from "./assets/icons/docs.svg";

import { StatefulRadioGroup } from "./StatefulRadioGroup";

import { useNavigator } from "@/core/Navigator";
import { useI18n } from "@/i18n/useI18n";

import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { setScroll } from "@/lib/settingsReducer";
import { setDivinaScrolled } from "@/lib/divinaSettingsReducer";
import { useIsScroll } from "@/hooks";

export const StatefulLayout = () => {
  const { t } = useI18n();
  const isScroll = useIsScroll();

  const readerProfile = useAppSelector(state => state.reader.profile);

  const dispatch = useAppDispatch();

  const { getSetting, submitPreferences, preferencesEditor } = useNavigator().visual;

  // Natively scrolled publications (webtoons) can't be switched to paged mode
  const isForcedScrolled = readerProfile === "divina" && preferencesEditor
    ? !(preferencesEditor as DivinaPreferencesEditor).scrolled.isEffective
    : false;

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

  const prefKey = readerProfile === "divina"
    ? "scrolled" as const
    : SETTINGS_KEY_TO_PREFERENCE[ThSettingsKeys.layout];

  const updatePreference = useCallback(async (value: string) => {
    const derivedValue = value === ThLayoutOptions.scroll;
    await submitPreferences({ [prefKey]: derivedValue });
    if (readerProfile === "divina") {
      dispatch(setDivinaScrolled(getSetting(prefKey)));
    } else {
      dispatch(setScroll(getSetting(prefKey)));
    }
  }, [readerProfile, prefKey, submitPreferences, getSetting, dispatch]);

  return (
    <>
    <StatefulRadioGroup
      standalone={ true }
      label={ t("reader.preferences.layout.title") }
      orientation="horizontal"
      value={ isScroll ? ThLayoutOptions.scroll : ThLayoutOptions.paginated }
      onChange={ async (val: string) => await updatePreference(val) }
      isDisabled={ isForcedScrolled }
      items={ items }
    />
    </>
  )
}
