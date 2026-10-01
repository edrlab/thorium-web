"use client";

import { useCallback } from "react";

import { ThSettingsKeys } from "@/preferences/models";
import { SETTINGS_KEY_TO_PREFERENCE } from "../../Settings/helpers/settingsKeyMapping";

import DecreaseIcon from "../../Settings/assets/icons/zoom_out.svg";
import IncreaseIcon from "../../Settings/assets/icons/zoom_in.svg";

import { StatefulNumberField } from "../../Settings/StatefulNumberField";

import { stripWidthRangeConfig } from "@readium/navigator";
import { useDivinaNavigator } from "@/core/Hooks/Divina/useDivinaNavigator";
import { useI18n } from "@/i18n/useI18n";

import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { setDivinaStripWidth } from "@/lib/divinaSettingsReducer";

export const StatefulDivinaStripWidth = () => {
  const { t } = useI18n();

  const dispatch = useAppDispatch();

  const { getSetting, submitPreferences } = useDivinaNavigator();

  const stripWidthPref = useAppSelector(state => state.divinaSettings.stripWidth);
  const scrolledPref = useAppSelector(state => state.divinaSettings.scrolled);

  const value = getSetting("stripWidth") ?? stripWidthPref ?? 1000;

  // Strip width is only effective in scrolled mode
  const isScrolled = getSetting("scrolled") ?? scrolledPref ?? false;

  const prefKey = SETTINGS_KEY_TO_PREFERENCE[ThSettingsKeys.divinaStripWidth];

  const updatePreference = useCallback(async (newValue: number) => {
    await submitPreferences({ [prefKey]: newValue });
    dispatch(setDivinaStripWidth(getSetting(prefKey)));
  }, [prefKey, submitPreferences, getSetting, dispatch]);

  return (
    <>
    <StatefulNumberField
      standalone={ true }
      defaultValue={ 1000 }
      value={ value }
      onChange={ async (newValue: number) => await updatePreference(newValue) }
      label={ t("reader.preferences.divinaStripWidth") }
      range={ stripWidthRangeConfig.range }
      step={ stripWidthRangeConfig.step }
      steppers={{
        decrementIcon: DecreaseIcon,
        decrementLabel: t("common.actions.decrease"),
        incrementIcon: IncreaseIcon,
        incrementLabel: t("common.actions.increase")
      }}
      isWheelDisabled={ true }
      isVirtualKeyboardDisabled={ true }
      isDisabled={ !isScrolled }
    />
    </>
  )
}
