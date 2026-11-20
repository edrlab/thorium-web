"use client";

import ReplayIcon from "./assets/icons/replay.svg";
import Replay5Icon from "./assets/icons/replay_5.svg";
import Replay10Icon from "./assets/icons/replay_10.svg";
import Replay30Icon from "./assets/icons/replay_30.svg";
import SkipPreviousIcon from "./assets/icons/skip_previous.svg";

import { StatefulActionIcon } from "../../Actions/Triggers/StatefulActionIcon";

import { useNavigator } from "@/core/Navigator";
import { useAppSelector } from "@/lib/hooks";
import { useI18n } from "@/i18n/useI18n";

const replayIconMap: Record<number, React.ElementType> = {
  5: Replay5Icon,
  10: Replay10Icon,
  30: Replay30Icon,
};

export const StatefulSkipBackwardButton = ({ className, isDisabled }: { className: string, isDisabled?: boolean }) => {
  const { t } = useI18n();
  const { playback } = useNavigator();
  const { skipBackward } = playback;
  const isAudio = useAppSelector(state => state.reader.profile === "audio");
  const skipBackwardInterval = useAppSelector(state => state.audioSettings.skipBackwardInterval);

  const Icon = isAudio ? replayIconMap[skipBackwardInterval] ?? ReplayIcon : SkipPreviousIcon;
  const label = isAudio
    ? t("reader.playback.actions.skipBackward.descriptive")
    : t("reader.actions.goToPreviousSentence.descriptive");

  return (
    <StatefulActionIcon
      onPress={ skipBackward }
      isDisabled={ isDisabled }
      aria-label={ label }
      tooltipLabel={ label }
      className={ className }
    >
      <Icon aria-hidden="true" focusable="false" />
    </StatefulActionIcon>
  );
};
