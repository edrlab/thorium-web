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
import { setSkipForwardInterval } from "@/lib/audioSettingsReducer";
import { defaultAudioSkipForwardInterval } from "@/preferences/models/audio";

export interface StatefulAudioSkipForwardIntervalProps {
  standalone?: boolean;
}

export const StatefulAudioSkipForwardInterval = ({
  standalone = true
}: StatefulAudioSkipForwardIntervalProps) => {
  const { t } = useI18n();
  const { preferences } = useAudioPreferences();

  const profile = useAppSelector(state => state.reader.profile);
  const skipForwardInterval = useAppSelector(state => state.audioSettings.skipForwardInterval);
  const dispatch = useAppDispatch();
  const { submitPreferences, getSetting, preferencesEditor } = useNavigator().media;

  const config = preferences.settings.keys[ThAudioKeys.skipForwardInterval] ?? defaultAudioSkipForwardInterval;

  const { range, presets } = useEffectiveRange(config.range, preferencesEditor?.skipForwardInterval?.supportedRange, config.presets);

  const skipForwardIntervalRangeConfig = {
    variant: config.variant,
    placeholder: config.placeholder,
    range,
    step: config.step
  };

  const placeholderText = usePlaceholder(skipForwardIntervalRangeConfig.placeholder, skipForwardIntervalRangeConfig.range);

  const prefKey = getPreferenceKey(ThAudioKeys.skipForwardInterval, "audio");

  const updatePreference = useCallback(async (value: number | number[]) => {
    const val = Array.isArray(value) ? value[0] : value;
    await submitPreferences({ [prefKey]: val });
    const effectiveSkipForwardInterval = getSetting(prefKey);
    dispatch(setSkipForwardInterval(effectiveSkipForwardInterval));
  }, [prefKey, submitPreferences, getSetting, dispatch]);

  if (skipForwardIntervalRangeConfig.variant === ThSettingsRangeVariant.numberField) {
    return (
      <StatefulNumberField
        standalone={ standalone }
        label={ t("reader.playback.preferences.audio.skipForwardInterval") }
        placeholder={ placeholderText }
        defaultValue={ undefined }
        value={ skipForwardInterval }
        onChange={ updatePreference }
        onReset={ undefined }
        range={ skipForwardIntervalRangeConfig.range || [1, 60] }
        step={ skipForwardIntervalRangeConfig.step }
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

  if (skipForwardIntervalRangeConfig.variant === ThSettingsRangeVariant.presetsGroup) {
    return (
      <StatefulPresetsGroup
        standalone={ standalone }
        label={ t("reader.playback.preferences.audio.skipForwardInterval") }
        presets={ presets || [] }
        formatOptions={{ style: "unit", unit: "second" }}
        onEscape={ () => {
          if (profile) {
            dispatch(setActionOpen({ key: ThActionsKeys.settings, isOpen: false, profile }));
          }
        } }
        value={ skipForwardInterval }
        onChange={ (v) => updatePreference(v) }
      />
    );
  }

  if (skipForwardIntervalRangeConfig.variant === ThSettingsRangeVariant.sliderWithPresets) {
    return (
      <StatefulSliderWithPresets
        standalone={ standalone }
        label={ t("reader.playback.preferences.audio.skipForwardInterval") }
        placeholder={ placeholderText }
        presets={ presets || [] }
        formatOptions={{ style: "unit", unit: "second" }}
        onEscape={ () => {
          if (profile) {
            dispatch(setActionOpen({ key: ThActionsKeys.settings, isOpen: false, profile }));
          }
        } }
        value={ skipForwardInterval }
        onChange={ updatePreference }
        range={ skipForwardIntervalRangeConfig.range }
        step={ skipForwardIntervalRangeConfig.step }
      />
    );
  }

  return (
    <StatefulSlider
      standalone={ standalone }
      displayTicks={ skipForwardIntervalRangeConfig.variant === ThSettingsRangeVariant.incrementedSlider }
      label={ t("reader.playback.preferences.audio.skipForwardInterval") }
      placeholder={ placeholderText }
      value={ skipForwardInterval }
      onChange={ updatePreference }
      range={ skipForwardIntervalRangeConfig.range }
      step={ skipForwardIntervalRangeConfig.step }
      formatOptions={{ style: "unit", unit: "second" }}
    />
  );
};
