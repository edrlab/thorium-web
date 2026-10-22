"use client";

import { useCallback } from "react";

import { GndRole, Interruption } from "@readium/navigator";
import { ThReadAlongKeys } from "@/preferences";
import { getPreferenceKey } from "../../../../Settings/helpers/settingsKeyMapping";

import { useNavigator } from "@/core/Navigator";

import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { setReadAlongInterruptions } from "@/lib/readAlongSettingsReducer";

export type InterruptionSettingKey = ThReadAlongKeys.notes | ThReadAlongKeys.pageBreaks | ThReadAlongKeys.abbreviations | ThReadAlongKeys.bibliography | ThReadAlongKeys.glossary;

export const interruptionValues: Interruption[] = ["never", "inline", "after"];

/**
 * Hook to read `role` never, inline where it interrupts the text, or after the sentence
 */
export const useInterruption = (settingKey: InterruptionSettingKey, role: GndRole) => {
  const readAloud = useNavigator().readAloud;
  const interruptions = useAppSelector(state => state.readAlongSettings.interruptions);
  const dispatch = useAppDispatch();

  const prefKey = getPreferenceKey(settingKey, "readAlong");

  // From the navigator, as its defaults decide the roles never set
  const current = readAloud?.getSetting(prefKey) ?? interruptions ?? {};
  const interruption: Interruption = current[role] ?? "after";

  const setInterruption = useCallback(async (value: Interruption) => {
    if (!readAloud) return;
    await readAloud.submitPreferences({ [prefKey]: { ...readAloud.getSetting(prefKey), [role]: value } });
    dispatch(setReadAlongInterruptions(readAloud.getSetting(prefKey)));
  }, [readAloud, prefKey, role, dispatch]);

  return { interruption, setInterruption };
};
