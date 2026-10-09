"use client";

import { useCallback } from "react";

import { ThReadAlongKeys, ThSettingsRangeVariant } from "@/preferences";
import { getPreferenceKey } from "../../Settings/helpers/settingsKeyMapping";

import { StatefulSettingsItemProps } from "../../Settings/models/settings";

import { StatefulNumberField } from "../../Settings/StatefulNumberField";
import { StatefulSlider } from "../../Settings/StatefulSlider";

import { usePreferences } from "@/preferences/hooks/usePreferences";
import { useNavigator } from "@/core/Navigator";
import { useI18n } from "@/i18n/useI18n";
import { usePlaceholder } from "../../Settings/hooks/usePlaceholder";
import { useEffectiveRange } from "../../Settings/hooks/useEffectiveRange";

import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { setReadAlongVolume } from "@/lib/readAlongSettingsReducer";

export const StatefulReadAlongVolume = ({ standalone = true }: StatefulSettingsItemProps) => {
  const { preferences } = usePreferences();
  const { t } = useI18n();

  const config = preferences.readAlong.settings.keys[ThReadAlongKeys.volume];

  const readAloud = useNavigator().readAloud;
  const volume = useAppSelector(state => state.readAlongSettings.volume);
  const dispatch = useAppDispatch();

  const { range } = useEffectiveRange(config.range, readAloud?.preferencesEditor?.volume?.supportedRange);

  const volumeRangeConfig = {
    variant: config.variant,
    placeholder: config.placeholder,
    range,
    step: config.step
  };

  const placeholderText = usePlaceholder(volumeRangeConfig.placeholder, volumeRangeConfig.range, "percent");

  const prefKey = getPreferenceKey(ThReadAlongKeys.volume, "readAlong");

  const updatePreference = useCallback(async (value: number | number[] | null) => {
    if (!readAloud) return;
    await readAloud.submitPreferences({
      [prefKey]: Array.isArray(value) ? value[0] : value
    });

    dispatch(setReadAlongVolume(value === null ? null : readAloud.getSetting(prefKey)));
  }, [prefKey, readAloud, dispatch]);

  return (
    <>
    { volumeRangeConfig.variant === ThSettingsRangeVariant.numberField
      ? <StatefulNumberField
        standalone={ standalone }
        label={ t("reader.playback.preferences.audio.volume") }
        placeholder={ placeholderText }
        defaultValue={ undefined }
        value={ volume ?? readAloud?.getSetting(prefKey) }
        onChange={ async(value) => await updatePreference(value as number) }
        onReset={ volume !== null ? async() => await updatePreference(null) : undefined }
        range={ volumeRangeConfig.range }
        step={ volumeRangeConfig.step }
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
        displayTicks={ volumeRangeConfig.variant === ThSettingsRangeVariant.incrementedSlider }
        label={ t("reader.playback.preferences.audio.volume") }
        placeholder={ placeholderText }
        defaultValue={ undefined }
        value={ volume ?? readAloud?.getSetting(prefKey) }
        onChange={ async(value) => await updatePreference(value as number) }
        onReset={ volume !== null ? async() => await updatePreference(null) : undefined }
        range={ volumeRangeConfig.range }
        step={ volumeRangeConfig.step }
        formatOptions={ { style: "percent" } }
      />
    }
    </>
  )
}
