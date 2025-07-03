"use client";

import { useCallback } from "react";

import { defaultLetterSpacing, ThSettingsKeys, ThSettingsRangeVariant } from "@/preferences";

import { useLocale } from "../AppLocale";

import { StatefulSettingsItemProps } from "../../Settings/models/settings";

import { StatefulNumberField } from "../../Settings/StatefulNumberField";
import { StatefulSlider } from "../../Settings/StatefulSlider";

import { usePreferences } from "@/preferences/hooks/usePreferences";
import { useEpubNavigator } from "@/core/Hooks/Epub/useEpubNavigator";

import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { setLetterSpacing, setPublisherStyles } from "@/lib/settingsReducer";

export const StatefulLetterSpacing = ({ standalone = true }: StatefulSettingsItemProps) => {
  const RSPrefs = usePreferences();
  const letterSpacing = useAppSelector(state => state.settings.letterSpacing);
  const letterSpacingRangeConfig = {
    variant: RSPrefs.settings.keys?.[ThSettingsKeys.letterSpacing]?.variant ?? defaultLetterSpacing.variant,
    range: RSPrefs.settings.keys?.[ThSettingsKeys.letterSpacing]?.range ?? defaultLetterSpacing.range,
    step: RSPrefs.settings.keys?.[ThSettingsKeys.letterSpacing]?.step ?? defaultLetterSpacing.step
  };
  const dispatch = useAppDispatch();
  const locale = useLocale();

  const { getSetting, submitPreferences } = useEpubNavigator();

  const updatePreference = useCallback(async (value: number) => {
    await submitPreferences({
      letterSpacing: value
    });

    dispatch(setLetterSpacing(getSetting("letterSpacing")));
    dispatch(setPublisherStyles(false));
  }, [submitPreferences, getSetting, dispatch]);

  return (
    <>
    { letterSpacingRangeConfig.variant === ThSettingsRangeVariant.numberField 
      ? <StatefulNumberField 
        standalone={ standalone }
        label={ locale.reader.settings.letterSpacing.title }
        defaultValue={ 0 } 
        value={ letterSpacing || 0 } 
        onChange={ async(value) => await updatePreference(value) } 
        range={ letterSpacingRangeConfig.range }
        step={ letterSpacingRangeConfig.step }
        steppers={{
          decrementLabel: locale.reader.settings.letterSpacing.decrease,
          incrementLabel: locale.reader.settings.letterSpacing.increase
        }}
        formatOptions={{ style: "percent" }} 
        isWheelDisabled={ true }
        isVirtualKeyboardDisabled={ true }
      />
      : <StatefulSlider
        standalone={ standalone }
        label={ locale.reader.settings.letterSpacing.title }
        defaultValue={ 0 } 
        value={ letterSpacing || 0 } 
        onChange={ async(value) => await updatePreference(value as number) } 
        range={ letterSpacingRangeConfig.range }
        step={ letterSpacingRangeConfig.step }
        formatOptions={ { style: "percent" } }
      />
    } 
    </>
  )
}