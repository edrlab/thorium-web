"use client";

import { useCallback } from "react";

import { ThReadAlongKeys } from "@/preferences";
import { getPreferenceKey } from "../../../Settings/helpers/settingsKeyMapping";

import { StatefulSettingsItemProps } from "../../../Settings/models/settings";

import { StatefulSwitch } from "../../../Settings/StatefulSwitch";

import { useNavigator } from "@/core/Navigator";
import { useI18n } from "@/i18n/useI18n";
import { useIsScroll } from "@/hooks/useIsScroll";

import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { setReadAlongKeepCentered } from "@/lib/readAlongSettingsReducer";

export const StatefulReadAlongKeepCentered = ({ standalone = true }: StatefulSettingsItemProps) => {
  const { t } = useI18n();

  const keepCentered = useAppSelector(state => state.readAlongSettings.keepCentered);
  const isScroll = useIsScroll();
  const dispatch = useAppDispatch();

  const readAloud = useNavigator().readAloud;

  const prefKey = getPreferenceKey(ThReadAlongKeys.keepCentered, "readAlong");

  const updatePreference = useCallback(async (value: boolean) => {
    if (!readAloud) return;
    await readAloud.submitPreferences({ [prefKey]: value });
    dispatch(setReadAlongKeepCentered(readAloud.getSetting(prefKey)));
  }, [prefKey, readAloud, dispatch]);

  return(
    <>
    <StatefulSwitch
      standalone={ standalone }
      heading={ t("_pendingThoriumLocales.reader.readAlong.preferences.keepCentered.title") }
      label={ t("_pendingThoriumLocales.reader.readAlong.preferences.keepCentered.label") }
      onChange={ async (isSelected: boolean) => await updatePreference(isSelected) }
      isSelected={ keepCentered ?? readAloud?.getSetting(prefKey) ?? false }
      isDisabled={ !readAloud || !isScroll }
    />
    </>
  )
}
