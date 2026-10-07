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

export const StatefulParagraphSpacing = ({ standalone = true }: StatefulSettingsItemProps) => {
  const { preferences } = usePreferences();
  const { t } = useI18n();

  const config = preferences.settings.keys[ThSettingsKeys.paragraphSpacing];

  const { getSetting, submitPreferences, preferencesEditor } = useNavigator().visual;

  const { range } = useEffectiveRange(config.range, (preferencesEditor as EpubPreferencesEditor | undefined)?.paragraphSpacing?.supportedRange);

  const paragraphSpacingRangeConfig = {
    variant: config.variant,
    placeholder: config.placeholder,
    range,
    step: config.step
  };

  const placeholderText = usePlaceholder(paragraphSpacingRangeConfig.placeholder, paragraphSpacingRangeConfig.range, "multiplier");

  const { getEffectiveSpacingValue, setParagraphSpacing, canBeReset } = useSpacingPresets();

  const paragraphSpacing = getEffectiveSpacingValue(ThSpacingSettingsKeys.paragraphSpacing);

  const prefKey = getPreferenceKey(ThSettingsKeys.paragraphSpacing);

  const updatePreference = useCallback(async (value: number | number[] | null) => {
    await submitPreferences({
      [prefKey]: Array.isArray(value) ? value[0] : value
    });

    setParagraphSpacing(getSetting(prefKey));
  }, [prefKey, submitPreferences, getSetting, setParagraphSpacing]);

  return (
    <>
    { paragraphSpacingRangeConfig.variant === ThSettingsRangeVariant.numberField 
      ? <StatefulNumberField 
        standalone={ standalone }
        label={ t("reader.preferences.paragraphSpacing") }
        placeholder={ placeholderText }
        defaultValue={ undefined } 
        value={ paragraphSpacing ?? undefined } 
        onChange={ async(value) => await updatePreference(value) } 
        onReset={ canBeReset(ThSpacingSettingsKeys.paragraphSpacing) ? async() => await updatePreference(null) : undefined }
        range={ paragraphSpacingRangeConfig.range }
        step={ paragraphSpacingRangeConfig.step }
        steppers={{
          decrementLabel: t("common.actions.decrease"),
          incrementLabel: t("common.actions.increase")
        }}
        formatOptions={{
          signDisplay: "exceptZero",
          minimumFractionDigits: 0,
          maximumFractionDigits: 2
        }} 
        isWheelDisabled={ true }
        isVirtualKeyboardDisabled={ true }
      />
      : <StatefulSlider
        standalone={ standalone }
        displayTicks={ paragraphSpacingRangeConfig.variant === ThSettingsRangeVariant.incrementedSlider }
        label={ t("reader.preferences.paragraphSpacing") }
        placeholder={ placeholderText }
        defaultValue={ undefined } 
        value={ paragraphSpacing ?? undefined } 
        onChange={ async(value) => await updatePreference(value as number) } 
        onReset={ canBeReset(ThSpacingSettingsKeys.paragraphSpacing) ? async() => await updatePreference(null) : undefined }
        range={ paragraphSpacingRangeConfig.range }
        step={ paragraphSpacingRangeConfig.step }
        formatOptions={{
          signDisplay: "exceptZero",
          minimumFractionDigits: 0,
          maximumFractionDigits: 2
        }}
      /> 
    }
    </>
  )
}