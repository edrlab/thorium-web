"use client";

import { useCallback } from "react";

import { ThSettingsKeys } from "@/preferences/models";
import { getPreferenceKey } from "../helpers/settingsKeyMapping";

import { StatefulSettingsItemProps } from "../models/settings";

import { StatefulSwitch } from "../StatefulSwitch";

import { useNavigator } from "@/core/Navigator";
import { useI18n } from "@/i18n/useI18n";

import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { useReaderSetting } from "../hooks/useReaderSetting";
import { setLigatures } from "@/lib/settingsReducer";
import { setWebPubLigatures } from "@/lib/webPubSettingsReducer";

export const StatefulLigatures = ({ standalone = true }: StatefulSettingsItemProps) => {
  const { t } = useI18n();

  const profile = useAppSelector(state => state.reader.profile);
  const isWebPub = profile === "webPub";

  const ligatures = useReaderSetting("ligatures");
  const dispatch = useAppDispatch();

  const { getSetting, submitPreferences } = useNavigator().visual;

  const prefKey = getPreferenceKey(ThSettingsKeys.ligatures);

  const updatePreference = useCallback(async (value: boolean) => {
    await submitPreferences({ [prefKey]: value });
    const effectiveSetting = getSetting(prefKey);

    if (isWebPub) {
      dispatch(setWebPubLigatures(effectiveSetting));
    } else {
      dispatch(setLigatures(effectiveSetting));
    }
  }, [prefKey, isWebPub, submitPreferences, getSetting, dispatch]);

  return(
    <>
    <StatefulSwitch
      standalone={ standalone }
      heading={ t("reader.preferences.ligatures.title") }
      label={ t("reader.preferences.ligatures.label") }
      onChange={ async (isSelected: boolean) => await updatePreference(isSelected) }
      isSelected={ ligatures ?? true }
    />
    </>
  )
}
