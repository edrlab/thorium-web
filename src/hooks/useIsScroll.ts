"use client";

import { useAppSelector } from "@/lib/hooks";

export const useIsScroll = (): boolean => {
  const profile = useAppSelector(state => state.reader.profile);
  const scroll = useAppSelector(state => state.settings.scroll);
  const divinaScrolled = useAppSelector(state => state.divinaSettings.scrolled);
  const isFXL = useAppSelector(state => state.publication.isFXL);
  const isManifestScrolled = useAppSelector(state => state.publication.isManifestScrolled);
  const scriptMode = useAppSelector(state => state.publication.scriptMode);

  if (profile === "webPub") return true;
  // A natively scrolled divina (webtoon) is forced scrolled by the navigator,
  // regardless of the user preference
  if (profile === "divina") return isManifestScrolled || (divinaScrolled ?? false);
  return (scroll || scriptMode === "cjk-vertical" || scriptMode === "mongolian-vertical") && !isFXL;
};
