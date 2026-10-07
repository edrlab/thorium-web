"use client";

import { useCallback } from "react";

import { ThSettingsRangeVariant } from "@/preferences";

import { ThActionsKeys, ThAudioKeys } from "@/preferences/models";
import { getPreferenceKey } from "../../Settings/helpers/settingsKeyMapping";

import { StatefulNumberField } from "../../Settings/StatefulNumberField";
import { StatefulSlider } from "../../Settings/StatefulSlider";
import { StatefulSliderWithPresets } from "../../Settings/StatefulSliderWithPresets";
import { StatefulPresetsGroup } from "../../Settings/StatefulPresetsGroup";

import { useNavigator } from "@/core/Navigator/hooks";
import { usePlaceholder } from "../../Settings/hooks/usePlaceholder";
import { useEffectiveRange } from "../../Settings/hooks/useEffectiveRange";
import { useAudioPreferences } from "@/preferences/hooks/useAudioPreferences";
import { useI18n } from "@/i18n/useI18n";

import { useAppSelector, useAppDispatch } from "@/lib/hooks";
import { setActionOpen } from "@/lib";
import { setSkipBackwardInterval } from "@/lib/audioSettingsReducer";
import { defaultAudioSkipBackwardInterval } from "@/preferences/models/audio";

export interface StatefulAudioSkipBackwardIntervalProps {
  standalone?: boolean;
}

export const StatefulAudioSkipBackwardInterval = ({
  standalone = true
}: StatefulAudioSkipBackwardIntervalProps) => {
  const { t } = useI18n();
  const { preferences } = useAudioPreferences();

  const profile = useAppSelector(state => state.reader.profile);
  const skipBackwardInterval = useAppSelector(state => state.audioSettings.skipBackwardInterval);
  const dispatch = useAppDispatch();
  const { submitPreferences, getSetting, preferencesEditor } = useNavigator().media;

  const config = preferences.settings.keys[ThAudioKeys.skipBackwardInterval] ?? defaultAudioSkipBackwardInterval;

  const { range, presets } = useEffectiveRange(config.range, preferencesEditor?.skipBackwardInterval?.supportedRange, config.presets);

  const skipBackwardIntervalRangeConfig = {
    variant: config.variant,
    placeholder: config.placeholder,
    range,
    step: config.step
  };

  const placeholderText = usePlaceholder(skipBackwardIntervalRangeConfig.placeholder, skipBackwardIntervalRangeConfig.range);

  const prefKey = getPreferenceKey(ThAudioKeys.skipBackwardInterval, "audio");

  const updatePreference = useCallback(async (value: number | number[]) => {
    const val = Array.isArray(value) ? value[0] : value;
    await submitPreferences({ [prefKey]: val });
    const effectiveSkipBackwardInterval = getSetting(prefKey);
    dispatch(setSkipBackwardInterval(effectiveSkipBackwardInterval));
  }, [prefKey, submitPreferences, getSetting, dispatch]);

  if (skipBackwardIntervalRangeConfig.variant === ThSettingsRangeVariant.numberField) {
    return (
      <StatefulNumberField
        standalone={ standalone }
        label={ t("reader.playback.preferences.audio.skipBackwardInterval") }
        placeholder={ placeholderText }
        defaultValue={ undefined }
        value={ skipBackwardInterval ?? undefined }
        onChange={ updatePreference }
        onReset={ undefined }
        range={ skipBackwardIntervalRangeConfig.range || [1, 60] }
        step={ skipBackwardIntervalRangeConfig.step }
        steppers={{
          decrementLabel: t("common.actions.decrease"),
          incrementLabel: t("common.actions.increase")
        }}
        formatOptions={ { style: "unit", unit: "second" } }
        isWheelDisabled={ true }
        isVirtualKeyboardDisabled={ true }
      />
    );
  }

  if (skipBackwardIntervalRangeConfig.variant === ThSettingsRangeVariant.presetsGroup) {
    return (
      <StatefulPresetsGroup
        standalone={ standalone }
        label={ t("reader.playback.preferences.audio.skipBackwardInterval") }
        presets={ presets || [] }
        formatOptions={{ style: "unit", unit: "second" }}
        onEscape={ () => {
          if (profile) {
            dispatch(setActionOpen({ key: ThActionsKeys.settings, isOpen: false, profile }));
          }
        } }
        value={ skipBackwardInterval ?? undefined }
        onChange={ (v) => updatePreference(v) }
      />
    );
  }

  if (skipBackwardIntervalRangeConfig.variant === ThSettingsRangeVariant.sliderWithPresets) {
    return (
      <StatefulSliderWithPresets
        standalone={ standalone }
        label={ t("reader.playback.preferences.audio.skipBackwardInterval") }
        placeholder={ placeholderText }
        presets={ presets || [] }
        formatOptions={{ style: "unit", unit: "second" }}
        onEscape={ () => {
          if (profile) {
            dispatch(setActionOpen({ key: ThActionsKeys.settings, isOpen: false, profile }));
          }
        } }
        value={ skipBackwardInterval ?? undefined }
        onChange={ updatePreference }
        range={ skipBackwardIntervalRangeConfig.range }
        step={ skipBackwardIntervalRangeConfig.step }
      />
    );
  }

  return (
    <StatefulSlider
      standalone={ standalone }
      displayTicks={ skipBackwardIntervalRangeConfig.variant === ThSettingsRangeVariant.incrementedSlider }
      label={ t("reader.playback.preferences.audio.skipBackwardInterval") }
      placeholder={ placeholderText }
      defaultValue={ undefined }
      value={ skipBackwardInterval ?? undefined }
      onChange={ updatePreference }
      range={ skipBackwardIntervalRangeConfig.range }
      step={ skipBackwardIntervalRangeConfig.step }
      formatOptions={{ style: "unit", unit: "second" }}
    />
  );
};
