"use client";

import { useCallback } from "react";

import { useLocale } from "../AppLocale";

import { StatefulSettingsItemProps } from "../../Settings/models/settings";

import { StatefulSwitch } from "../../Settings/StatefulSwitch";

import { useEpubNavigator } from "@/core/Hooks/Epub/useEpubNavigator";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { setTextNormalization } from "@/lib/settingsReducer";

// TMP Component that is not meant to be implemented AS-IS, for testing purposes
export const StatefulTextNormalize = ({ standalone = true }: StatefulSettingsItemProps) => {
  const textNormalization = useAppSelector(state => state.settings.textNormalization);
  const dispatch = useAppDispatch();
  const locale = useLocale();

  const { getSetting, submitPreferences } = useEpubNavigator();

  const updatePreference = useCallback(async (value: boolean) => {
    await submitPreferences({ textNormalization: value });

    dispatch(setTextNormalization(getSetting("textNormalization")));
  }, [submitPreferences, getSetting, dispatch]);

  return(
    <>
    <StatefulSwitch 
      standalone={ standalone }
      heading={ locale.reader.settings.normalizeText.title }
      label={ locale.reader.settings.normalizeText.label }
      onChange={ async (isSelected: boolean) => await updatePreference(isSelected) }
      isSelected={ textNormalization ?? false }
    />
    </>
  )
}