"use client";

import { useCallback, useMemo } from "react";

import { VerbosityPreset } from "@readium/navigator";
import { ThReadAlongKeys } from "@/preferences";
import { defaultReadAlongVerbositySubpanel, ThReadAlongVerbosityKeys } from "@/preferences/models";
import { CUSTOM_VERBOSITY_PREFERENCES, getPreferenceKey } from "../../../Settings/helpers/settingsKeyMapping";

import { StatefulSettingsItemProps } from "../../../Settings/models/settings";

import { StatefulRadioGroup } from "../../../Settings/StatefulRadioGroup";

import { useNavigator } from "@/core/Navigator";
import { useI18n } from "@/i18n/useI18n";
import { usePreferences } from "@/preferences/hooks/usePreferences";

import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { setReadAlongContextualize, setReadAlongSkip, setReadAlongVerbosity } from "@/lib/readAlongSettingsReducer";
import { useReadAlongVerbosity } from "../../Hooks/useReadAlongVerbosity";

export const StatefulReadAlongVerbosity = ({ standalone = true }: StatefulSettingsItemProps) => {
  const { t } = useI18n();

  const { preferences } = usePreferences();
  const { verbosityKey, verbosity } = useReadAlongVerbosity();
  const skip = useAppSelector(state => state.readAlongSettings.skip);
  const contextualize = useAppSelector(state => state.readAlongSettings.contextualize);
  const dispatch = useAppDispatch();

  const readAloud = useNavigator().readAloud;

  // Custom is only reachable with components to customize it with, like prosody presets
  const hasCustomizableValues = useMemo(() => {
    const subPanel = preferences.readAlong.settings.verbosity?.subPanel ?? defaultReadAlongVerbositySubpanel;
    return subPanel.some((key) => key !== ThReadAlongVerbosityKeys.verbosity);
  }, [preferences.readAlong.settings.verbosity]);

  const supportedValues = (readAloud?.preferencesEditor?.verbosity.supportedValues ?? [])
    .filter((value) => value !== "custom" || hasCustomizableValues);

  const items = supportedValues.map((value) => ({
    id: value,
    label: t(`_pendingThoriumLocales.reader.readAlong.preferences.verbosity.values.${ value }`),
    value: value
  }));

  const prefKey = getPreferenceKey(ThReadAlongKeys.verbosity, "readAlong");
  const { skip: skipPrefKey, contextualize: contextualizePrefKey } = CUSTOM_VERBOSITY_PREFERENCES;

  const updatePreference = useCallback(async (value: string) => {
    if (!readAloud) return;
    if (value === "custom") {
      // Never customized yet, it starts from the current preset's tables
      await readAloud.submitPreferences({
        [prefKey]: value,
        [skipPrefKey]: skip ?? readAloud.getSetting(skipPrefKey),
        [contextualizePrefKey]: contextualize ?? readAloud.getSetting(contextualizePrefKey)
      });
      dispatch(setReadAlongSkip(readAloud.getSetting(skipPrefKey)));
      dispatch(setReadAlongContextualize(readAloud.getSetting(contextualizePrefKey)));
    } else {
      await readAloud.submitPreferences({ [prefKey]: value as VerbosityPreset });
    }
    dispatch(setReadAlongVerbosity({ key: verbosityKey, value: readAloud.getSetting(prefKey) }));
  }, [prefKey, skipPrefKey, contextualizePrefKey, readAloud, skip, contextualize, verbosityKey, dispatch]);

  return (
    <>
    <StatefulRadioGroup
      standalone={ standalone }
      label={ t("_pendingThoriumLocales.reader.readAlong.preferences.verbosity.title") }
      orientation="horizontal"
      value={ verbosity ?? readAloud?.getSetting(prefKey) ?? undefined }
      onChange={ async (val: string) => await updatePreference(val) }
      items={ items }
      isDisabled={ !readAloud || items.length === 0 }
    />
    </>
  )
}
