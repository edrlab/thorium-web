"use client";

import React, { useCallback } from "react";

import { defaultFontSize, ThSettingsKeys, ThSettingsRangeVariant } from "@/preferences";

import { useLocale } from "../AppLocale";

import Decrease from "./assets/icons/text_decrease.svg";
import Increase from "./assets/icons/text_increase.svg";
import ZoomOut from "./assets/icons/zoom_out.svg";
import ZoomIn from "./assets/icons/zoom_in.svg";

import { StatefulSlider } from "../../Settings/StatefulSlider";
import { StatefulNumberField } from "../../Settings/StatefulNumberField";

import { usePreferences } from "@/preferences/hooks/usePreferences";
import { useEpubNavigator } from "@/core/Hooks/Epub/useEpubNavigator";

import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { setFontSize } from "@/lib/settingsReducer";

export const StatefulZoom = () => {
  const RSPrefs = usePreferences();
  const fontSize = useAppSelector((state) => state.settings.fontSize);
  const isFXL = useAppSelector((state) => state.publication.isFXL);
  const dispatch = useAppDispatch();
  const locale = useLocale();
  
  const { 
    getSetting, 
    submitPreferences,
    preferencesEditor 
  } = useEpubNavigator();

  const updatePreference = useCallback(async (value: number) => {
    await submitPreferences({ fontSize: value });
    dispatch(setFontSize(getSetting("fontSize")));
  }, [submitPreferences, getSetting, dispatch]);

  const getEffectiveRange = (preferred: [number, number] | undefined, fallback: [number, number], supportedRange: [number, number] | undefined): [number, number] => {
    if (!supportedRange) {
      return preferred || fallback
    }
    if (preferred && isRangeWithinSupportedRange(preferred, supportedRange)) {
      return preferred;
    }
    if (fallback && isRangeWithinSupportedRange(fallback, supportedRange)) {
      return fallback;
    }
    return supportedRange;
  }
  
  const isRangeWithinSupportedRange = (range: [number, number], supportedRange: [number, number]): boolean => {
    return Math.min(range[0], range[1]) >= Math.min(supportedRange[0], supportedRange[1]) &&
           Math.max(range[0], range[1]) <= Math.max(supportedRange[0], supportedRange[1]);
  }

  const zoomRangeConfig = {
    variant: RSPrefs.settings.keys?.[ThSettingsKeys.zoom]?.variant || defaultFontSize.variant,
    range: preferencesEditor?.fontSize.supportedRange
      ? getEffectiveRange(RSPrefs.settings.keys?.[ThSettingsKeys.zoom]?.range, defaultFontSize.range, preferencesEditor?.fontSize.supportedRange)
      : RSPrefs.settings.keys?.[ThSettingsKeys.zoom]?.range || defaultFontSize.range,
    step: RSPrefs.settings.keys?.[ThSettingsKeys.zoom]?.step || preferencesEditor?.fontSize.step || defaultFontSize.step
  }

  return (
    <>
    { zoomRangeConfig.variant === ThSettingsRangeVariant.numberField 
      ? <StatefulNumberField
        standalone={ true}
        defaultValue={ 1 } 
        value={ fontSize } 
        onChange={ async(value) => await updatePreference(value) } 
        label={ isFXL ? locale.reader.settings.zoom.title : locale.reader.settings.fontSize.title }
        range={ zoomRangeConfig.range }
        step={ zoomRangeConfig.step }
        steppers={{
          decrementIcon: isFXL ? ZoomOut : Decrease,
          decrementLabel: isFXL ? locale.reader.settings.zoom.decrease : locale.reader.settings.fontSize.decrease,
          incrementIcon: isFXL ? ZoomIn : Increase,
          incrementLabel: isFXL ? locale.reader.settings.zoom.increase : locale.reader.settings.fontSize.increase
        }}
        formatOptions={{ style: "percent" }} 
        isWheelDisabled={ true }
        isVirtualKeyboardDisabled={ true }
      />
      : <StatefulSlider
        standalone={ true }
        defaultValue={ 1 } 
        value={ fontSize } 
        onChange={ async(value) => await updatePreference(value as number) } 
        label={ isFXL ? locale.reader.settings.zoom.title : locale.reader.settings.fontSize.title }
        range={ zoomRangeConfig.range }
        step={ zoomRangeConfig.step }
        formatOptions={{ style: "percent" }} 
      />
    } 
    </>
  );
};