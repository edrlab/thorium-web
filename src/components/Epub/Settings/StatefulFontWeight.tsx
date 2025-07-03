"use client";

import { useCallback } from "react";

import { useLocale } from "../AppLocale";

import { StatefulSettingsItemProps } from "../../Settings/models/settings";
import { fontWeightRangeConfig } from "@readium/navigator";

import { StatefulSlider } from "../../Settings/StatefulSlider";

import { useEpubNavigator } from "@/core/Hooks/Epub/useEpubNavigator";

import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { setFontWeight } from "@/lib/settingsReducer";

export const StatefulFontWeight = ({ standalone = true }: StatefulSettingsItemProps) => {
  const fontFamily = useAppSelector(state => state.settings.fontFamily);
  const fontWeight = useAppSelector(state => state.settings.fontWeight);
  const dispatch = useAppDispatch();
  const locale = useLocale();

  const { getSetting, submitPreferences } = useEpubNavigator();

  const updatePreference = useCallback(async (value: number) => {
    await submitPreferences({ fontWeight: value });

    dispatch(setFontWeight(getSetting("fontWeight")));
  }, [submitPreferences, getSetting, dispatch]);

  return(
    <>
    <StatefulSlider
      standalone={ standalone }
      label={ locale.reader.settings.fontWeight.title }
      defaultValue={ 400 } 
      value={ fontWeight } 
      onChange={ async(value) => await updatePreference(value as number) } 
      range={ fontWeightRangeConfig.range }
      step={ fontWeightRangeConfig.step }
      isDisabled={ fontFamily === "publisher" }
    /> 
    </>
  )
}