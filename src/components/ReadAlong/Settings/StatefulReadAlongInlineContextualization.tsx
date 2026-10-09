"use client";

import { useCallback } from "react";

import { ThReadAlongKeys } from "@/preferences";
import { getPreferenceKey } from "../../Settings/helpers/settingsKeyMapping";

import { StatefulSettingsItemProps } from "../../Settings/models/settings";

import { StatefulSwitch } from "../../Settings/StatefulSwitch";

import { useNavigator } from "@/core/Navigator";
import { useI18n } from "@/i18n/useI18n";

import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { setReadAlongInlineContextualization } from "@/lib/readAlongSettingsReducer";

export const StatefulReadAlongInlineContextualization = ({ standalone = true }: StatefulSettingsItemProps) => {
  const { t } = useI18n();

  const inlineContextualization = useAppSelector(state => state.readAlongSettings.inlineContextualization);
  const dispatch = useAppDispatch();

  const readAloud = useNavigator().readAloud;

  const prefKey = getPreferenceKey(ThReadAlongKeys.inlineContextualization, "readAlong");

  const updatePreference = useCallback(async (value: boolean) => {
    if (!readAloud) return;
    await readAloud.submitPreferences({ [prefKey]: value });
    dispatch(setReadAlongInlineContextualization(readAloud.getSetting(prefKey)));
  }, [prefKey, readAloud, dispatch]);

  return(
    <>
    <StatefulSwitch
      standalone={ standalone }
      heading={ t("_pendingThoriumLocales.reader.readAlong.preferences.inlineContextualization.title") }
      label={ t("_pendingThoriumLocales.reader.readAlong.preferences.inlineContextualization.label") }
      onChange={ async (isSelected: boolean) => await updatePreference(isSelected) }
      isSelected={ inlineContextualization ?? readAloud?.getSetting(prefKey) ?? false }
      isDisabled={ !readAloud }
    />
    </>
  )
}
