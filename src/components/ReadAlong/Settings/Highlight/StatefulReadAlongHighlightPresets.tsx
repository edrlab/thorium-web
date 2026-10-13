"use client";

import { useMemo } from "react";

import { ThReadAlongHighlightPresetKeys } from "@/preferences/models";

import NoneIcon from "./assets/icons/format_color_reset.svg";
import HighlighterIcon from "./assets/icons/ink_highlighter.svg";
import SentenceIcon from "./assets/icons/short_text.svg";
import WordIcon from "./assets/icons/match_word.svg";
import MaskIcon from "./assets/icons/filter_center_focus.svg";
import TuneIcon from "../../../Settings/Spacing/assets/icons/tune.svg";

import { StatefulSettingsItemProps } from "../../../Settings/models/settings";

import { StatefulRadioGroup } from "../../../Settings/StatefulRadioGroup";

import { useNavigator } from "@/core/Navigator";
import { useI18n } from "@/i18n/useI18n";
import { useHighlightPresets } from "./hooks/useHighlightPresets";

import { useAppSelector } from "@/lib/hooks";

const iconMap = {
  [ThReadAlongHighlightPresetKeys.none]: NoneIcon,
  [ThReadAlongHighlightPresetKeys.sentenceAndWord]: HighlighterIcon,
  [ThReadAlongHighlightPresetKeys.sentence]: SentenceIcon,
  [ThReadAlongHighlightPresetKeys.word]: WordIcon,
  [ThReadAlongHighlightPresetKeys.mask]: MaskIcon,
  [ThReadAlongHighlightPresetKeys.custom]: TuneIcon
};

export const StatefulReadAlongHighlightPresets = ({ standalone }: StatefulSettingsItemProps) => {
  const { t } = useI18n();

  const readAloud = useNavigator().readAloud;
  const currentVoiceHasBoundaries = useAppSelector(state => state.readAlongPlayer.voiceControls.boundary);
  const { displayedPreset, presetKeys, requiresWordBoundaries, applyPreset } = useHighlightPresets();

  const items = useMemo(() => {
    return presetKeys.map((key) => ({
      id: key,
      icon: iconMap[key],
      value: key,
      label: t(`_pendingThoriumLocales.reader.readAlong.preferences.highlight.presets.${ key }`),
      isDisabled: !readAloud || (!currentVoiceHasBoundaries && requiresWordBoundaries(key))
    }));
  }, [presetKeys, readAloud, currentVoiceHasBoundaries, requiresWordBoundaries, t]);

  if (items.length === 0) {
    return null;
  }

  return (
    <>
    <StatefulRadioGroup
      standalone={ standalone }
      label={ t("_pendingThoriumLocales.reader.readAlong.preferences.highlight.presets.title") }
      orientation="horizontal"
      value={ displayedPreset }
      onChange={ async (val: string) => await applyPreset(val as ThReadAlongHighlightPresetKeys) }
      items={ items }
    />
    </>
  );
}
