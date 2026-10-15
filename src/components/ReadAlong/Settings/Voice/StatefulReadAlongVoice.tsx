"use client";

import { useCallback } from "react";

import { ReadiumSpeechVoice } from "@readium/navigator";

import { StatefulSettingsItemProps } from "../../../Settings/models/settings";

import { StatefulReadAlongLanguageVoice } from "./StatefulReadAlongLanguageVoice";

import { useI18n } from "@/i18n/useI18n";
import { getVoiceControls } from "../../helpers/getVoiceControls";
import { useReadAlongLanguage } from "../../Hooks/useReadAlongLanguage";

import { useAppDispatch } from "@/lib/hooks";
import { setReadAlongVoiceControls } from "@/lib/readAlongPlayerReducer";

export const StatefulReadAlongVoice = ({ standalone = true }: StatefulSettingsItemProps) => {
  const { t } = useI18n();

  const language = useReadAlongLanguage();
  const dispatch = useAppDispatch();

  // The highlights offered follow the publication's voice only
  const updateVoiceControls = useCallback((voice: ReadiumSpeechVoice) => {
    dispatch(setReadAlongVoiceControls(getVoiceControls(voice)));
  }, [dispatch]);

  return (
    <StatefulReadAlongLanguageVoice
      standalone={ standalone }
      language={ language }
      label={ t("_pendingThoriumLocales.reader.readAlong.preferences.voice.title") }
      onChange={ updateVoiceControls }
    />
  )
}
