"use client";

import { useCallback } from "react";

import { defaultWordSpacing, ThSettingsKeys, ThSettingsRangeVariant } from "@/preferences";

import { useLocale } from "../AppLocale";

import { StatefulSettingsItemProps } from "../../Settings/models/settings";

import { StatefulNumberField } from "../../Settings/StatefulNumberField";
import { StatefulSlider } from "../../Settings/StatefulSlider";

import { usePreferences } from "@/preferences/hooks/usePreferences";
import { useEpubNavigator } from "@/core/Hooks/Epub/useEpubNavigator";

import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { setPublisherStyles, setWordSpacing } from "@/lib/settingsReducer";

export const StatefulWordSpacing = ({ standalone = true }: StatefulSettingsItemProps) => {
  const RSPrefs = usePreferences();
  const wordSpacing = useAppSelector(state => state.settings.wordSpacing);
  const wordSpacingRangeConfig = {
    variant: RSPrefs.settings.keys?.[ThSettingsKeys.wordSpacing]?.variant ?? defaultWordSpacing.variant,
    range: RSPrefs.settings.keys?.[ThSettingsKeys.wordSpacing]?.range ?? defaultWordSpacing.range,
    step: RSPrefs.settings.keys?.[ThSettingsKeys.wordSpacing]?.step ?? defaultWordSpacing.step
  };
  const dispatch = useAppDispatch();
  const locale = useLocale();

  const { getSetting, submitPreferences } = useEpubNavigator();

  const updatePreference = useCallback(async (value: number) => {
    await submitPreferences({
      wordSpacing: value
    });

    dispatch(setWordSpacing(getSetting("wordSpacing")));
    dispatch(setPublisherStyles(false));
  }, [submitPreferences, getSetting, dispatch]);

  return (
    <>
    { wordSpacingRangeConfig.variant === ThSettingsRangeVariant.numberField 
      ? <StatefulNumberField 
        standalone={ standalone }
        label={ locale.reader.settings.wordSpacing.title }
        defaultValue={ 0 } 
        value={ wordSpacing || 0 } 
        onChange={ async(value) => await updatePreference(value) } 
        range={ wordSpacingRangeConfig.range }
        step={ wordSpacingRangeConfig.step }
        steppers={{
          decrementLabel: locale.reader.settings.wordSpacing.decrease,
          incrementLabel: locale.reader.settings.wordSpacing.increase
        }}
        formatOptions={{ style: "percent" }} 
        isWheelDisabled={ true }
        isVirtualKeyboardDisabled={ true }
      />
      : <StatefulSlider
        standalone={ standalone }
        label={ locale.reader.settings.wordSpacing.title }
        defaultValue={ 0 } 
        value={ wordSpacing || 0 } 
        onChange={ async(value) => await updatePreference(value as number) } 
        range={ wordSpacingRangeConfig.range }
        step={ wordSpacingRangeConfig.step }
        formatOptions={{ style: "percent" }}
      /> 
    }
    </>
  )
}