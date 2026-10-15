"use client";

import { useMemo } from "react";

import { StatefulSettingsItemProps } from "../../../Settings/models/settings";

import { StatefulReadAlongLanguageVoice } from "./StatefulReadAlongLanguageVoice";

import { useI18n } from "@/i18n/useI18n";
import { getLanguageLabel } from "../../helpers/getLanguageLabel";
import { getVoiceLanguageKey } from "../../helpers/voicePreference";
import { useReadAlongLanguage } from "../../Hooks/useReadAlongLanguage";

import { useAppSelector } from "@/lib/hooks";

// A voice for each of the publication's other languages
export const StatefulReadAlongAdditionalVoices = ({ standalone = true }: StatefulSettingsItemProps) => {
  const { t, i18n } = useI18n();

  const mainLanguage = useReadAlongLanguage();
  const languages = useAppSelector(state => state.readAlongPlayer.metadata?.languages);

  const additionalLanguages = useMemo(() => {
    const keys = new Set([getVoiceLanguageKey(mainLanguage)]);
    return (languages ?? []).filter((language) => {
      const key = getVoiceLanguageKey(language);
      if (keys.has(key)) return false;
      keys.add(key);
      return true;
    });
  }, [languages, mainLanguage]);

  if (additionalLanguages.length === 0) return null;

  return (
    <>
    { additionalLanguages.map((language) => (
      <StatefulReadAlongLanguageVoice
        key={ language }
        standalone={ standalone }
        language={ language }
        label={ t("_pendingThoriumLocales.reader.readAlong.preferences.additionalVoices.label", { language: getLanguageLabel(language, i18n.language) }) }
      />
    )) }
    </>
  )
}
