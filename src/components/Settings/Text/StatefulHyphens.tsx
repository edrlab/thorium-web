"use client";

import { useCallback } from "react";

import { ThSettingsKeys } from "@/preferences/models";
import { getPreferenceKey } from "../helpers/settingsKeyMapping";

import { StatefulSettingsItemProps } from "../models/settings";
import { ThTextAlignOptions } from "@/preferences/models";

import { StatefulSwitch } from "../StatefulSwitch";

import { useNavigator } from "@/core/Navigator";
import { useI18n } from "@/i18n/useI18n";

import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { useReaderSetting } from "../hooks/useReaderSetting";
import { setHyphens } from "@/lib/settingsReducer";
import { setWebPubHyphens } from "@/lib/webPubSettingsReducer";

// TMP Component that is not meant to be implemented AS-IS, for testing purposes
export const StatefulHyphens = ({ standalone = true }: StatefulSettingsItemProps) => {
  const { t } = useI18n();

  const profile = useAppSelector(state => state.reader.profile);
  const isWebPub = profile === "webPub";
  
  const hyphens = useReaderSetting("hyphens");
  const textAlign = useReaderSetting("textAlign");

  const dispatch = useAppDispatch();
  
  const { getSetting, submitPreferences } = useNavigator().visual;

  const prefKey = getPreferenceKey(ThSettingsKeys.hyphens, isWebPub ? "webPub" : "epub");

  const updatePreference = useCallback(async (value: boolean) => {
    await submitPreferences({ [prefKey]: value });
    const effectiveSetting = getSetting(prefKey);
  
    if (isWebPub) {
      dispatch(setWebPubHyphens(effectiveSetting));
    } else {
      dispatch(setHyphens(effectiveSetting));
    }
  }, [prefKey, isWebPub, submitPreferences, getSetting, dispatch]);

  return(
    <>
    <StatefulSwitch 
      standalone={ standalone }
      heading={ t("reader.preferences.hyphens.title") }
      label={ t("reader.preferences.hyphens.label") }
      onChange={ async (isSelected: boolean) => await updatePreference(isSelected) }
      isSelected={ hyphens ?? false }
      isDisabled={ textAlign === ThTextAlignOptions.publisher }
    />
    </>
  )
}