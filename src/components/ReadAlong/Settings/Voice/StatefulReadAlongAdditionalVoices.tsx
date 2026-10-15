"use client";

import { useMemo } from "react";

import { StatefulSettingsItemProps } from "../../../Settings/models/settings";

import { StatefulDisclosure } from "../../../Settings/StatefulDisclosure";
import { StatefulReadAlongLanguageVoice } from "./StatefulReadAlongLanguageVoice";

import { useNavigator } from "@/core/Navigator";
import { useI18n } from "@/i18n/useI18n";
import { getLanguageLabel } from "../../helpers/getLanguageLabel";
import { getVoiceLanguageKey } from "../../helpers/voicePreference";
import { useReadAlongLanguage } from "../../Hooks/useReadAlongLanguage";

// A voice for each of the publication's other languages
export const StatefulReadAlongAdditionalVoices = ({ standalone = true }: StatefulSettingsItemProps) => {
  const { t, i18n } = useI18n();

  const readAloud = useNavigator().readAloud;
  const mainLanguage = useReadAlongLanguage();

  // The override replaces the declared language, as the navigator only loads voices for these
  const additionalLanguages = useMemo(() => {
    const keys = new Set([getVoiceLanguageKey(mainLanguage)]);
    return (readAloud?.getPublicationLanguages() ?? []).filter((language) => {
      const key = getVoiceLanguageKey(language);
      if (keys.has(key)) return false;
      keys.add(key);
      return true;
    });
  }, [readAloud, mainLanguage]);

  if (additionalLanguages.length === 0) return null;

  return (
    <StatefulDisclosure
      standalone={ standalone }
      label={ t("_pendingThoriumLocales.reader.readAlong.preferences.additionalVoices.title") }
    >
      { additionalLanguages.map((language) => (
        <StatefulReadAlongLanguageVoice
          key={ language }
          standalone={ true }
          language={ language }
          label={ getLanguageLabel(language, i18n.language) }
        />
      )) }
    </StatefulDisclosure>
  )
}
