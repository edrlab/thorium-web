"use client";

import { useMemo } from "react";

import { ThReadAlongProsodyPresetKeys } from "@/preferences/models";

import DefaultIcon from "./assets/icons/directions_walk.svg";
import SlowIcon from "./assets/icons/hiking.svg";
import FastIcon from "./assets/icons/sprint.svg";
import AutoPauseIcon from "./assets/icons/follow_the_signs.svg";
import TuneIcon from "../../../Settings/Spacing/assets/icons/tune.svg";

import { StatefulSettingsItemProps } from "../../../Settings/models/settings";

import { StatefulRadioGroup } from "../../../Settings/StatefulRadioGroup";

import { useNavigator } from "@/core/Navigator";
import { useI18n } from "@/i18n/useI18n";
import { useIsScroll } from "@/hooks/useIsScroll";
import { useProsodyPresets } from "./hooks/useProsodyPresets";

const iconMap = {
  [ThReadAlongProsodyPresetKeys.default]: DefaultIcon,
  [ThReadAlongProsodyPresetKeys.slow]: SlowIcon,
  [ThReadAlongProsodyPresetKeys.fast]: FastIcon,
  [ThReadAlongProsodyPresetKeys.autoPause]: AutoPauseIcon,
  [ThReadAlongProsodyPresetKeys.custom]: TuneIcon
};

export const StatefulReadAlongProsodyPresets = ({ standalone }: StatefulSettingsItemProps) => {
  const { t } = useI18n();

  const readAloud = useNavigator().readAloud;
  const isScroll = useIsScroll();
  const { preset, presetKeys, requiresPages, applyPreset } = useProsodyPresets();

  const items = useMemo(() => {
    return presetKeys.map((key) => ({
      id: key,
      icon: iconMap[key],
      value: key,
      label: t(`_pendingThoriumLocales.reader.readAlong.preferences.prosody.presets.${ key }`),
      isDisabled: !readAloud || (isScroll && requiresPages(key))
    }));
  }, [presetKeys, readAloud, isScroll, requiresPages, t]);

  if (items.length === 0) {
    return null;
  }

  return (
    <>
    <StatefulRadioGroup
      standalone={ standalone }
      label={ t("_pendingThoriumLocales.reader.readAlong.preferences.prosody.presets.title") }
      orientation="horizontal"
      value={ preset }
      onChange={ async (val: string) => await applyPreset(val as ThReadAlongProsodyPresetKeys) }
      items={ items }
    />
    </>
  );
}
