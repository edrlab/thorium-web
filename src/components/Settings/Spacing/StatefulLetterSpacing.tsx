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

export const StatefulLetterSpacing = ({ standalone = true }: StatefulSettingsItemProps) => {
  const { preferences } = usePreferences();
  const { t } = useI18n();

  const config = preferences.settings.keys[ThSettingsKeys.letterSpacing];

  const { getSetting, submitPreferences, preferencesEditor } = useNavigator().visual;

  const { range } = useEffectiveRange(config.range, (preferencesEditor as EpubPreferencesEditor | undefined)?.letterSpacing?.supportedRange);

  const letterSpacingRangeConfig = {
    variant: config.variant,
    placeholder: config.placeholder,
    range,
    step: config.step
  };

  const placeholderText = usePlaceholder(letterSpacingRangeConfig.placeholder, letterSpacingRangeConfig.range, "percent");

  const { getEffectiveSpacingValue, setLetterSpacing, canBeReset } = useSpacingPresets();

  const letterSpacing = getEffectiveSpacingValue(ThSpacingSettingsKeys.letterSpacing);

  const profile = useAppSelector(state => state.reader.profile);
  const isWebPub = profile === "webPub";

  const prefKey = getPreferenceKey(ThSettingsKeys.letterSpacing, isWebPub ? "webPub" : "epub");

  const updatePreference = useCallback(async (value: number | number[] | null) => {
    await submitPreferences({
      [prefKey]: Array.isArray(value) ? value[0] : value
    });

    setLetterSpacing(getSetting(prefKey));
  }, [prefKey, submitPreferences, getSetting, setLetterSpacing]);

  return (
    <>
    { letterSpacingRangeConfig.variant === ThSettingsRangeVariant.numberField 
      ? <StatefulNumberField 
        standalone={ standalone }
        label={ t("reader.preferences.letterSpacing") }
        placeholder={ placeholderText }
        defaultValue={ undefined } 
        value={ letterSpacing ?? undefined } 
        onChange={ async(value) => await updatePreference(value as number) } 
        onReset={ canBeReset(ThSpacingSettingsKeys.letterSpacing) ? async() => await updatePreference(null) : undefined }
        range={ letterSpacingRangeConfig.range }
        step={ letterSpacingRangeConfig.step }
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
        displayTicks={ letterSpacingRangeConfig.variant === ThSettingsRangeVariant.incrementedSlider }
        label={ t("reader.preferences.letterSpacing") }
        placeholder={ placeholderText }
        defaultValue={ undefined } 
        value={ letterSpacing ?? undefined } 
        onChange={ async(value) => await updatePreference(value as number) } 
        onReset={ canBeReset(ThSpacingSettingsKeys.letterSpacing) ? async() => await updatePreference(null) : undefined }
        range={ letterSpacingRangeConfig.range }
        step={ letterSpacingRangeConfig.step }
        formatOptions={ { style: "percent" } }
      />
    } 
    </>
  )
}