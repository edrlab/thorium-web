"use client";

import { useCallback } from "react";

import { ThReadAlongKeys, ThSettingsRangeVariant } from "@/preferences";

import { StatefulSettingsItemProps } from "../../Settings/models/settings";

import { StatefulNumberField } from "../../Settings/StatefulNumberField";
import { StatefulSlider } from "../../Settings/StatefulSlider";

import { usePreferences } from "@/preferences/hooks/usePreferences";
import { useNavigator } from "@/core/Navigator";
import { useI18n } from "@/i18n/useI18n";
import { usePlaceholder } from "../../Settings/hooks/usePlaceholder";
import { useEffectiveRange } from "../../Settings/hooks/useEffectiveRange";

import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { setReadAlongPitch } from "@/lib/readAlongSettingsReducer";

export const StatefulReadAlongPitch = ({ standalone = true }: StatefulSettingsItemProps) => {
  const { preferences } = usePreferences();
  const { t } = useI18n();

  const config = preferences.readAlong.settings.keys[ThReadAlongKeys.pitch];

  const readAloud = useNavigator().readAloud;
  const pitch = useAppSelector(state => state.readAlongSettings.pitch);
  const dispatch = useAppDispatch();

  const { range } = useEffectiveRange(config.range, readAloud?.preferencesEditor?.pitch?.supportedRange);

  const pitchRangeConfig = {
    variant: config.variant,
    placeholder: config.placeholder,
    range,
    step: config.step
  };

  const placeholderText = usePlaceholder(pitchRangeConfig.placeholder, pitchRangeConfig.range, "number");

  const updatePreference = useCallback(async (value: number | number[] | null) => {
    if (!readAloud) return;
    await readAloud.submitPreferences({
      pitch: Array.isArray(value) ? value[0] : value
    });

    dispatch(setReadAlongPitch(value === null ? null : readAloud.getSetting("pitch")));
  }, [readAloud, dispatch]);

  return (
    <>
    { pitchRangeConfig.variant === ThSettingsRangeVariant.numberField
      ? <StatefulNumberField
        standalone={ standalone }
        label={ t("_pendingThoriumLocales.reader.readAlong.preferences.pitch") }
        placeholder={ placeholderText }
        defaultValue={ undefined }
        value={ pitch ?? readAloud?.getSetting("pitch") }
        onChange={ async(value) => await updatePreference(value as number) }
        onReset={ pitch !== null ? async() => await updatePreference(null) : undefined }
        range={ pitchRangeConfig.range }
        step={ pitchRangeConfig.step }
        steppers={{
          decrementLabel: t("common.actions.decrease"),
          incrementLabel: t("common.actions.increase")
        }}
        isWheelDisabled={ true }
        isVirtualKeyboardDisabled={ true }
      />
      : <StatefulSlider
        standalone={ standalone }
        displayTicks={ pitchRangeConfig.variant === ThSettingsRangeVariant.incrementedSlider }
        label={ t("_pendingThoriumLocales.reader.readAlong.preferences.pitch") }
        placeholder={ placeholderText }
        defaultValue={ undefined }
        value={ pitch ?? readAloud?.getSetting("pitch") }
        onChange={ async(value) => await updatePreference(value as number) }
        onReset={ pitch !== null ? async() => await updatePreference(null) : undefined }
        range={ pitchRangeConfig.range }
        step={ pitchRangeConfig.step }
      />
    }
    </>
  )
}
