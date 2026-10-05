"use client";

import { ThSettingsKeys } from "@/preferences/models";

import { useSettingsComponentStatus } from "@/components/Settings/hooks/useSettingsComponentStatus";
import { useAppSelector } from "@/lib/hooks";

export const useIsScroll = (): boolean => {
  const profile = useAppSelector(state => state.reader.profile);
  const scroll = useAppSelector(state => state.settings.scroll);
  const divinaScrolled = useAppSelector(state => state.divinaSettings.scrolled);
  const isFXL = useAppSelector(state => state.publication.isFXL);
  const isManifestScrolled = useAppSelector(state => state.publication.isManifestScrolled);
  const scriptMode = useAppSelector(state => state.publication.scriptMode);
  const { isComponentUsed: isDivinaLayoutUsed } = useSettingsComponentStatus({
    settingsKey: ThSettingsKeys.divinaLayout,
    publicationType: "divina",
  });

  if (profile === "webPub") return true;
  // A webtoon is forced scrolled by the navigator, and the scrolled preference
  // is only submitted when the layout setting is used (see usePreferencesConfig)
  if (profile === "divina") return isManifestScrolled || (isDivinaLayoutUsed ? (divinaScrolled ?? false) : false);
  return (scroll || scriptMode === "cjk-vertical" || scriptMode === "mongolian-vertical") && !isFXL;
};
