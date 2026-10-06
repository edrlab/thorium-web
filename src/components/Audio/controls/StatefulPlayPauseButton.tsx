"use client";

import { useCallback } from "react";

import PauseIcon from "./assets/icons/pause.svg";
import PlayIcon from "./assets/icons/play_arrow.svg";

import { StatefulActionIcon } from "../../Actions/Triggers/StatefulActionIcon";
import audioStyles from "./assets/styles/thorium-web.audioPlayback.module.css";

import { useNavigator } from "@/core/Navigator";
import { useAppSelector } from "@/lib/hooks";
import { useI18n } from "@/i18n/useI18n";

export const StatefulPlayPauseButton = ({ isDisabled }: { isDisabled?: boolean }) => {
  const { t } = useI18n();
  const { readAloud, playback } = useNavigator();
  const { play, pause } = playback;
  const isPlaying = useAppSelector(state => readAloud 
    ? state.readAlongPlayer.status === "playing"
    : state.player.status === "playing"
  );

  const handlePress = useCallback(() => {
    if (isPlaying) {
      pause();
    } else {
      play();
    }
  }, [isPlaying, play, pause]);

  return (
    <StatefulActionIcon
      onPress={ handlePress }
      isDisabled={ isDisabled }
      aria-label={ isPlaying ? t("reader.playback.actions.pause") : t("reader.playback.actions.play") }
      tooltipLabel={ isPlaying ? t("reader.playback.actions.pause") : t("reader.playback.actions.play") }
      className={ audioStyles.audioPlayPauseButton }
    >
      {isPlaying ? (
        <PauseIcon aria-hidden="true" focusable="false" />
      ) : (
        <PlayIcon aria-hidden="true" focusable="false" />
      )}
    </StatefulActionIcon>
  );
};
