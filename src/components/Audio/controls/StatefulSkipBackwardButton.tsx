"use client";

import ReplayIcon from "./assets/icons/replay.svg";
import Replay5Icon from "./assets/icons/replay_5.svg";
import Replay10Icon from "./assets/icons/replay_10.svg";
import Replay30Icon from "./assets/icons/replay_30.svg";
import SkipPreviousIcon from "./assets/icons/skip_previous.svg";

import { StatefulActionIcon } from "../../Actions/Triggers/StatefulActionIcon";
import audioStyles from "./assets/styles/thorium-web.audioPlayback.module.css";

import { useNavigator } from "@/core/Navigator";
import { useAppSelector } from "@/lib/hooks";
import { useI18n } from "@/i18n/useI18n";

const replayIconMap: Record<number, React.ElementType> = {
  5: Replay5Icon,
  10: Replay10Icon,
  30: Replay30Icon,
};

export const StatefulSkipBackwardButton = ({ isDisabled }: { isDisabled?: boolean }) => {
  const { t } = useI18n();
  const { readAloud, playback } = useNavigator();
  const { skipBackward } = playback;
  const skipBackwardInterval = useAppSelector(state => state.audioSettings.skipBackwardInterval);

  const Icon = readAloud ? SkipPreviousIcon : replayIconMap[skipBackwardInterval] ?? ReplayIcon;
  const label = readAloud 
    ? t("reader.actions.goToPreviousSentence.descriptive") 
    : t("reader.playback.actions.skipBackward.descriptive");

  return (
    <StatefulActionIcon
      onPress={ skipBackward }
      isDisabled={ isDisabled }
      aria-label={ label }
      tooltipLabel={ label }
      className={ audioStyles.audioSkipBackwardButton }
    >
      <Icon aria-hidden="true" focusable="false" />
    </StatefulActionIcon>
  );
};
