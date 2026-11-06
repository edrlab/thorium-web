"use client";

import { useCallback } from "react";

import { ThSettingsKeys, ThSettingsRangeVariant, ThSpacingSettingsKeys } from "@/preferences";
import { getPreferenceKey } from "../helpers/settingsKeyMapping";

import { StatefulSettingsItemProps } from "../models/settings";

import { StatefulNumberField } from "../StatefulNumberField";
import { StatefulSlider } from "../StatefulSlider";

import { usePreferences } from "@/preferences/hooks/usePreferences";
import { useNavigator } from "@/core/Navigator";
import { EpubPreferencesEditor } from "@readium/navigator";
import { useI18n } from "@/i18n/useI18n";
import { useSpacingPresets } from "./hooks/useSpacingPresets";
import { usePlaceholder } from "../hooks/usePlaceholder";
import { useEffectiveRange } from "../hooks/useEffectiveRange";

import { useAppSelector } from "@/lib/hooks";

export const StatefulWordSpacing = ({ standalone = true }: StatefulSettingsItemProps) => {
  const { preferences } = usePreferences();
  const { t } = useI18n();

  const config = preferences.settings.keys[ThSettingsKeys.wordSpacing];

  const { getSetting, submitPreferences, preferencesEditor } = useNavigator().visual;

  const { range } = useEffectiveRange(config.range, (preferencesEditor as EpubPreferencesEditor | undefined)?.wordSpacing?.supportedRange);

  const wordSpacingRangeConfig = {
    variant: config.variant,
    placeholder: config.placeholder,
    range,
    step: config.step
  };

  const placeholderText = usePlaceholder(wordSpacingRangeConfig.placeholder, wordSpacingRangeConfig.range, "percent");

  const { getEffectiveSpacingValue, setWordSpacing, canBeReset } = useSpacingPresets();

  const wordSpacing = getEffectiveSpacingValue(ThSpacingSettingsKeys.wordSpacing);

  const profile = useAppSelector(state => state.reader.profile);
  const isWebPub = profile === "webPub";

  const prefKey = getPreferenceKey(ThSettingsKeys.wordSpacing, isWebPub ? "webPub" : "epub");

  const updatePreference = useCallback(async (value: number | number[] | null) => {
    await submitPreferences({
      [prefKey]: Array.isArray(value) ? value[0] : value
    });

    setWordSpacing(getSetting(prefKey));
  }, [prefKey, submitPreferences, getSetting, setWordSpacing]);

  return (
    <>
    { wordSpacingRangeConfig.variant === ThSettingsRangeVariant.numberField 
      ? <StatefulNumberField 
        standalone={ standalone }
        label={ t("reader.preferences.wordSpacing") }
        placeholder={ placeholderText }
        defaultValue={ undefined } 
        value={ wordSpacing ?? undefined } 
        onChange={ async(value) => await updatePreference(value) } 
        onReset={ canBeReset(ThSpacingSettingsKeys.wordSpacing) ? async() => await updatePreference(null) : undefined }
        range={ wordSpacingRangeConfig.range }
        step={ wordSpacingRangeConfig.step }
        steppers={{
          decrementLabel: t("common.actions.decrease"),
          incrementLabel: t("common.actions.increase")
        }}
        formatOptions={{ style: "percent" }} 
        isWheelDisabled={ true }
        isVirtualKeyboardDisabled={ true }
      />
      : <StatefulSlider
        standalone={ standalone }
        displayTicks={ wordSpacingRangeConfig.variant === ThSettingsRangeVariant.incrementedSlider }
        label={ t("reader.preferences.wordSpacing") }
        placeholder={ placeholderText }
        defaultValue={ undefined } 
        value={ wordSpacing ?? undefined } 
        onChange={ async(value) => await updatePreference(value as number) } 
        onReset={ canBeReset(ThSpacingSettingsKeys.wordSpacing) ? async() => await updatePreference(null) : undefined }
        range={ wordSpacingRangeConfig.range }
        step={ wordSpacingRangeConfig.step }
        formatOptions={{ style: "percent" }}
      /> 
    }
    </>
  )
}