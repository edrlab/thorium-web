"use client";

import { useMemo, useCallback } from "react";

import { ThSettingsKeys } from "@/preferences/models";
import { getPreferenceKey } from "../helpers/settingsKeyMapping";

import { StatefulSettingsItemProps } from "../models/settings";

import DefaultIcon from "./assets/icons/format_bold_wght200.svg";
import BolderIcon from "./assets/icons/format_bold_wght500.svg";

import { StatefulRadioGroup } from "@/components/Settings/StatefulRadioGroup";

import { useNavigator } from "@/core/Navigator";
import { useI18n } from "@/i18n/useI18n";

import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { useReaderSetting } from "../hooks/useReaderSetting";
import { setFontWeight } from "@/lib/settingsReducer";
import { setWebPubFontWeight } from "@/lib/webPubSettingsReducer";

type FontWeight = "default" | "bolder";

export const UnstableStatefulFontWeight = ({ standalone = true }: StatefulSettingsItemProps) => {
  const { t } = useI18n();

  const profile = useAppSelector(state => state.reader.profile);
  const isWebPub = profile === "webPub";
  
  const fontWeight = useReaderSetting("fontWeight");

  const dispatch = useAppDispatch();

  const { getSetting, submitPreferences } = useNavigator().visual;

  const prefKey = getPreferenceKey(ThSettingsKeys.fontWeight, isWebPub ? "webPub" : "epub");

  const items = [
    {
      id: "default",
      icon: DefaultIcon,
      label: t("reader.preferences.fontWeight.normal"), 
      value: "default" 
    },
    {
      id: "bolder",
      icon: BolderIcon,
      label: t("reader.preferences.fontWeight.bold"), 
      value: "bolder" 
    }
  ];

  const derivedValue = useMemo(() => {
    if (fontWeight === 400) {
      return "default";
    } else if (fontWeight === 700) {
      return "bolder";
    }
    return "default";
  }, [fontWeight]);

  const updatePreference = useCallback(async (value: FontWeight) => {
    const fontWeightValue = value === "default" ? 400 : 700;
    await submitPreferences({ [prefKey]: fontWeightValue });
    const effectiveSetting = getSetting(prefKey);

    if (isWebPub) {
      dispatch(setWebPubFontWeight(effectiveSetting));
    } else {
      dispatch(setFontWeight(effectiveSetting));
    }
  }, [prefKey, isWebPub, submitPreferences, getSetting, dispatch]);

  return(
    <>
    <StatefulRadioGroup 
      standalone={ standalone } 
      label={ t("reader.preferences.fontWeight.title") }
      orientation="horizontal" 
      value={ derivedValue } 
      onChange={ async (val: string) => await updatePreference(val as FontWeight) }
      items={ items }
    />  
    </>
  )
}