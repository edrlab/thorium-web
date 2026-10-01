"use client";

import { useMemo } from "react";

import { IDivinaPreferences } from "@readium/navigator";
import { ThSettingsKeys } from "@/preferences/models";
import { useSettingsComponentStatus } from "@/components/Settings/hooks/useSettingsComponentStatus";
import { useAppSelector } from "@/lib/hooks";

export const useDivinaPreferencesConfig = () => {
  const quality = useAppSelector(state => state.divinaSettings.quality);
  const scrolled = useAppSelector(state => state.divinaSettings.scrolled);
  const spreads = useAppSelector(state => state.divinaSettings.spreads);
  const stripWidth = useAppSelector(state => state.divinaSettings.stripWidth);

  const { isComponentUsed: isLayoutUsed } = useSettingsComponentStatus({
    settingsKey: ThSettingsKeys.divinaLayout,
    publicationType: "divina",
  });

  const { isComponentUsed: isQualityUsed } = useSettingsComponentStatus({
    settingsKey: ThSettingsKeys.divinaQuality,
    publicationType: "divina",
  });

  const { isComponentUsed: isSpreadsUsed } = useSettingsComponentStatus({
    settingsKey: ThSettingsKeys.divinaSpreads,
    publicationType: "divina",
  });

  const { isComponentUsed: isStripWidthUsed } = useSettingsComponentStatus({
    settingsKey: ThSettingsKeys.divinaStripWidth,
    publicationType: "divina",
  });

  const divinaPreferences = useMemo(() => {
    const preferences: IDivinaPreferences = {};

    if (isLayoutUsed) preferences.scrolled = scrolled;
    if (isQualityUsed) preferences.quality = quality as IDivinaPreferences["quality"];
    if (isSpreadsUsed) preferences.spreads = spreads;
    if (isStripWidthUsed) preferences.stripWidth = stripWidth;

    return preferences;
  }, [
    quality,
    scrolled,
    spreads,
    stripWidth,
    isLayoutUsed,
    isQualityUsed,
    isSpreadsUsed,
    isStripWidthUsed,
  ]);

  return { divinaPreferences };
};
