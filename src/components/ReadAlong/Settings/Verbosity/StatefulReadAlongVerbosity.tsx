"use client";

import { useCallback } from "react";

import { VerbosityPreset } from "@readium/navigator";
import { ThReadAlongKeys } from "@/preferences";
import { getPreferenceKey } from "../../../Settings/helpers/settingsKeyMapping";

import { StatefulSettingsItemProps } from "../../../Settings/models/settings";

import { StatefulRadioGroup } from "../../../Settings/StatefulRadioGroup";

import { useNavigator } from "@/core/Navigator";
import { useI18n } from "@/i18n/useI18n";

import { useAppDispatch } from "@/lib/hooks";
import { setReadAlongVerbosity } from "@/lib/readAlongSettingsReducer";
import { useReadAlongVerbosity } from "../../Hooks/useReadAlongVerbosity";

export const StatefulReadAlongVerbosity = ({ standalone = true }: StatefulSettingsItemProps) => {
  const { t } = useI18n();

  const { verbosityKey, verbosity } = useReadAlongVerbosity();
  const dispatch = useAppDispatch();

  const readAloud = useNavigator().readAloud;

  // Custom needs its own skip and contextualize pickers
  const supportedValues = (readAloud?.preferencesEditor?.verbosity.supportedValues ?? [])
    .filter((value) => value !== "custom");

  const items = supportedValues.map((value) => ({
    id: value,
    label: t(`_pendingThoriumLocales.reader.readAlong.preferences.verbosity.values.${ value }`),
    value: value
  }));

  const prefKey = getPreferenceKey(ThReadAlongKeys.verbosity, "readAlong");

  const updatePreference = useCallback(async (value: string) => {
    if (!readAloud) return;
    await readAloud.submitPreferences({ [prefKey]: value as VerbosityPreset });
    dispatch(setReadAlongVerbosity({ key: verbosityKey, value: readAloud.getSetting(prefKey) }));
  }, [prefKey, readAloud, verbosityKey, dispatch]);

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
