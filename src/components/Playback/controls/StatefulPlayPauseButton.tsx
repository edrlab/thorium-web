"use client";

import { Ref, useCallback } from "react";

import PauseIcon from "./assets/icons/pause.svg";
import PlayIcon from "./assets/icons/play_arrow.svg";

import { StatefulActionIcon } from "../../Actions/Triggers/StatefulActionIcon";

import { useNavigator } from "@/core/Navigator";
import { usePlaybackStatus } from "../hooks/usePlaybackStatus";
import { useI18n } from "@/i18n/useI18n";

export const StatefulPlayPauseButton = ({ ref, id, className, isDisabled }: { ref?: Ref<HTMLButtonElement>, id?: string, className: string, isDisabled?: boolean }) => {
  const { t } = useI18n();
  const { playback } = useNavigator();
  const { play, pause } = playback;
  const { isPlaying } = usePlaybackStatus();

  const handlePress = useCallback(() => {
    if (isPlaying) {
      pause();
    } else {
      play();
    }
  }, [isPlaying, play, pause]);

  return (
    <StatefulActionIcon
      ref={ ref }
      id={ id }
      onPress={ handlePress }
      isDisabled={ isDisabled }
      aria-label={ isPlaying ? t("reader.playback.actions.pause") : t("reader.playback.actions.play") }
      tooltipLabel={ isPlaying ? t("reader.playback.actions.pause") : t("reader.playback.actions.play") }
      className={ className }
    >
      {isPlaying ? (
        <PauseIcon aria-hidden="true" focusable="false" />
      ) : (
        <PlayIcon aria-hidden="true" focusable="false" />
      )}
    </StatefulActionIcon>
  );
};
