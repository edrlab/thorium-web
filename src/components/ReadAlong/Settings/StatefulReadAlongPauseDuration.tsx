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
import { setReadAlongPauseDuration } from "@/lib/readAlongSettingsReducer";

export const StatefulReadAlongPauseDuration = ({ standalone = true }: StatefulSettingsItemProps) => {
  const { preferences } = usePreferences();
  const { t } = useI18n();

  const config = preferences.readAlong.settings.keys[ThReadAlongKeys.pauseDuration];

  const readAloud = useNavigator().readAloud;
  const pauseDuration = useAppSelector(state => state.readAlongSettings.pauseDuration);
  const dispatch = useAppDispatch();

  const { range } = useEffectiveRange(config.range, readAloud?.preferencesEditor?.pauseDuration?.supportedRange);

  const pauseDurationRangeConfig = {
    variant: config.variant,
    placeholder: config.placeholder,
    range,
    step: config.step
  };

  const placeholderText = usePlaceholder(pauseDurationRangeConfig.placeholder, pauseDurationRangeConfig.range, "number");

  const updatePreference = useCallback(async (value: number | number[] | null) => {
    if (!readAloud) return;
    await readAloud.submitPreferences({
      pauseDuration: Array.isArray(value) ? value[0] : value
    });

    dispatch(setReadAlongPauseDuration(value === null ? null : readAloud.getSetting("pauseDuration")));
  }, [readAloud, dispatch]);

  return (
    <>
    { pauseDurationRangeConfig.variant === ThSettingsRangeVariant.numberField
      ? <StatefulNumberField
        standalone={ standalone }
        label={ t("_pendingThoriumLocales.reader.readAlong.preferences.pauseDuration") }
        placeholder={ placeholderText }
        defaultValue={ undefined }
        value={ pauseDuration ?? readAloud?.getSetting("pauseDuration") }
        onChange={ async(value) => await updatePreference(value as number) }
        onReset={ pauseDuration !== null ? async() => await updatePreference(null) : undefined }
        range={ pauseDurationRangeConfig.range }
        step={ pauseDurationRangeConfig.step }
        steppers={{
          decrementLabel: t("common.actions.decrease"),
          incrementLabel: t("common.actions.increase")
        }}
        isWheelDisabled={ true }
        isVirtualKeyboardDisabled={ true }
      />
      : <StatefulSlider
        standalone={ standalone }
        displayTicks={ pauseDurationRangeConfig.variant === ThSettingsRangeVariant.incrementedSlider }
        label={ t("_pendingThoriumLocales.reader.readAlong.preferences.pauseDuration") }
        placeholder={ placeholderText }
        defaultValue={ undefined }
        value={ pauseDuration ?? readAloud?.getSetting("pauseDuration") }
        onChange={ async(value) => await updatePreference(value as number) }
        onReset={ pauseDuration !== null ? async() => await updatePreference(null) : undefined }
        range={ pauseDurationRangeConfig.range }
        step={ pauseDurationRangeConfig.step }
      />
    }
    </>
  )
}
