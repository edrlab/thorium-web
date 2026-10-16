"use client";

import { useCallback } from "react";

import { ThSettingsKeys, ThSettingsRangeVariant } from "@/preferences";
import { getPreferenceKey } from "./helpers/settingsKeyMapping";

import Decrease from "./assets/icons/text_decrease.svg";
import Increase from "./assets/icons/text_increase.svg";
import ZoomOut from "./assets/icons/zoom_out.svg";
import ZoomIn from "./assets/icons/zoom_in.svg";

import { StatefulSlider } from "./StatefulSlider";
import { StatefulNumberField } from "./StatefulNumberField";

import { usePreferences } from "@/preferences/hooks/usePreferences";
import { useNavigator } from "@/core/Navigator/hooks";
import { useI18n } from "@/i18n/useI18n";
import { usePlaceholder } from "./hooks/usePlaceholder";
import { useEffectiveRange } from "./hooks/useEffectiveRange";

import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { useReaderSetting } from "./hooks/useReaderSetting";
import { setFontSize } from "@/lib/settingsReducer";
import { setWebPubZoom } from "@/lib/webPubSettingsReducer";
import { EpubPreferencesEditor, WebPubPreferencesEditor } from "@readium/navigator";

export const StatefulZoom = () => {
  const { preferences } = usePreferences();
  const { t } = useI18n();

  const readerProfile = useAppSelector((state) => state.reader.profile);
  const isFXL = useAppSelector((state) => state.publication.isFXL);
  const derivedState = useReaderSetting("zoom");
  
  const dispatch = useAppDispatch();
  
  const { 
    getSetting, 
    submitPreferences,
    preferencesEditor 
  } = useNavigator().visual;

  // Somewhat wrong to cast here, although we control this
  // because we have a component that is relying on two different things
  // so TypeScript has a very hard time with this.
  // TODO: FIX root cause of the issue
  const preferenceEditorProperty = readerProfile === "webPub" 
    ? (preferencesEditor as WebPubPreferencesEditor)?.zoom 
    : isFXL 
      ? (preferencesEditor as any)?.zoom 
      : (preferencesEditor as EpubPreferencesEditor)?.fontSize;

  const prefKey = getPreferenceKey(ThSettingsKeys.zoom, readerProfile === "webPub" ? "webPub" : "epub");

  const updatePreference = useCallback(async (value: number | number[]) => {
    const normalizedValue = Array.isArray(value) ? value[0] : value;
    await submitPreferences({ [prefKey]: normalizedValue });
    if (readerProfile === "webPub") {
      dispatch(setWebPubZoom(getSetting(prefKey)));
    } else {
      dispatch(setFontSize(getSetting(prefKey)));
    }
  }, [readerProfile, prefKey, submitPreferences, getSetting, dispatch]);

  const zoomConfig = preferences.settings.keys[ThSettingsKeys.zoom];
  const { range: effectiveRange } = useEffectiveRange(zoomConfig.range, preferenceEditorProperty?.supportedRange);

  const zoomRangeConfig = {
    variant: zoomConfig.variant,
    placeholder: zoomConfig.placeholder,
    range: effectiveRange,
    step: zoomConfig.step
  }

  const placeholderText = usePlaceholder(zoomRangeConfig.placeholder, zoomRangeConfig.range);

  return (
    <>
    { zoomRangeConfig.variant === ThSettingsRangeVariant.numberField 
      ? <StatefulNumberField
        standalone={ true }
        defaultValue={ 1 } 
        value={ derivedState } 
        onChange={ async(value) => await updatePreference(value) } 
        label={ isFXL ? t("reader.preferences.zoom") : t("reader.preferences.fontSize") }
        placeholder={ placeholderText }
        range={ zoomRangeConfig.range }
        step={ zoomRangeConfig.step }
        steppers={{
          decrementIcon: isFXL ? ZoomOut : Decrease,
          decrementLabel: t("common.actions.decrease"),
          incrementIcon: isFXL ? ZoomIn : Increase,
          incrementLabel: t("common.actions.increase")
        }}
        formatOptions={{ style: "percent" }} 
        isWheelDisabled={ true }
        isVirtualKeyboardDisabled={ true }
      />
      : <StatefulSlider
        standalone={ true }
        displayTicks={ zoomRangeConfig.variant === ThSettingsRangeVariant.incrementedSlider }
        defaultValue={ 1 } 
        value={ derivedState } 
        onChange={ async(value) => await updatePreference(value as number) } 
        label={ isFXL ? t("reader.preferences.zoom") : t("reader.preferences.fontSize") }
        placeholder={ placeholderText }
        range={ zoomRangeConfig.range }
        step={ zoomRangeConfig.step }
        formatOptions={{ style: "percent" }} 
      />
    } 
    </>
  );
};