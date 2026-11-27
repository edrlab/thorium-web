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
import { setSkipInterval } from "@/lib/audioSettingsReducer";
import { defaultAudioSkipInterval } from "@/preferences/models/audio";

export interface StatefulAudioSkipIntervalProps {
  standalone?: boolean;
}

export const StatefulAudioSkipInterval = ({
  standalone = true
}: StatefulAudioSkipIntervalProps) => {
  const { t } = useI18n();
  const { preferences } = useAudioPreferences();

  const profile = useAppSelector(state => state.reader.profile);
  const skipInterval = useAppSelector(state => state.audioSettings.skipInterval);
  const dispatch = useAppDispatch();

  const { submitPreferences, getSetting, preferencesEditor } = useNavigator().media;

  const config = preferences.settings.keys[ThAudioKeys.skipInterval] ?? defaultAudioSkipInterval;

  const { range, presets } = useEffectiveRange(config.range, preferencesEditor?.skipForwardInterval?.supportedRange, config.presets);

  const skipIntervalRangeConfig = {
    variant: config.variant,
    placeholder: config.placeholder,
    range,
    step: config.step
  };

  const placeholderText = usePlaceholder(skipIntervalRangeConfig.placeholder, skipIntervalRangeConfig.range);

  const skipForwardIntervalPrefKey = getPreferenceKey(ThAudioKeys.skipForwardInterval, "audio");
  const skipBackwardIntervalPrefKey = getPreferenceKey(ThAudioKeys.skipBackwardInterval, "audio");

  const updatePreference = useCallback(async (value: number | number[]) => {
    const val = Array.isArray(value) ? value[0] : value;
    await submitPreferences({
      [skipForwardIntervalPrefKey]: val,
      [skipBackwardIntervalPrefKey]: val
    });
    dispatch(setSkipInterval(getSetting(skipForwardIntervalPrefKey)));
  }, [skipForwardIntervalPrefKey, skipBackwardIntervalPrefKey, submitPreferences, getSetting, dispatch]);

  if (skipIntervalRangeConfig.variant === ThSettingsRangeVariant.numberField) {
    return (
      <StatefulNumberField
        standalone={ standalone }
        label={ t("reader.playback.preferences.audio.skipInterval") }
        placeholder={ placeholderText }
        defaultValue={ undefined }
        value={ skipInterval }
        onChange={ updatePreference }
        onReset={ undefined }
        range={ skipIntervalRangeConfig.range || [1, 60] }
        step={ skipIntervalRangeConfig.step }
        steppers={{
          decrementLabel: t("common.actions.decrease"),
          incrementLabel: t("common.actions.increase")
        }}
        formatOptions={{ style: "unit", unit: "second" }}
        isWheelDisabled={ true }
        isVirtualKeyboardDisabled={ true }
      />
    );
  }

  if (skipIntervalRangeConfig.variant === ThSettingsRangeVariant.presetsGroup) {
    return (
      <StatefulPresetsGroup
        standalone={ standalone }
        label={ t("reader.playback.preferences.audio.skipInterval") }
        presets={ presets || [] }
        formatOptions={{ style: "unit", unit: "second" }}
        onEscape={ () => {
          if (profile) {
            dispatch(setActionOpen({ key: ThActionsKeys.settings, isOpen: false, profile }));
          }
        } }
        value={ skipInterval }
        onChange={ (v) => updatePreference(v) }
      />
    );
  }

  if (skipIntervalRangeConfig.variant === ThSettingsRangeVariant.sliderWithPresets) {
    return (
      <StatefulSliderWithPresets
        standalone={ standalone }
        label={ t("reader.playback.preferences.audio.skipInterval") }
        placeholder={ placeholderText }
        presets={ presets || [] }
        formatOptions={{ style: "unit", unit: "second" }}
        onEscape={ () => {
          if (profile) {
            dispatch(setActionOpen({ key: ThActionsKeys.settings, isOpen: false, profile }));
          }
        } }
        value={ skipInterval }
        onChange={ updatePreference }
        range={ skipIntervalRangeConfig.range }
        step={ skipIntervalRangeConfig.step }
      />
    );
  }

  return (
    <StatefulSlider
      standalone={ standalone }
      displayTicks={ skipIntervalRangeConfig.variant === ThSettingsRangeVariant.incrementedSlider }
      label={ t("reader.playback.preferences.audio.skipInterval") }
      placeholder={ placeholderText }
      value={ skipInterval }
      onChange={ updatePreference }
      range={ skipIntervalRangeConfig.range }
      step={ skipIntervalRangeConfig.step }
      formatOptions={{ style: "unit", unit: "second" }}
    />
  );
};

