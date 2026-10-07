"use client";

import { useCallback } from "react";

import { ThReadAlongKeys, ThSettingsRangeVariant } from "@/preferences";

import { StatefulSettingsItemProps } from "../../Settings/models/settings";

import { StatefulNumberField } from "../../Settings/StatefulNumberField";
import { StatefulSlider } from "../../Settings/StatefulSlider";
import { StatefulSliderWithPresets } from "../../Settings/StatefulSliderWithPresets";

import { usePreferences } from "@/preferences/hooks/usePreferences";
import { useNavigator } from "@/core/Navigator";
import { useI18n } from "@/i18n/useI18n";
import { usePlaceholder } from "../../Settings/hooks/usePlaceholder";
import { useEffectiveRange } from "../../Settings/hooks/useEffectiveRange";

import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { setReadAlongRate } from "@/lib/readAlongSettingsReducer";

export const StatefulReadAlongRate = ({ standalone = true }: StatefulSettingsItemProps) => {
  const { preferences } = usePreferences();
  const { t } = useI18n();

  const config = preferences.readAlong.settings.keys[ThReadAlongKeys.rate];

  const readAloud = useNavigator().readAloud;
  const rate = useAppSelector(state => state.readAlongSettings.rate);
  const dispatch = useAppDispatch();

  const { range, presets } = useEffectiveRange(config.range, readAloud?.preferencesEditor?.rate?.supportedRange, config.presets);

  const rateRangeConfig = {
    variant: config.variant,
    placeholder: config.placeholder,
    range,
    step: config.step
  };

  const placeholderText = usePlaceholder(rateRangeConfig.placeholder, rateRangeConfig.range, "multiplier");

  const updatePreference = useCallback(async (value: number | number[] | null) => {
    if (!readAloud) return;
    await readAloud.submitPreferences({
      rate: Array.isArray(value) ? value[0] : value
    });

    dispatch(setReadAlongRate(value === null ? null : readAloud.getSetting("rate")));
  }, [readAloud, dispatch]);

  return (
    <>
    { rateRangeConfig.variant === ThSettingsRangeVariant.numberField
      ? <StatefulNumberField
        standalone={ standalone }
        label={ t("reader.playback.preferences.playbackRate.descriptive") }
        placeholder={ placeholderText }
        defaultValue={ undefined }
        value={ rate ?? readAloud?.getSetting("rate") }
        onChange={ async(value) => await updatePreference(value as number) }
        onReset={ rate !== null ? async() => await updatePreference(null) : undefined }
        range={ rateRangeConfig.range }
        step={ rateRangeConfig.step }
        steppers={{
          decrementLabel: t("common.actions.decrease"),
          incrementLabel: t("common.actions.increase")
        }}
        isWheelDisabled={ true }
        isVirtualKeyboardDisabled={ true }
      />
      : rateRangeConfig.variant === ThSettingsRangeVariant.sliderWithPresets
        ? <StatefulSliderWithPresets
          standalone={ standalone }
          label={ t("reader.playback.preferences.playbackRate.descriptive") }
          placeholder={ placeholderText }
          presets={ presets || [] }
          formatValue={ (v) => `${ v }×` }
          value={ rate ?? readAloud?.getSetting("rate") }
          onChange={ async(value) => await updatePreference(value as number) }
          onReset={ rate !== null ? async() => await updatePreference(null) : undefined }
          range={ rateRangeConfig.range }
          step={ rateRangeConfig.step }
        />
        : <StatefulSlider
          standalone={ standalone }
          displayTicks={ rateRangeConfig.variant === ThSettingsRangeVariant.incrementedSlider }
          label={ t("reader.playback.preferences.playbackRate.descriptive") }
          placeholder={ placeholderText }
          defaultValue={ undefined }
          value={ rate ?? readAloud?.getSetting("rate") }
          onChange={ async(value) => await updatePreference(value as number) }
          onReset={ rate !== null ? async() => await updatePreference(null) : undefined }
          range={ rateRangeConfig.range }
          step={ rateRangeConfig.step }
        />
    }
    </>
  )
}
