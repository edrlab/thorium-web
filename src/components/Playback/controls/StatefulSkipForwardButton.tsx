"use client";

import ForwardIcon from "./assets/icons/forward_media.svg";
import Forward5Icon from "./assets/icons/forward_5.svg";
import Forward10Icon from "./assets/icons/forward_10.svg";
import Forward30Icon from "./assets/icons/forward_30.svg";
import SkipNextIcon from "./assets/icons/skip_next.svg";

import { StatefulActionIcon } from "../../Actions/Triggers/StatefulActionIcon";

import { useNavigator } from "@/core/Navigator";
import { useAppSelector } from "@/lib/hooks";
import { useI18n } from "@/i18n/useI18n";

const forwardIconMap: Record<number, React.ElementType> = {
  5: Forward5Icon,
  10: Forward10Icon,
  30: Forward30Icon,
};

export const StatefulSkipForwardButton = ({ className, isDisabled }: { className: string, isDisabled?: boolean }) => {
  const { t } = useI18n();
  const { playback } = useNavigator();
  const { skipForward } = playback;
  const isAudio = useAppSelector(state => state.reader.profile === "audio");
  const skipForwardInterval = useAppSelector(state => state.audioSettings.skipForwardInterval);

  const Icon = isAudio ? forwardIconMap[skipForwardInterval] ?? ForwardIcon : SkipNextIcon;
  const label = isAudio
    ? t("reader.playback.actions.skipForward.descriptive")
    : t("reader.actions.goToNextSentence.descriptive");

  return (
    <StatefulActionIcon
      onPress={ skipForward }
      isDisabled={ isDisabled }
      aria-label={ label }
      tooltipLabel={ label }
      className={ className }
    >
      <Icon aria-hidden="true" focusable="false" />
    </StatefulActionIcon>
  );
};
