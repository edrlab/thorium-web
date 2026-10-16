"use client";

import { useCallback } from "react";

import { GndRole, VerbosityPreset } from "@readium/navigator";
import { ThReadAlongKeys } from "@/preferences";
import { CUSTOM_VERBOSITY_PREFERENCES, getPreferenceKey } from "../../../../Settings/helpers/settingsKeyMapping";

import { useNavigator } from "@/core/Navigator";

import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import {
  setReadAlongContextualize,
  setReadAlongInlineContextualization,
  setReadAlongSkip,
  setReadAlongVerbosity
} from "@/lib/readAlongSettingsReducer";
import { useReadAlongVerbosity } from "../../../Hooks/useReadAlongVerbosity";

export type ReadAlongPlacement = "never" | "inline" | "after";

export const readAlongPlacements: ReadAlongPlacement[] = ["never", "inline", "after"];

/**
 * Hook to read content of `roles` never, inline where `inlineRole` references it, or after the sentence
 * Skipping roles switches verbosity to custom, starting from the current preset's tables
 */
export const useVerbosityPlacement = (settingKey: ThReadAlongKeys.notes | ThReadAlongKeys.pageBreaks, roles: GndRole[], inlineRole: GndRole) => {
  const readAloud = useNavigator().readAloud;
  const { verbosityKey } = useReadAlongVerbosity();
  const skip = useAppSelector(state => state.readAlongSettings.skip);
  const inlineContextualization = useAppSelector(state => state.readAlongSettings.inlineContextualization);
  const dispatch = useAppDispatch();

  const verbosityPrefKey = getPreferenceKey(ThReadAlongKeys.verbosity, "readAlong");
  const inlinePrefKey = getPreferenceKey(settingKey, "readAlong");
  const { skip: skipPrefKey, contextualize: contextualizePrefKey } = CUSTOM_VERBOSITY_PREFERENCES;

  // From the navigator, as a preset's own tables decide what it skips
  const currentSkip = readAloud?.getSetting(skipPrefKey) ?? skip ?? [];
  const currentInline = readAloud?.getSetting(inlinePrefKey) ?? inlineContextualization ?? [];

  const placement: ReadAlongPlacement = roles.every((role) => currentSkip.includes(role))
    ? "never"
    : currentInline.includes(inlineRole) ? "inline" : "after";

  const setPlacement = useCallback(async (value: ReadAlongPlacement) => {
    if (!readAloud) return;

    const skipped = readAloud.getSetting(skipPrefKey) ?? [];
    const inline = readAloud.getSetting(inlinePrefKey) ?? [];

    const nextSkip = value === "never"
      ? [...skipped, ...roles.filter((role) => !skipped.includes(role))]
      : skipped.filter((role) => !roles.includes(role));
    const nextInline = value === "inline"
      ? (inline.includes(inlineRole) ? inline : [...inline, inlineRole])
      : value === "after" ? inline.filter((role) => role !== inlineRole) : inline;
    const skipChanged = nextSkip.length !== skipped.length;

    await readAloud.submitPreferences({
      [inlinePrefKey]: nextInline,
      ...(skipChanged && {
        [verbosityPrefKey]: "custom" as VerbosityPreset,
        [skipPrefKey]: nextSkip,
        [contextualizePrefKey]: readAloud.getSetting(contextualizePrefKey)
      })
    });

    dispatch(setReadAlongInlineContextualization(readAloud.getSetting(inlinePrefKey)));
    if (skipChanged) {
      dispatch(setReadAlongVerbosity({ key: verbosityKey, value: readAloud.getSetting(verbosityPrefKey) }));
      dispatch(setReadAlongSkip(readAloud.getSetting(skipPrefKey)));
      dispatch(setReadAlongContextualize(readAloud.getSetting(contextualizePrefKey)));
    }
  }, [readAloud, roles, inlineRole, verbosityPrefKey, inlinePrefKey, skipPrefKey, contextualizePrefKey, verbosityKey, dispatch]);

  return { placement, setPlacement };
};
