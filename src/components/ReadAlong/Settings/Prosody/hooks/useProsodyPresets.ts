"use client";

import { useCallback, useMemo } from "react";

import { ReadAloudAutoPause } from "@readium/navigator";
import { ThReadAlongProsodyPreset } from "@/preferences/preferences";
import {
  ThReadAlongKeys,
  ThReadAlongProsodyKeys,
  ThReadAlongProsodyPresetKeys,
  defaultReadAlongProsodyPresets
} from "@/preferences/models";
import { getPreferenceKey } from "../../../../Settings/helpers/settingsKeyMapping";

import { usePreferences } from "@/preferences/hooks/usePreferences";
import { useReadAloudNavigator } from "@/core/Hooks/ReadAloud/useReadAloudNavigator";

import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import {
  ProsodyValues,
  setReadAlongProsodyEffective,
  setReadAlongProsodyPreset
} from "@/lib/readAlongSettingsReducer";

type KeyedPresetKeys = Exclude<ThReadAlongProsodyPresetKeys, ThReadAlongProsodyPresetKeys.default | ThReadAlongProsodyPresetKeys.custom>;

// Values left out are null, so that the navigator's defaults apply
const toValues = (preset: ThReadAlongProsodyPreset | ProsodyValues | undefined): Required<ProsodyValues> => ({
  [ThReadAlongProsodyKeys.rate]: preset?.[ThReadAlongProsodyKeys.rate] ?? null,
  [ThReadAlongProsodyKeys.pauseDuration]: preset?.[ThReadAlongProsodyKeys.pauseDuration] ?? null,
  [ThReadAlongProsodyKeys.autoPause]: preset?.[ThReadAlongProsodyKeys.autoPause] ?? null
});

/**
 * Hook to apply prosody presets, and resolve their auto pause against the layout
 * Pausing after each spread only applies to fixed layout, it pauses after each page otherwise
 */
export const useProsodyPresets = () => {
  const { preferences } = usePreferences();
  const { isLoaded, submitPreferences } = useReadAloudNavigator();

  const isFXL = useAppSelector(state => state.publication.isFXL);
  const prosody = useAppSelector(state => state.readAlongSettings.prosody);
  const autoPause = useAppSelector(state => state.readAlongSettings.autoPause);

  const dispatch = useAppDispatch();

  const ratePrefKey = getPreferenceKey(ThReadAlongKeys.rate, "readAlong");
  const pauseDurationPrefKey = getPreferenceKey(ThReadAlongKeys.pauseDuration, "readAlong");
  const autoPausePrefKey = getPreferenceKey(ThReadAlongKeys.autoPause, "readAlong");

  const prosodyPrefs = preferences.readAlong.settings.prosody;
  const presets = prosodyPrefs?.presets ?? defaultReadAlongProsodyPresets;

  const preset = prosody?.preset ?? ThReadAlongProsodyPresetKeys.default;

  // Presets only apply when their component is displayed, like spacing presets
  const shouldApplyPresets = useMemo(() => {
    if (!preferences.readAlong.settings.order.includes(ThReadAlongKeys.prosodyGroup)) return false;
    const groupKeys = [...(prosodyPrefs?.main ?? []), ...(prosodyPrefs?.subPanel ?? [])];
    return groupKeys.includes(ThReadAlongProsodyKeys.prosodyPresets);
  }, [preferences.readAlong.settings.order, prosodyPrefs]);

  const hasCustomizableValues = useMemo(() => {
    const subPanel = prosodyPrefs?.subPanel ?? [];
    return subPanel.some((key) => key !== ThReadAlongProsodyKeys.prosodyPresets);
  }, [prosodyPrefs]);

  const presetKeys = useMemo(() => {
    return presets.order.filter((key) => key !== ThReadAlongProsodyPresetKeys.custom || hasCustomizableValues);
  }, [presets.order, hasCustomizableValues]);

  const getPresetValues = useCallback((presetKey: ThReadAlongProsodyPresetKeys): Required<ProsodyValues> => {
    if (presetKey === ThReadAlongProsodyPresetKeys.custom) {
      return toValues(prosody?.custom);
    }

    if (presetKey === ThReadAlongProsodyPresetKeys.default) {
      return toValues(undefined);
    }

    return toValues(presets.keys[presetKey as KeyedPresetKeys]);
  }, [presets.keys, prosody?.custom]);

  const resolveAutoPause = useCallback((value: ReadAloudAutoPause | null) => {
    return value === ReadAloudAutoPause.spread && !isFXL ? ReadAloudAutoPause.page : value;
  }, [isFXL]);

  // There are no pages to pause at when scrolling
  const requiresPages = useCallback((presetKey: ThReadAlongProsodyPresetKeys) => {
    const value = getPresetValues(presetKey)[ThReadAlongProsodyKeys.autoPause];
    return value === ReadAloudAutoPause.page || value === ReadAloudAutoPause.spread;
  }, [getPresetValues]);

  const applyPreset = useCallback(async (presetKey: ThReadAlongProsodyPresetKeys) => {
    const values = getPresetValues(presetKey);
    const effective = {
      ...values,
      [ThReadAlongProsodyKeys.autoPause]: resolveAutoPause(values[ThReadAlongProsodyKeys.autoPause])
    };

    await submitPreferences({
      [ratePrefKey]: effective[ThReadAlongProsodyKeys.rate],
      [pauseDurationPrefKey]: effective[ThReadAlongProsodyKeys.pauseDuration],
      [autoPausePrefKey]: effective[ThReadAlongProsodyKeys.autoPause]
    });
    dispatch(setReadAlongProsodyPreset({ preset: presetKey, values, effective }));
  }, [getPresetValues, resolveAutoPause, submitPreferences, ratePrefKey, pauseDurationPrefKey, autoPausePrefKey, dispatch]);

  // Resolves the auto pause again, as the layout changes with the publication
  const applyLayout = useCallback(async () => {
    if (!isLoaded || !shouldApplyPresets) return;

    const effective = resolveAutoPause(getPresetValues(preset)[ThReadAlongProsodyKeys.autoPause]);
    if (effective === null || effective === autoPause) return;

    await submitPreferences({ [autoPausePrefKey]: effective });
    dispatch(setReadAlongProsodyEffective({ [ThReadAlongProsodyKeys.autoPause]: effective }));
  }, [isLoaded, shouldApplyPresets, resolveAutoPause, getPresetValues, preset, autoPause, submitPreferences, autoPausePrefKey, dispatch]);

  return {
    preset,
    presetKeys,
    requiresPages,
    shouldApplyPresets,
    applyPreset,
    applyLayout
  };
};
